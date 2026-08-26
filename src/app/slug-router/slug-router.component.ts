import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Type } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { ListingComponent } from '../listing/listing.component';
import { ListingdetailsComponent } from '../listingdetails/listingdetails.component';

@Component({
  selector: 'app-slug-router',
  standalone: true,
  imports: [CommonModule],
  template: '<ng-container *ngComponentOutlet="componentType"></ng-container>',
})
export class SlugRouterComponent implements OnInit {
  componentType: Type<any> | null = null;
  private apiUrl = environment.base_url;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const stateData = history.state?.data;
    if (stateData?.source_table) {
      this.openComponentForSource(stateData.source_table);
      return;
    }

    this.loadSlugSource();
  }

  private loadSlugSource(): void {
    const categorySlug = this.route.snapshot.paramMap.get('categorySlug');
    const citySlug = this.route.snapshot.paramMap.get('citySlug');
    const businessSlug = this.route.snapshot.paramMap.get('businessSlug');

    if (!categorySlug || !citySlug || !businessSlug) {
      this.componentType = ListingdetailsComponent;
      return;
    }

    const expectedSlugUrl = `/${categorySlug}/${citySlug}/${businessSlug}`;
    const params = new URLSearchParams({
      country: '',
      state: '',
      city: citySlug.replace(/-/g, ' '),
      zip: '',
      category: categorySlug.replace(/-/g, ' '),
      page: '1',
      page_size: '10',
    });

    this.http.get<any>(`${this.apiUrl}searchallListing?${params.toString()}`).subscribe({
      next: response => {
        const listing = response?.data?.find((item: any) =>
          item.slug_url === expectedSlugUrl || item.slug === businessSlug
        );

        if (listing) {
          history.replaceState(
            { ...history.state, id: listing.id, data: listing },
            '',
            expectedSlugUrl
          );
          this.openComponentForSource(listing.source_table);
          return;
        }

        this.componentType = ListingdetailsComponent;
      },
      error: () => {
        this.componentType = ListingdetailsComponent;
      },
    });
  }

  private openComponentForSource(sourceTable: string): void {
    this.componentType = sourceTable === 'registration'
      ? ListingComponent
      : ListingdetailsComponent;
  }
}
