import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { InternalLinkGroup, SeoLandingResponse } from '../models';

export interface SeoMetaDataPayload {
  metaTitle: string;
  metaDescription: string;
  /** Page H1 / headline — used for fallbacks when meta fields are empty */
  h1: string;
  canonicalUrl: string;
  breadcrumbs: { label: string; url: string }[];
  category?: string;
  subcategory?: string;
  city: string;
  state: string;
  country?: string;
  /** Intro paragraph from API (`seo_page_content` / AI) for description fallback */
  introContent?: string;
  /** Visible listings on this page — drives ItemList + LocalBusiness JSON-LD */
  listings?: Record<string, unknown>[];
  /** e.g. https://example.com — unused for JSON-LD URLs when website exists on row */
  siteOrigin?: string;
}

@Injectable()
export class SeoMetaService {
  private readonly seoScriptMarker = 'data-seo-managed';

  constructor(
    private meta: Meta,
    private title: Title,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  /** Hydrates `<head>` for SEO landing pages only. */
  setPageMeta(data: SeoMetaDataPayload): void {
    try {
      const cat = (data.category || '').trim() || 'Business directory';
      const sub = (data.subcategory || '').trim();
      const city = (data.city || '').trim();
      const state = (data.state || '').trim();
      const country = (data.country || '').trim() || 'the United States';
      const locSuffix = city && state
        ? `${city}, ${state}`
        : state
          ? state
          : city
            ? city
            : country;

      let metaTitle = (data.metaTitle || '').trim();
      if (!metaTitle) {
        const core = sub ? `${cat} — ${sub} in ${locSuffix}` : `${cat} in ${locSuffix}`;
        metaTitle = `${core} | Global Business Pages`;
      }

      let metaDesc = (data.metaDescription || '').trim();
      if (!metaDesc) {
        const intro = (data.introContent || '').trim();
        if (intro) {
          metaDesc = intro.length > 160 ? intro.slice(0, 157) + '…' : intro;
        } else {
          const h1f = (data.h1 || '').trim();
          if (h1f) {
            metaDesc = h1f.length > 160 ? h1f.slice(0, 157) + '…' : h1f;
          } else {
            metaDesc = `Browse ${cat.toLowerCase()}${
              sub ? ` and ${sub.toLowerCase()}` : ''
            } businesses in ${locSuffix}. Trusted local directory on Global Business Pages.`;
          }
        }
      }

      const apiTitle = !!(data.metaTitle || '').trim();
      const apiDesc = !!(data.metaDescription || '').trim();

      /** Prefer full DB/meta values; only soften length on client-built fallbacks. */
      const titleText =
        !apiTitle && metaTitle.length > 60 ? metaTitle.slice(0, 57) + '…' : metaTitle;
      const descriptionText =
        !apiDesc && metaDesc.length > 160 ? metaDesc.slice(0, 157) + '…' : metaDesc;

      this.title.setTitle(titleText);
      this.meta.updateTag({ name: 'description', content: descriptionText });
      this.meta.updateTag({ property: 'og:title', content: titleText });
      this.meta.updateTag({ property: 'og:description', content: descriptionText });
      this.meta.updateTag({ property: 'og:type', content: 'website' });

      this.setCanonicalUrl(data.canonicalUrl);
      this.setJsonLd(data);
    } catch {
      /* head mutations must never crash render */
    }
  }

  setCanonicalUrl(url: string): void {
    try {
      const normalized =
        url && url.trim().length > 0
          ? (url.endsWith('/') ? url : `${url}/`)
          : '';

      const head = this.document.head;
      if (!head || !normalized) {
        return;
      }

      let link = head.querySelector<HTMLLinkElement>('link[data-seo-canonical="true"]');
      if (!link) {
        link = this.document.createElement('link');
        link.rel = 'canonical';
        link.setAttribute('data-seo-canonical', 'true');
        head.appendChild(link);
      }

      link.setAttribute('href', normalized.trim());
    } catch {
      /* ignore malformed DOM mutations */
    }
  }

  setJsonLd(data: SeoMetaDataPayload): void {
    try {
      this.clearManagedJsonLd();
      const head = this.document.head;
      if (!head) {
        return;
      }

      const graph: Record<string, unknown>[] = [];

      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: (data.breadcrumbs || []).map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.label,
          item: this.resolveAbsoluteUrl(b.url),
        })),
      });

      const cat = (data.category || 'Business').trim();
      const sub = (data.subcategory || '').trim();
      const city = (data.city || '').trim();
      const state = (data.state || '').trim();
      const country = (data.country || '').trim() || 'the United States';
      const locLine = city && state
        ? `${city}, ${state}`
        : state
          ? state
          : city
            ? city
            : country;
      const listName = sub ? `${cat} — ${sub} in ${locLine}` : `${cat} in ${locLine}`;

      const rows = (data.listings || []).slice(0, 20);
      const itemListElement = rows.map((row, idx) => {
        const name = this.listingDisplayName(row);
        const url = this.listingWebsiteUrl(row);
        const el: Record<string, unknown> = {
          '@type': 'ListItem',
          position: idx + 1,
          name,
        };
        if (url) {
          el['item'] = url;
        }
        return el;
      });

      graph.push({
        '@type': 'ItemList',
        name: listName,
        description: `Directory listings: ${listName.toLowerCase()}.`,
        numberOfItems: itemListElement.length,
        itemListElement,
      });

      for (const row of rows) {
        const lb = this.buildLocalBusinessLd(row);
        if (lb) {
          graph.push(lb);
        }
      }

      const root = {
        '@context': 'https://schema.org',
        '@graph': graph,
      };

      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute(this.seoScriptMarker, 'landing');
      script.textContent = JSON.stringify(root);
      head.appendChild(script);
    } catch {
      /* swallow JSON-LD failures */
    }
  }

  setPaginationLinks(prevUrl: string | null, nextUrl: string | null): void {
    const head = this.document.head;
    if (!head) {
      return;
    }

    const upsertLink = (rel: 'prev' | 'next', href: string | null) => {
      const selector = `link[data-seo-pagination="${rel}"]`;
      head.querySelectorAll(selector).forEach((node) => node.remove());
      if (!href) {
        return;
      }
      const link = this.document.createElement('link');
      link.setAttribute('rel', rel);
      link.setAttribute('href', href);
      link.setAttribute('data-seo-pagination', rel);
      head.appendChild(link);
    };

    try {
      upsertLink('prev', prevUrl ? this.ensureTrailingSlash(prevUrl) : null);
      upsertLink(
        'next',
        nextUrl ? this.ensureTrailingSlash(nextUrl) : null
      );
    } catch {
      /* non-fatal */
    }
  }

  clearPaginationLinks(): void {
    try {
      this.document
        .head?.querySelectorAll('link[data-seo-pagination]')
        .forEach((el) => el.remove());
    } catch {
      /* ignore */
    }
  }

  clearPageMeta(): void {
    this.clearManagedJsonLd();
    this.clearPaginationLinks();
  }

  private listingDisplayName(row: Record<string, unknown>): string {
    return String(row['company_name'] || row['business_name'] || row['name'] || 'Business').trim();
  }

  private listingWebsiteUrl(row: Record<string, unknown>): string {
    const w = row['website'];
    if (!w || typeof w !== 'string') {
      return '';
    }
    const s = w.trim();
    if (!s) {
      return '';
    }
    return /^(https?:)?\/\//i.test(s) ? s : `https://${s}`;
  }

  private buildLocalBusinessLd(row: Record<string, unknown>): Record<string, unknown> | null {
    const name = this.listingDisplayName(row);
    if (!name || name === 'Business') {
      return null;
    }
    const o: Record<string, unknown> = {
      '@type': 'LocalBusiness',
      name,
    };
    const url = this.listingWebsiteUrl(row);
    if (url) {
      o['url'] = url;
    }
    const phone = row['phone'];
    if (phone != null && String(phone).trim()) {
      o['telephone'] = String(phone).trim();
    }
    const street = row['address'];
    const city = row['city'];
    const region = row['state'];
    const postal = row['zip'] ?? row['zip_code'];
    if (
      (street && String(street).trim()) ||
      (city && String(city).trim()) ||
      (region && String(region).trim()) ||
      (postal != null && String(postal).trim())
    ) {
      const addr: Record<string, unknown> = { '@type': 'PostalAddress' };
      if (street && String(street).trim()) {
        addr['streetAddress'] = String(street).trim();
      }
      if (city && String(city).trim()) {
        addr['addressLocality'] = String(city).trim();
      }
      if (region && String(region).trim()) {
        addr['addressRegion'] = String(region).trim();
      }
      if (postal != null && String(postal).trim()) {
        addr['postalCode'] = String(postal).trim();
      }
      o['address'] = addr;
    }
    return o;
  }

  private clearManagedJsonLd(): void {
    try {
      this.document
        .head?.querySelectorAll(`script[${this.seoScriptMarker}]`)
        .forEach((script) => script.remove());
    } catch {
      /* ignore */
    }
  }

  private resolveAbsoluteUrl(url: string): string {
    if (!url) {
      return '';
    }
    if (url.startsWith('http')) {
      return url;
    }
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      try {
        return new URL(url, window.location.origin).toString();
      } catch {
        return url;
      }
    }
    return url;
  }

  private ensureTrailingSlash(url: string): string {
    return url.endsWith('/') ? url : `${url}/`;
  }
}

export function groupsFromResponse(res: SeoLandingResponse): InternalLinkGroup[] {
  const groups: InternalLinkGroup[] = [];

  const sub = res.internal_links?.subcategories || [];
  if (sub.length) {
    groups.push({ title: 'Subcategories', items: sub });
  }

  const related = res.internal_links?.related_categories || [];
  if (related.length) {
    groups.push({ title: 'Related categories', items: related });
  }

  const siblings = res.internal_links?.sibling_subcategories || [];
  if (siblings.length) {
    groups.push({ title: 'More in this category', items: siblings });
  }

  return groups;
}
