/**
 * Builds the public SEO REST base (`.../api/seo/`) from ``environment.base_url``.
 *
 * ``base_url`` is often already the API root (e.g. ``https://host/api/``), so callers must NOT
 * prefix again with ``api/`` — **unless** the edge proxy strips the first ``/api/`` when forwarding
 * (some nginx ``location /api/ { proxy_pass http://backend/; }`` configs). Then the browser must
 * request ``/api/api/seo/...`` so upstream receives ``/api/seo/...``. Prefer fixing nginx
 * (``proxy_pass http://backend/api/;``) and keeping ``duplicateApiSegment`` false.
 */
export function seoPublicApiRoot(
  baseUrl: string | undefined,
  duplicateApiSegment = false
): string {
  const baseTrim = (baseUrl || '').trim().replace(/\/+$/, '');
  if (!baseTrim) {
    return duplicateApiSegment ? '/api/api/seo/' : '/api/seo/';
  }
  if (/^https?:\/\//i.test(baseTrim)) {
    if (/\/api\/seo$/i.test(baseTrim)) {
      return `${baseTrim}/`;
    }
  } else {
    const rel = baseTrim.endsWith('/') ? baseTrim.slice(0, -1) : baseTrim;
    if (/\/api\/seo$/i.test(rel)) {
      return `${rel}/`;
    }
  }
  if (baseTrim.endsWith('/api')) {
    return duplicateApiSegment ? `${baseTrim}/api/seo/` : `${baseTrim}/seo/`;
  }
  return `${baseTrim}/api/seo/`;
}
