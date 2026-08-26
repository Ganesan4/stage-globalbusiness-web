import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, switchMap, tap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { InternalLinkGroup, SeoLandingResponse } from '../../models';
import { SeoLandingService } from '../../services/seo-landing.service';
import { SeoMetaService, groupsFromResponse } from '../../services/seo-meta.service';
import { WebService } from '../../../services/web.service';

/** Rows from `GET /topcategory` (same shape as location-listing carousel). */
export interface TopCategoryRow {
  id?: number | string;
  category: string;
  icon: string;
}

@Component({
  selector: 'gbp-seo-landing-page',
  standalone: false,
  templateUrl: './seo-landing-page.component.html',
  styleUrls: ['./seo-landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeoLandingPageComponent implements OnInit, OnDestroy {
  vm: SeoLandingResponse | null = null;
  linkGroups: InternalLinkGroup[] = [];
  loading = true;
  error: string | null = null;

  /** Route segments for “classic directory” / homepage links */
  stateSlug = '';
  citySlug = '';
  categorySlug = '';

  /** Same carousel as classic location-listing (GET /topcategory). */
  topCategories: TopCategoryRow[] = [];
  readonly slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: true,
    dots: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  /** Mirrors location-listing logo fallbacks for card thumbnails. */
  readonly fallbackImages = [
    'assets/img/preview1.jpg',
    'assets/img/preview3.jpg',
    'assets/img/preview4.jpg',
    'assets/img/preview5.jpg',
    'assets/img/preview6.jpg',
  ];

  private readonly apiBase = (environment.base_url || '').replace(/\/+$/, '');

  readonly trackByListing = (index: number, row: Record<string, unknown>): string =>
    String(row['_index'] ?? row['_id'] ?? row['id'] ?? row['business_name'] ?? row['company_name'] ?? index);

  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private seoApi: SeoLandingService,
    private seoMeta: SeoMetaService,
    private cdr: ChangeDetectorRef,
    private web: WebService
  ) {}

  ngOnInit(): void {
    this.loadTopCategories();

    const parent = this.route.parent;
    if (!parent) {
      this.error = 'Routing misconfiguration.';
      this.loading = false;
      return;
    }

    combineLatest([
      this.seoRouteParams$(),
      this.route.queryParamMap.pipe(
        map((qm) => ({
          page: this.parsePage(qm),
          zip: (qm.get('zip') ?? '').trim(),
        }))
      ),
    ])
      .pipe(
        tap(([geo]) => {
          this.loading = true;
          this.error = null;
          this.stateSlug = geo.stateSlug;
          this.citySlug = geo.citySlug;
          this.categorySlug = geo.categorySlug;
          this.cdr.markForCheck();
        }),
        switchMap(([geo, q]) =>
          this.seoApi.getPageData({
            categorySlug: geo.categorySlug,
            citySlug: geo.citySlug,
            stateSlug: geo.stateSlug,
            subcategorySlug: geo.subcategorySlug || undefined,
            page: q.page,
            zip: q.zip ? q.zip : undefined,
          })
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (payload) => this.consumePayload(payload),
        error: () => {
          this.loading = false;
          this.vm = null;
          this.linkGroups = [];
          this.error = 'Unable to load listings.';
          this.cdr.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.seoMeta.clearPageMeta();
    this.seoMeta.clearPaginationLinks();
  }

  listingName(record: Record<string, unknown>): string {
    return (
      (record['business_name'] as string) ||
      (record['company_name'] as string) ||
      (record['name'] as string) ||
      'Business listing'
    );
  }

  /** Primary image field used on listing cards (same sources as classic directory). */
  listingImageSrc(record: Record<string, unknown>): string | null {
    const raw =
      (record['logo'] as string) ||
      (record['image_path'] as string) ||
      (record['image'] as string) ||
      '';
    return raw ? String(raw).trim() : null;
  }

  processImage(image: string): string {
    if (!image) {
      return 'assets/img/no_preview.png';
    }
    const prefixes = [
      'data:image/png;base64,data:image/png;base64,',
      'data:image/png;base64,data:image/jpeg;base64,',
      'data:image/png;base64,data:image/webp;base64,',
    ];
    for (const prefix of prefixes) {
      if (image.startsWith(prefix)) {
        return image.replace(prefix, prefix.split(',')[0] + ',');
      }
    }
    if (/^(https?:)?\/\//i.test(image) || image.startsWith('data:') || image.startsWith('assets/')) {
      return image;
    }
    return `${this.apiBase}/${image.replace(/^\/+/, '')}`;
  }

  getFallbackImage(index: number): string {
    return this.fallbackImages[index % this.fallbackImages.length];
  }

  /** Location line for About block and FAQs from current geo depth. */
  geoAboutLabel(page: SeoLandingResponse): string {
    const city = page.city?.label?.trim();
    const state = page.state?.label?.trim();
    if (city && state) {
      return `${city}, ${state}`;
    }
    if (state) {
      return state;
    }
    if (city) {
      return city;
    }
    return page.country?.label?.trim() || 'the United States';
  }

  /** About paragraph (max 250 chars for long DB intros). */
  aboutIntroText(page: SeoLandingResponse): string {
    const fromApi = (page.seo?.about_intro || '').trim();
    if (fromApi) {
      return fromApi;
    }
    const intro = (page.seo?.intro_content || '').trim();
    if (intro) {
      return this.truncateAboutIntro(intro);
    }
    return (
      `${this.geoAboutLabel(page)} features many professional ` +
      `${page.category?.name || 'local'} businesses serving residential and commercial customers. ` +
      'Global Business Pages helps visitors find verified listings.'
    );
  }

  private truncateAboutIntro(text: string, maxLen = 250): string {
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

  formatListingTitle(value: string | null | undefined): string {
    if (!value) {
      return 'N/A';
    }
    const text = value.replace(/-/g, ' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  listingIndustryLine(record: Record<string, unknown>): string {
    const industry = record['industry'] as string | undefined;
    if (industry && industry.toLowerCase() !== 'nan') {
      return industry;
    }
    return (
      (record['sic_description'] as string) ||
      (record['category'] as string) ||
      ''
    );
  }

  goRegister(): void {
    void this.router.navigate(['/register']);
  }

  readonly trackByTopCategory = (_: number, row: TopCategoryRow): string =>
    String(row.category ?? '') + String(row.icon ?? '') + String(row.id ?? '');

  private loadTopCategories(): void {
    this.web
      .getData('topcategory')
      .then((res: { data?: TopCategoryRow[] }) => {
        this.topCategories = Array.isArray(res?.data) && res!.data!.length ? res!.data! : [];
        this.cdr.markForCheck();
      })
      .catch(() => {
        this.topCategories = [];
        this.cdr.markForCheck();
      });
  }

  listingWebsiteHref(record: Record<string, unknown>): string {
    const w = record['website'];
    if (!w || typeof w !== 'string') {
      return '';
    }
    const s = w.trim();
    if (!s) {
      return '';
    }
    return /^(https?:)?\/\//i.test(s) ? s : `https://${s}`;
  }

  private consumePayload(payload: SeoLandingResponse | { error: boolean; message?: string }): void {
    this.loading = false;

    if ('error' in payload && payload.error) {
      this.vm = null;
      this.linkGroups = [];
      this.error = payload.message || 'Unexpected error.';
      this.cdr.markForCheck();
      return;
    }

    const response = payload as SeoLandingResponse;

    // Guard empty taxonomy response
    if (!response.category && !response.seo?.h1) {
      this.error = 'Incomplete SEO payload.';
      this.vm = null;
      this.linkGroups = [];
      this.cdr.markForCheck();
      return;
    }

    this.error = null;
    this.vm = response;
    this.linkGroups = groupsFromResponse(response);

    const breadcrumbs =
      response.breadcrumbs?.map((crumb) => ({
        label: crumb.label,
        url: crumb.url,
      })) ?? [];

    this.seoMeta.setPageMeta({
      metaTitle: response.seo.meta_title ?? '',
      metaDescription: response.seo.meta_description ?? '',
      h1: response.seo.h1 ?? '',
      canonicalUrl: response.seo.canonical_url ?? '',
      breadcrumbs,
      category: response.category?.name,
      subcategory: response.subcategory?.name,
      city: response.city?.label ?? '',
      state: response.state?.label ?? '',
      country: response.country?.label ?? 'United States',
      introContent: response.seo.intro_content ?? '',
      listings: response.listings ?? [],
      siteOrigin: response.site_origin ?? '',
    });

    this.syncPaginationHead(response);
    this.cdr.markForCheck();
  }

  private syncPaginationHead(payload: SeoLandingResponse): void {
    const current = payload.pagination?.current_page ?? 1;
    const total =
      typeof payload.pagination?.total_pages === 'number' &&
      !Number.isNaN(payload.pagination?.total_pages)
        ? payload.pagination!.total_pages!
        : 1;

    const canonicalRoot = payload.seo?.canonical_url ?? '';
    if (!canonicalRoot) {
      this.seoMeta.setPaginationLinks(null, null);
      return;
    }

    const sanitized = canonicalRoot.split('?')[0];
    const hrefFor = (page: number): string =>
      page <= 1 ? sanitized : `${sanitized}?page=${page}`;

    this.seoMeta.setPaginationLinks(
      current > 1 ? hrefFor(current - 1) : null,
      current < total ? hrefFor(current + 1) : null
    );
  }

  /** Collect state/city/category/subcategory from this route and all parents (flat + nested USA URLs). */
  private seoRouteParams$(): Observable<{
    categorySlug: string;
    citySlug: string;
    stateSlug: string;
    subcategorySlug: string;
  }> {
    const chain: ActivatedRoute[] = [];
    let r: ActivatedRoute | null = this.route;
    while (r) {
      chain.push(r);
      r = r.parent;
    }
    return combineLatest(chain.map((node) => node.paramMap)).pipe(
      map(() => this.readSeoRouteParamsFromSnapshot())
    );
  }

  private readSeoRouteParamsFromSnapshot(): {
    categorySlug: string;
    citySlug: string;
    stateSlug: string;
    subcategorySlug: string;
  } {
    let categorySlug = '';
    let citySlug = '';
    let stateSlug = '';
    let subcategorySlug = '';
    let r: ActivatedRoute | null = this.route;
    while (r) {
      const pm = r.snapshot.paramMap;
      if (!subcategorySlug) {
        subcategorySlug = this.read(pm, 'subcategory');
      }
      if (!categorySlug) {
        categorySlug = this.read(pm, 'category');
      }
      if (!citySlug) {
        citySlug = this.read(pm, 'city');
      }
      if (!stateSlug) {
        stateSlug = this.read(pm, 'state');
      }
      r = r.parent;
    }
    return { categorySlug, citySlug, stateSlug, subcategorySlug };
  }

  private read(map: ParamMap, key: string): string {
    return (map.get(key) ?? '').trim();
  }

  private parsePage(map: ParamMap): number {
    let pageNum = Number(map.get('page') ?? '1');
    if (!pageNum || pageNum < 1 || Number.isNaN(pageNum)) {
      pageNum = 1;
    }
    return pageNum;
  }
}
