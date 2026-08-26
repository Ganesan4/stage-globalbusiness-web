import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { BreadcrumbDto } from '../../models';

@Component({
  selector: 'app-seo-breadcrumb',
  standalone: false,
  template: `
    <nav *ngIf="breadcrumbs?.length" aria-label="breadcrumb" class="flex flex-wrap items-center py-3 text-sm mb-2">
      <ng-container *ngFor="let crumb of breadcrumbs; let last = last">
        <a
          *ngIf="!last"
          class="text-blue-600 hover:text-blue-800 hover:underline"
          [routerLink]="routerPath(crumb.url)"
          [attr.href]="crumb.url"
        >
          {{ crumb.label }}
        </a>
        <span *ngIf="!last" class="mx-2 text-gray-500" aria-hidden="true">&gt;</span>
        <span *ngIf="last" class="text-gray-900 font-medium" aria-current="page">{{ crumb.label }}</span>
      </ng-container>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeoBreadcrumbComponent {
  @Input() breadcrumbs: BreadcrumbDto[] | null | undefined;

  routerPath(url: string): string {
    if (!url) {
      return '/';
    }
    try {
      const parsed = url.startsWith('http')
        ? new URL(url)
        : new URL(url, 'https://canonical.local');

      let path = parsed.pathname || '/';
      if (!path.startsWith('/')) {
        path = '/' + path;
      }
      return path + (parsed.search || '');
    } catch {
      return url.startsWith('/') ? url : `/${url}`;
    }
  }
}
