import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import { InternalLinkItem, SeoLandingResponse } from '../models';
import { httpGetWithSeo404Fallback } from '../seo-http-404-retry';
import { seoPublicApiRoot } from '../seo-public-api-root';

const US_STATE_CODE_TO_NAME_SLUG: Record<string, string> = {
  AL: 'alabama',
  AK: 'alaska',
  AZ: 'arizona',
  AR: 'arkansas',
  CA: 'california',
  CO: 'colorado',
  CT: 'connecticut',
  DE: 'delaware',
  FL: 'florida',
  GA: 'georgia',
  HI: 'hawaii',
  ID: 'idaho',
  IL: 'illinois',
  IN: 'indiana',
  IA: 'iowa',
  KS: 'kansas',
  KY: 'kentucky',
  LA: 'louisiana',
  ME: 'maine',
  MD: 'maryland',
  MA: 'massachusetts',
  MI: 'michigan',
  MN: 'minnesota',
  MS: 'mississippi',
  MO: 'missouri',
  MT: 'montana',
  NE: 'nebraska',
  NV: 'nevada',
  NH: 'new-hampshire',
  NJ: 'new-jersey',
  NM: 'new-mexico',
  NY: 'new-york',
  NC: 'north-carolina',
  ND: 'north-dakota',
  OH: 'ohio',
  OK: 'oklahoma',
  OR: 'oregon',
  PA: 'pennsylvania',
  RI: 'rhode-island',
  SC: 'south-carolina',
  SD: 'south-dakota',
  TN: 'tennessee',
  TX: 'texas',
  UT: 'utah',
  VT: 'vermont',
  VA: 'virginia',
  WA: 'washington',
  WV: 'west-virginia',
  WI: 'wisconsin',
  WY: 'wyoming',
};

export type SeoLandingResult =
  | SeoLandingResponse
  | { error: boolean; status?: number; message?: string };

interface LandingSeoCopyApiResponse {
  status?: boolean;
  data?: {
    intro_content?: string;
    about_intro?: string;
    h1?: string;
    meta_title?: string;
    meta_description?: string;
  };
}

const ABOUT_INTRO_MAX_LEN = 250;

function truncateAboutIntro(text: string, maxLen = ABOUT_INTRO_MAX_LEN): string {
  const s = (text || '').trim();
  if (s.length <= maxLen) {
    return s;
  }
  if (maxLen <= 3) {
    return s.slice(0, maxLen);
  }
  let cut = s.slice(0, maxLen - 3).trimEnd();
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > maxLen / 2) {
    cut = cut.slice(0, lastSpace);
  }
  return cut.replace(/[.,;:-]+$/, '') + '...';
}

