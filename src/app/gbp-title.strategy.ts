import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** Default document title when a route defines no ``title``. SEO landing overrides via ``SeoMetaService``. */
@Injectable()
export class GbpTitleStrategy extends TitleStrategy {
  private static readonly FALLBACK = 'Business Directory | Global Business Pages';

  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const built = this.buildTitle(snapshot);
    const resolved = (built ?? '').trim();
    this.title.setTitle(resolved.length > 0 ? resolved : GbpTitleStrategy.FALLBACK);
  }
}
