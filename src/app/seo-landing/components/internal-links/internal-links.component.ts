import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { InternalLinkGroup } from '../../models';

@Component({
  selector: 'app-seo-internal-links',
  standalone: false,
  template: `
    <ng-container *ngFor="let group of linkGroups">
      <nav
        class="seo-internal-links bg-white border border-gray-200 rounded-lg p-6 mb-4 border-l-4 border-l-blue-600 shadow-sm"
        [attr.aria-label]="group.title"
        *ngIf="group.items?.length"
      >
        <p class="text-lg font-semibold text-gray-900 mb-2">{{ group.title }}</p>
        <ul class="space-y-2">
          <li *ngFor="let item of group.items">
            <a
              class="text-blue-600 hover:text-blue-800 hover:underline font-medium"
              [routerLink]="routerPath(item.url)"
              [queryParams]="routerQuery(item.url)"
              [attr.href]="item.url || null"
              *ngIf="item.url"
            >
              {{ item.label }}
            </a>
            <span *ngIf="item.description" class="block text-xs text-gray-500 mt-0.5">{{ item.description }}</span>
          </li>
        </ul>
      </nav>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InternalLinksComponent {
  @Input() linkGroups: InternalLinkGroup[] = [];

  routerPath(url: string): string {
    if (!url) {
      return '/';
    }
    try {
      const parsed = this.parseUrl(url);
      let path = parsed.pathname || '/';
      if (!path.startsWith('/')) {
        path = '/' + path;
      }
      return path;
    } catch {
      const bare = (url || '').split('?')[0];
      return bare.startsWith('/') ? bare : `/${bare}`;
    }
  }

  routerQuery(url: string): Record<string, string> {
    if (!url) {
      return {};
    }
    try {
      const parsed = this.parseUrl(url);
      const out: Record<string, string> = {};
      parsed.searchParams.forEach((value, key) => {
        out[key] = value;
      });
      return out;
    } catch {
      return {};
    }
  }

  private parseUrl(url: string): URL {
    return url.startsWith('http')
      ? new URL(url)
      : new URL(url, 'https://canonical.local');
  }
}
