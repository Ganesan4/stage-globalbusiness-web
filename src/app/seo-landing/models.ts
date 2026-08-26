/** Shared typings for `/usa/` SEO landing payloads. */

export interface BreadcrumbDto {
  label: string;
  url: string;
}

export interface SeoPayloadDto {
  meta_title?: string;
  meta_description?: string;
  h1?: string;
  intro_content?: string;
  /** About-section copy (max 250 chars when sourced from batch DB). */
  about_intro?: string;
  canonical_url?: string;
}

export interface PaginationDto {
  total_results?: number;
  current_page?: number;
  total_pages?: number;
  page_size?: number;
}

export interface InternalLinkItem {
  label: string;
  url: string;
  slug?: string;
  description?: string;
}

export interface SeoLandingResponse {
  seo: SeoPayloadDto & {
    pagination_base_url?: string;
    canonical_url?: string;
  };
  category?: { name: string; slug: string };
  subcategory?: { name: string; slug: string } | null;
  breadcrumbs?: BreadcrumbDto[];
  listings?: Record<string, unknown>[];
  pagination?: PaginationDto;
  internal_links?: {
    subcategories?: InternalLinkItem[];
    related_categories?: InternalLinkItem[];
    sibling_subcategories?: InternalLinkItem[];
  };
  keyword_applied?: string | null;
  site_origin?: string;
  city?: { slug?: string; label?: string };
  state?: { slug?: string; label?: string };
  country?: { slug?: string; label?: string };
}

export interface InternalLinkGroup {
  title: string;
  items: InternalLinkItem[];
}