function slugToDisplay(slug: string): string {
  if (!slug) {
    return '';
  }
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Converts US state code (`AK`) or full-name slug (`alaska`) to full-name slug. */
function normalizeStateSlug(stateSlug: string): string {
  const raw = (stateSlug || '').trim();
  if (!raw) {
    return '';
  }
  const upper = raw.toUpperCase();
  if (US_STATE_CODE_TO_NAME_SLUG[upper]) {
    return US_STATE_CODE_TO_NAME_SLUG[upper];
  }
  return raw.toLowerCase();
}

/** Search state label expected by listing API (`Alaska`), regardless of URL slug shape. */
function slugToStateSearchLabel(stateSlug: string): string {
  const normalized = normalizeStateSlug(stateSlug);
  if (!normalized) {
    return '';
  }
  return slugToDisplay(normalized);
}

/** Human location line for H1/meta: city+state, state-only, or US-wide. */
function buildGeoLocationLabel(cityLabel: string, stateLabel: string): string {
  const city = (cityLabel || '').trim();
  const state = (stateLabel || '').trim();
  if (city && state) {
    return `${city}, ${state}`;
  }
  if (state) {
    return state;
  }
  if (city) {
    return city;
  }
  return 'the United States';
}

/** Canonical `/usa/...` path for country-, state-, or city-level SEO URLs. */
function buildUsaCanonicalPath(
  categorySlug: string,
  stateSlug: string,
  citySlug: string,
  subcategorySlug?: string
): string {
  const cat = (categorySlug || '').trim();
  const st = (stateSlug || '').trim();
  const ct = (citySlug || '').trim();
  const parts: string[] = ['/usa'];
  if (st && ct) {
    parts.push(st, ct, cat);
  } else if (st) {
    parts.push(st, cat);
  } else {
    parts.push(cat);
  }
  const sub = (subcategorySlug || '').trim();
  if (sub) {
    parts.push(sub);
  }
  return parts.join('/');
}

function appendUrlQuery(path: string, params: Record<string, string>): string {
  const entries = Object.entries(params).filter(([, v]) => (v || '').trim() !== '');
  if (!entries.length) {
    return path;
  }
  const qs = new URLSearchParams();
  for (const [k, v] of entries) {
    qs.set(k, v.trim());
  }
  return `${path}?${qs.toString()}`;
}

@Injectable()
export class SeoLandingService {
  private readonly base =
    environment.base_url?.endsWith('/') ? environment.base_url : `${environment.base_url}/`;

  /** Always canonical ``…/api/seo/``; on 404 nginx quirk retry ``…/api/api/seo/`` (see ``seo-http-404-retry``). */
  private readonly seoApiBase = seoPublicApiRoot(environment.base_url, false);

  private readonly siteOrigin = (
    environment as { siteOrigin?: string }
  ).siteOrigin?.replace(/\/$/, '') || '';

  constructor(private http: HttpClient) {}

  /**
   * Builds SEO landing payload from existing API routes (no `/seo/page-data` backend required).
   */
  getPageData(payload: {
    categorySlug: string;
    citySlug: string;
    stateSlug: string;
    subcategorySlug?: string | null;
    page?: number;
    keyword?: string;
    zip?: string | null;
  }): Observable<SeoLandingResult> {
    const page = payload.page && payload.page > 0 ? payload.page : 1;
    const pageSize = 20;
    const normalizedStateSlug = normalizeStateSlug(payload.stateSlug || '');
    const stateLabel = slugToStateSearchLabel(payload.stateSlug || '');
    const cityLabel = payload.citySlug ? slugToDisplay(payload.citySlug) : '';
    const locationLabel = buildGeoLocationLabel(cityLabel, stateLabel);

    const catUrl = `${this.seoApiBase}categories/${encodeURIComponent(payload.categorySlug)}`;

    let listingParams = new HttpParams()
      .set('country', 'US')
      .set('category_slug', payload.categorySlug)
      .set('page', String(page))
      .set('page_size', String(pageSize));

    if (stateLabel) {
      listingParams = listingParams.set('state', stateLabel);
    }
    if (cityLabel) {
      listingParams = listingParams.set('city', cityLabel);
    }

    if (payload.subcategorySlug) {
      listingParams = listingParams.set('subcategory_slug', payload.subcategorySlug);
    }

    const zip = (payload.zip ?? '').trim();
    if (zip) {
      listingParams = listingParams.set('zip', zip);
    }

    const listingsUrl = `${this.base}searchallListing`;

    let seoCopyParams = new HttpParams()
      .set('category_slug', payload.categorySlug)
      .set('country', 'usa');
    if (payload.subcategorySlug) {
      seoCopyParams = seoCopyParams.set('subcategory_slug', payload.subcategorySlug);
    }
    if (stateLabel) {
      seoCopyParams = seoCopyParams
        .set('state', stateLabel)
        .set('state_slug', normalizedStateSlug);
    }
    if (payload.citySlug) {
      seoCopyParams = seoCopyParams
        .set('city', cityLabel)
        .set('city_slug', payload.citySlug);
    }
    if (zip) {
      seoCopyParams = seoCopyParams.set('zip', zip);
    }

    const seoCopyUrl = `${this.seoApiBase}landing-seo-copy`;

    return forkJoin({
      cat: httpGetWithSeo404Fallback<
        { status?: boolean; data?: Record<string, unknown>; message?: string }
      >(this.http, catUrl).pipe(
        timeout(10000),
        catchError((err) =>
          of({
            status: false,
            message: err?.error?.message || err?.message || 'Category request failed',
          })
        )
      ),
      listings: this.http
        .get<{
          status?: boolean;
          data?: Record<string, unknown>[];
          pagination?: Record<string, unknown>;
          message?: string;
        }>(listingsUrl, { params: listingParams })
        .pipe(
          timeout(15000),
          retry(1),
          catchError((err) =>
            of({
              status: false,
              message: err?.error?.message || err?.message || 'Listings request failed',
            })
          )
        ),
      seoCopy: httpGetWithSeo404Fallback<LandingSeoCopyApiResponse>(
        this.http,
        seoCopyUrl,
        { params: seoCopyParams }
      ).pipe(
        timeout(8000),
        catchError(() => of<LandingSeoCopyApiResponse>({ status: false }))
      ),
    }).pipe(
      map(({ cat, listings, seoCopy }) => {
        const catFail = cat as { status?: boolean; data?: Record<string, unknown>; message?: string };
        const listRes = listings as {
          status?: boolean;
          data?: Record<string, unknown>[];
          pagination?: Record<string, unknown>;
          message?: string;
        };

        if (catFail?.status === false || !catFail?.data) {
          return {
            error: true,
            status: 404,
            message:
              catFail?.message ||
              'Category not found or SEO API unavailable.',
          } satisfies SeoLandingResult;
        }

        const c = catFail.data as Record<string, unknown>;
        const subs = (c['subcategories'] as Record<string, unknown>[]) || [];
        let subMeta: Record<string, unknown> | null = null;
        if (payload.subcategorySlug) {
          subMeta =
            subs.find(
              (s) =>
                String(s['slug'] || '').toLowerCase() ===
                payload.subcategorySlug!.toLowerCase()
            ) || null;
          if (!subMeta) {
            return {
              error: true,
              status: 404,
              message: 'Subcategory not found for this category.',
            } satisfies SeoLandingResult;
          }
        }

        const listingOk = listRes?.status !== false && Array.isArray(listRes?.data);
        const listingRows = listingOk ? (listRes.data as Record<string, unknown>[]) : [];
        const pag = (listingOk ? listRes.pagination : {}) as Record<string, unknown>;
        const totalRecords = Number(pag['total_records'] ?? listingRows.length) || 0;
        const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

        const categoryName = String(c['name'] || payload.categorySlug);
        const categorySlugOut = String(c['slug'] || payload.categorySlug);
        const subName = subMeta ? String(subMeta['name'] || '') : '';
        const subSlugOut = subMeta ? String(subMeta['slug'] || '') : '';

        const baseUsaPath = buildUsaCanonicalPath(
          payload.categorySlug,
          normalizedStateSlug,
          payload.citySlug || '',
          undefined
        );
        const canonicalPath = buildUsaCanonicalPath(
          payload.categorySlug,
          normalizedStateSlug,
          payload.citySlug || '',
          payload.subcategorySlug && subSlugOut ? subSlugOut : undefined
        );
        const zipTrim = zip;
        const queryForUrl: Record<string, string> = {};
        if (page > 1) {
          queryForUrl['page'] = String(page);
        }
        if (zipTrim) {
          queryForUrl['zip'] = zipTrim;
        }
        let canonical_url = `${this.siteOrigin || ''}${appendUrlQuery(canonicalPath, queryForUrl)}`;

        const seoCopyRes = seoCopy as LandingSeoCopyApiResponse;
        const copy =
          seoCopyRes.status !== false && seoCopyRes.data
            ? seoCopyRes.data
            : null;

        const taxonomyIntro =
          (subMeta &&
            (String(subMeta['intro_content'] || '') ||
              String(subMeta['ai_intro'] || ''))) ||
          String(c['intro_content'] || '') ||
          String(c['ai_intro'] || '') ||
          '';

        const defaultH1 = subName
          ? `${subName} in ${locationLabel}`
          : `${categoryName} in ${locationLabel}`;

        const defaultMetaTitle = subName
          ? `${subName} in ${locationLabel} | ${categoryName}`
          : `${categoryName} in ${locationLabel} | Global Business Pages`;

        const defaultMetaDesc = `Browse ${subName || categoryName} businesses in ${locationLabel}.`;

        const intro =
          String(copy?.intro_content || '').trim() ||
          taxonomyIntro ||
          `Browse ${subName || categoryName} businesses in ${locationLabel}.`;

        const h1 =
          String(copy?.h1 || '').trim() ||
          (subMeta && String(subMeta['h1_override'] || '')) ||
          String(c['h1_override'] || '') ||
          defaultH1;

        const metaTitle =
          String(copy?.meta_title || '').trim() ||
          (subMeta && String(subMeta['seo_title_override'] || '')) ||
          String(c['seo_title_override'] || '') ||
          defaultMetaTitle;

        const metaDesc =
          String(copy?.meta_description || '').trim() ||
          (subMeta && String(subMeta['meta_description_override'] || '')) ||
          String(c['meta_description_override'] || '') ||
          defaultMetaDesc;

        const aboutIntro =
          String(copy?.about_intro || '').trim() || truncateAboutIntro(intro);

        const subLinkQuery: Record<string, string> = zipTrim ? { zip: zipTrim } : {};
        const internal_subcategories: InternalLinkItem[] = subs.map((s) => ({
          label: String(s['name'] || s['slug']),
          slug: String(s['slug'] || ''),
          url: appendUrlQuery(
            `${baseUsaPath}/${String(s['slug'] || '')}`,
            subLinkQuery
          ),
        }));

        const relatedRaw =
          (c['related_categories'] as Record<string, unknown>[]) || [];
        const related_categories: InternalLinkItem[] = relatedRaw.map((r) => ({
          label: String(r['name'] || r['slug']),
          slug: String(r['slug'] || ''),
          url: buildUsaCanonicalPath(
            String(r['slug'] || ''),
            normalizedStateSlug,
            payload.citySlug || ''
          ),
        }));

        let sibling_subcategories: InternalLinkItem[] = [];
        if (payload.subcategorySlug && subs.length) {
          sibling_subcategories = subs
            .filter(
              (s) =>
                String(s['slug']).toLowerCase() !== payload.subcategorySlug!.toLowerCase()
            )
            .map((s) => ({
              label: String(s['name'] || s['slug']),
              slug: String(s['slug'] || ''),
              url: appendUrlQuery(
                `${baseUsaPath}/${String(s['slug'] || '')}`,
                subLinkQuery
              ),
            }));
        }

        const breadcrumbs: { label: string; url: string }[] = [
          { label: 'Home', url: '/' },
          { label: 'USA', url: '/' },
        ];
        if (normalizedStateSlug) {
          breadcrumbs.push({
            label: stateLabel || normalizedStateSlug,
            url: buildUsaCanonicalPath(
              payload.categorySlug,
              normalizedStateSlug,
              ''
            ),
          });
        }
        if (payload.citySlug) {
          breadcrumbs.push({
            label: cityLabel || payload.citySlug,
            url: buildUsaCanonicalPath(
              payload.categorySlug,
              normalizedStateSlug,
              payload.citySlug
            ),
          });
        }
        breadcrumbs.push({
          label: categoryName,
          url: baseUsaPath,
        });
        if (subName) {
          breadcrumbs.push({
            label: subName,
            url: appendUrlQuery(`${baseUsaPath}/${subSlugOut}`, subLinkQuery),
          });
        }

        const vm: SeoLandingResponse = {
          seo: {
            meta_title: metaTitle,
            meta_description: metaDesc,
            h1,
            intro_content: intro,
            about_intro: aboutIntro,
            canonical_url,
            pagination_base_url: `${this.siteOrigin || ''}${canonicalPath}`,
          },
          category: { name: categoryName, slug: categorySlugOut },
          subcategory:
            subMeta && subSlugOut ? { name: subName, slug: subSlugOut } : null,
          breadcrumbs,
          listings: listingRows,
          pagination: {
            total_results: totalRecords,
            current_page: page,
            total_pages: totalPages,
            page_size: pageSize,
          },
          internal_links: {
            subcategories: internal_subcategories,
            related_categories,
            sibling_subcategories,
          },
          keyword_applied: payload.keyword?.trim() || null,
          city: payload.citySlug
            ? { slug: payload.citySlug, label: cityLabel }
            : undefined,
          state: normalizedStateSlug
            ? { slug: normalizedStateSlug, label: stateLabel }
            : undefined,
          country: { slug: 'usa', label: 'United States' },
          site_origin: this.siteOrigin || undefined,
        };

        if (!listingOk) {
          vm.listings = [];
          vm.pagination = {
            total_results: 0,
            current_page: page,
            total_pages: 1,
            page_size: pageSize,
          };
        }

        return vm;
      })
    );
  }

  /** Public taxonomy for home/search UI. */
  getCategoriesCatalog(): Observable<{ data: unknown } | { error: boolean }> {
    return httpGetWithSeo404Fallback<{ status?: boolean; data?: unknown }>(
      this.http,
      `${this.seoApiBase}categories`
    ).pipe(
      timeout(5000),
      map((res) =>
        res?.status !== false && res?.data !== undefined
          ? { data: res.data }
          : { error: true }
      ),
      catchError(() => of({ error: true }))
    );
  }
}
