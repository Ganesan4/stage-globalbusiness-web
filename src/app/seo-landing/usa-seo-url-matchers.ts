import { UrlMatchResult, UrlSegment } from '@angular/router';

/** US state codes + full-name slugs (lowercase) for `/usa/...` disambiguation. */
const US_STATE_SLUGS = new Set<string>([
  'al',
  'ak',
  'az',
  'ar',
  'arkansas',
  'ca',
  'california',
  'co',
  'colorado',
  'ct',
  'connecticut',
  'de',
  'delaware',
  'fl',
  'florida',
  'ga',
  'georgia',
  'hi',
  'hawaii',
  'id',
  'idaho',
  'il',
  'illinois',
  'in',
  'indiana',
  'ia',
  'iowa',
  'ks',
  'kansas',
  'ky',
  'kentucky',
  'la',
  'louisiana',
  'me',
  'maine',
  'md',
  'maryland',
  'ma',
  'massachusetts',
  'mi',
  'michigan',
  'mn',
  'minnesota',
  'ms',
  'mississippi',
  'mo',
  'missouri',
  'mt',
  'montana',
  'ne',
  'nebraska',
  'nv',
  'nevada',
  'nh',
  'new-hampshire',
  'nj',
  'new-jersey',
  'nm',
  'new-mexico',
  'ny',
  'new-york',
  'nc',
  'north-carolina',
  'nd',
  'north-dakota',
  'oh',
  'ohio',
  'ok',
  'oklahoma',
  'or',
  'oregon',
  'pa',
  'pennsylvania',
  'ri',
  'rhode-island',
  'sc',
  'south-carolina',
  'sd',
  'south-dakota',
  'tn',
  'tennessee',
  'tx',
  'texas',
  'ut',
  'utah',
  'vt',
  'vermont',
  'va',
  'virginia',
  'wa',
  'washington',
  'wv',
  'west-virginia',
  'wi',
  'wisconsin',
  'wy',
  'wyoming',
  'dc',
  'district-of-columbia',
]);

export function isUsStateSlug(segment: string): boolean {
  return US_STATE_SLUGS.has((segment || '').trim().toLowerCase());
}

/** Parent ``seo_category`` slugs (not subcategory). */
const MAIN_CATEGORY_SLUG_HINT =
  /-(services|medical|retail|food|hospitality|automotive|technology|legal|finance|care|sustainable)/;

export function looksLikeMainCategorySlug(segment: string): boolean {
  const s = (segment || '').trim().toLowerCase();
  if (!s) {
    return false;
  }
  if (s === 'health-medical' || s === 'green-sustainable') {
    return true;
  }
  return MAIN_CATEGORY_SLUG_HINT.test(s);
}

/** Matchers run as **children of** ``path: 'usa'`` — segments do not include the ``usa`` prefix. */

/** ``/:state/:city/:category/:subcategory`` */
export function matchUsaStateCityCategorySubcategory(
  segments: UrlSegment[]
): UrlMatchResult | null {
  if (segments.length !== 4) {
    return null;
  }
  if (!isUsStateSlug(segments[0].path)) {
    return null;
  }
  return {
    consumed: segments,
    posParams: {
      state: segments[0],
      city: segments[1],
      category: segments[2],
      subcategory: segments[3],
    },
  };
}

/** ``/:state/:city/:category`` */
export function matchUsaStateCityCategory(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length !== 3) {
    return null;
  }
  const [a, b, c] = segments.map((s) => s.path.toLowerCase());
  if (!isUsStateSlug(a)) {
    return null;
  }
  if (!looksLikeMainCategorySlug(c)) {
    return null;
  }
  if (looksLikeMainCategorySlug(b)) {
    return null;
  }
  return {
    consumed: segments,
    posParams: {
      state: segments[0],
      city: segments[1],
      category: segments[2],
    },
  };
}

/** ``/:state/:category/:subcategory`` (no city) */
export function matchUsaStateCategorySubcategory(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length !== 3) {
    return null;
  }
  const [a, b, c] = segments.map((s) => s.path.toLowerCase());
  if (!isUsStateSlug(a)) {
    return null;
  }
  if (!looksLikeMainCategorySlug(b)) {
    return null;
  }
  if (looksLikeMainCategorySlug(c)) {
    return null;
  }
  return {
    consumed: segments,
    posParams: {
      state: segments[0],
      category: segments[1],
      subcategory: segments[2],
    },
  };
}

/**
 * Two segments:
 * - ``arkansas/home-services`` → state + category
 * - ``home-services/roofing`` → country + category + subcategory
 */
export function matchUsaTwoSegments(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length !== 2) {
    return null;
  }
  const first = segments[0].path.toLowerCase();
  if (isUsStateSlug(first)) {
    return {
      consumed: segments,
      posParams: {
        state: segments[0],
        category: segments[1],
      },
    };
  }
  if (!looksLikeMainCategorySlug(first)) {
    return null;
  }
  return {
    consumed: segments,
    posParams: {
      category: segments[0],
      subcategory: segments[1],
    },
  };
}

/** ``/:category`` (country-wide category; must not be a US state slug). */
export function matchUsaCountryCategory(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length !== 1) {
    return null;
  }
  if (isUsStateSlug(segments[0].path)) {
    return null;
  }
  return {
    consumed: segments,
    posParams: {
      category: segments[0],
    },
  };
}
