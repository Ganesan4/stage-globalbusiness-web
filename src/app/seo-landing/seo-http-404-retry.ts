import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * When nginx uses ``proxy_pass .../`` under ``location /api/``, upstream may receive
 * ``/seo/...`` instead of ``/api/seo/...``. Browsers fix that accidentally by requesting
 * ``/api/api/seo/...``. Rebuild an alternate URL for that case.
 *
 * Only rewrites paths that contain ``/api/seo/`` and are not already ``/api/api/seo``.
 */
export function seoApiDoublePrefixFallbackUrl(url: string): string | null {
  if (!url.includes('/api/seo')) {
    return null;
  }
  if (/\/api\/api\/seo\b/i.test(url)) {
    return null;
  }
  const rewritten = url.replace(/\/api\/seo\b/, '/api/api/seo');
  return rewritten !== url ? rewritten : null;
}

/**
 * ``GET url`` first; on **HTTP 404** only, ``GET`` the double-``api`` variant if derivable.
 */
export function httpGetWithSeo404Fallback<T>(
  http: HttpClient,
  url: string,
  options?: Parameters<HttpClient['get']>[1]
): Observable<T> {
  return http.get<T>(url, options).pipe(
    catchError((err: HttpErrorResponse | unknown) => {
      const status = err instanceof HttpErrorResponse ? err.status : NaN;
      if (status !== 404) {
        return throwError(() => err);
      }
      // Local dev: do not retry ``/api/api/seo`` — that nginx workaround hides real 404s.
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(url)) {
        return throwError(() => err);
      }
      const fb = seoApiDoublePrefixFallbackUrl(url);
      if (!fb) {
        return throwError(() => err);
      }
      return http.get<T>(fb, options);
    })
  );
}
