import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-seo-pagination',
  standalone: false,
  template: `
    <nav *ngIf="shouldRender()" class="seo-pagination m-0" aria-label="Pagination">
      <div class="flex flex-wrap gap-2 items-center">
        <a
          class="rounded-full border px-3 py-1 text-sm md:text-base"
          [class.opacity-40]="normalizedCurrent <= 1"
          [attr.href]="hrefFor(normalizedCurrent - 1)"
          (click)="goTo(normalizedCurrent - 1, $event)"
        >
          Previous
        </a>

        <a
          *ngFor="let page of visiblePages()"
          class="rounded-full border px-3 py-1 text-sm md:text-base"
          [ngClass]="{ 'border-blue-600 bg-blue-50 font-semibold text-blue-900': page === normalizedCurrent }"
          [attr.href]="hrefFor(page)"
          (click)="goTo(page, $event)"
        >
          {{ page }}
        </a>

        <a
          class="rounded-full border px-3 py-1 text-sm md:text-base"
          [class.opacity-40]="normalizedCurrent >= normalizedTotal"
          [attr.href]="hrefFor(normalizedCurrent + 1)"
          (click)="goTo(normalizedCurrent + 1, $event)"
        >
          Next
        </a>
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() baseUrl = '';
  @Output() readonly pageChange = new EventEmitter<number>();

  normalizedCurrent = 1;
  normalizedTotal = 1;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnChanges(): void {
    this.normalizedCurrent =
      !this.currentPage || this.currentPage < 1 || Number.isNaN(this.currentPage)
        ? 1
        : this.currentPage;

    this.normalizedTotal =
      !this.totalPages || this.totalPages < 1 || Number.isNaN(this.totalPages)
        ? 1
        : this.totalPages;
  }

  shouldRender(): boolean {
    return this.normalizedTotal > 1;
  }

  visiblePages(): number[] {
    const anchors = new Set<number>([1, this.normalizedTotal]);
    for (let delta = -2; delta <= 2; delta++) {
      const page = this.normalizedCurrent + delta;
      if (page >= 1 && page <= this.normalizedTotal) {
        anchors.add(page);
      }
    }
    return Array.from(anchors).sort((a, b) => a - b);
  }

  hrefFor(target: number): string {
    if (!this.baseUrl) {
      return '#';
    }
    const [path, query] = this.baseUrl.split('?');
    const params = new URLSearchParams(query || '');
    if (target < 1 || target > this.normalizedTotal) {
      return path;
    }
    if (target <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(target));
    }
    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
  }

  goTo(page: number, event?: Event): void {
    event?.preventDefault();
    if (page < 1 || page > this.normalizedTotal || page === this.normalizedCurrent) {
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page },
        queryParamsHandling: 'merge',
      });
    }
    this.pageChange.emit(page);
  }
}
