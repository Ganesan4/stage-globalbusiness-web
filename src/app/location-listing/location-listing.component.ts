import { Component, OnInit, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from '../services/search.service';
import { WebService } from '../services/web.service';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { Meta, Title } from '@angular/platform-browser';
// export interface BusinessListing {
//   id: string;
//   company_name: string;
//   category: string;
//   address: string;
//   city: string;
//   country: string;
//   industry: string;
//   phone: string;
//   sic_description: string;
//   state: string;
//   zip: string;
//   avg_rating: number;
//   review_count: number;
// }

export interface BusinessListing {
  id: string;
  company_name: string;
  category: string;
  address: string;
  city: string;
  country: string;
  industry: string;
  phone: string;
  sic_description: string;
  state: string;
  zip: string;
  avg_rating: number;
  review_count: number;

  // ⭐ UI fields
  stars?: any[];
  emptyStars?: any[];
  hasHalfStar?: boolean;
  logo: string;
  website: string;
}


@Component({
  selector: 'app-location-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, SlickCarouselModule],
  templateUrl: './location-listing.component.html',
  styleUrl: './location-listing.component.scss'
})
export class LocationListingComponent implements OnInit {
  listings: BusinessListing[] = [];
  showBanner: boolean = true;
  country: string = '';
  state: string = '';
  city: string = '';
  category: string = '';
  /** Last route segment for category (e.g. `health`, `health-medical`) — sent as API `category_slug`. */
  categoryRouteSlug: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  apiUrl = environment.base_url;
  loading: boolean = false;
  nearbyCities: string[] = [];
  isLoadingNearbyCities = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  popularCategories: string[] = [];
  popularCategoriesLoading = false;
  popularCategoriesError = '';
  fallbackImages = [
    'assets/img/preview1.jpg',
    'assets/img/preview3.jpg',
    'assets/img/preview4.jpg',
    'assets/img/preview5.jpg',
    'assets/img/preview6.jpg',
  ];

  // Search related properties
  searchQuery: string = '';
  searchResults: any[] = [];
  isDropdownOpen: boolean = false;
  selectedCountry: string = '';
  selectedState: string = '';
  selectedCity: string = '';
  searchcountry: string = '';
  searchstate: string = '';
  searchcity: string = '';
  searchzip: string = '';
  filteredCountries: string[] = [];
  filteredStates: string[] = [];
  filteredCities: string[] = [];
  filteredZips: string[] = [];
  topCategories: any[] = [];
  isLoadingTopCategories = false;
  // Additional properties for search functionality
  businessData: any[] = [];
  showfilter: boolean = false;
  businessNames: string = '';

  // Route parameters for meta tags
  routeCountry: string = '';
  routeState: string = '';
  routeCity: string = '';
  routeZip: string = '';
  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: true,
    dots: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } }
    ]
  };
  zip: string;
  private readonly staticCategoryLabels = ['Restaurants', 'Food Services', 'Health', 'Medical Services', 'Home Services', 'Contractors', 'Retail', 'Shopping', 'Beauty', 'Personal Care', 'Automotive Services', 'Financial', 'Insurance Services', 'Legal', 'Professional Services', 'Fitness', 'Wellness', 'Education', 'Training', 'Real Estate', 'Property Services', 'Childcare', 'Family Services', 'Cleaning', 'Maintenance', 'Pet Services', 'Travel', 'Hospitality', 'Technology', 'IT Services', 'Sustainable', 'Green Services', 'Event', 'Entertainment Services', 'Logistics', 'Delivery Services', 'Specialty', 'Niche Services'];
  fullcategory: string;
  totalItems: any;
  location: any;
  activeIndex: number | null = null;
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private meta: Meta, private titleService: Title, private router: Router, private renderer: Renderer2, private activatedRoute: ActivatedRoute, private web: WebService, private http: HttpClient, private searchService: SearchService) { }

  ngOnInit(): void {
    this.getRoutingParams();
    // this.loadListings();
    this.getTopCategories();

    this.location = [this.city, this.state, this.country].filter(Boolean).join(', ');

  }
  updateCanonicalUrl() {
    const cleanUrl = window.location.origin + this.router.url.split('?')[0];

    const link: HTMLLinkElement | null = document.querySelector("link[rel='canonical']");
    console.log("link", link);

    if (link) {
      link.setAttribute('href', cleanUrl);
    }
  }
  toggleFAQ(index: number) {
    this.activeIndex = this.activeIndex === index ? null : index;
  }
  // loadListings(): void {
  //   // Sample data - in real app, this would come from an API
  //   this.listings = [
  //     {
  //       id: '1',
  //       name: 'Mike Diamond Plumbing',
  //       category: 'Plumbers, Plumbing Contractors, Water Heater Installation & Repair',
  //       logo: 'assets/img/mike-diamond.jpg',
  //       rating: 4.8,
  //       reviews: 156,
  //       stars: [1, 2, 3, 4],
  //       hasHalfStar: true,
  //       phone: '(310) 555-0123',
  //       address: '1234 Main St, Los Angeles, CA 90001',
  //       yearsInBusiness: 25,
  //       isAd: false
  //     },
  //     {
  //       id: '2',
  //       name: 'Twin Plumbing',
  //       category: 'Plumbers, Drain Cleaning, Water Treatment',
  //       logo: 'assets/img/twin-plumbing.jpg',
  //       rating: 4.6,
  //       reviews: 89,
  //       stars: [1, 2, 3, 4],
  //       hasHalfStar: true,
  //       phone: '(323) 555-0456',
  //       address: '5678 Sunset Blvd, Los Angeles, CA 90028',
  //       yearsInBusiness: 15,
  //       isAd: false
  //     },
  //     {
  //       id: '3',
  //       name: 'Roto-Rooter Plumbing & Water Cleanup',
  //       category: 'Plumbers, Emergency Plumbing Service, Drain Cleaning',
  //       logo: 'assets/img/ROTO-ROOTER.jpg',
  //       rating: 4.3,
  //       reviews: 234,
  //       stars: [1, 2, 3, 4],
  //       hasHalfStar: false,
  //       phone: '(213) 555-0789',
  //       address: '9012 Hollywood Blvd, Los Angeles, CA 90028',
  //       yearsInBusiness: 50,
  //       isAd: true
  //     }
  //   ];
  // }

  // getRoutingParams(): void {
  //   this.activatedRoute.paramMap.subscribe(params => {
  //     this.country = params.get('country')!;
  //     this.state = params.get('state')!;
  //     this.city = this.toTitleCaseFromSlug(params.get('city')!);
  //     this.category = this.toTitleCaseFromSlug(params.get('category')!);

  //     // Immediately set dropdown values from URL for fast display (no API wait)
  //     this.selectedCountry = this.country || '';
  //     this.selectedState = this.state || '';
  //     this.selectedCity = this.city || '';
  //     this.searchcountry = this.country || '';
  //     this.searchstate = this.state || '';
  //     this.searchcity = this.city || '';

  //     // Pre-populate filtered lists with current URL values for instant dropdown display
  //     if (this.country && !this.filteredCountries.includes(this.country)) {
  //       this.filteredCountries = [this.country, ...this.filteredCountries];
  //     }
  //     if (this.state && !this.filteredStates.includes(this.state)) {
  //       this.filteredStates = [this.state, ...this.filteredStates];
  //     }
  //     if (this.city && !this.filteredCities.includes(this.city)) {
  //       this.filteredCities = [this.city, ...this.filteredCities];
  //     }

  //     // Call APIs to populate dropdowns
  //     this.fetchescountry().then(() => {
  //       if (this.country) {
  //         this.fetchStates(this.country).then(() => {
  //           if (this.state) {
  //             this.fetchCities(this.state).then(() => {
  //               if (this.city) {
  //                 this.fetchZips(this.city);
  //               }
  //             });
  //           }
  //         });
  //       }
  //     });
  //   });
  //   console.log("params", this.country, this.state, this.city, this.category);
  //   this.getListingData();
  //   if (this.state) {
  //     this.getPopularCategories();
  //   }
  // }
  formatTitle(value: string | null | undefined): string {
    if (!value) return 'N/A';

    const text = value.replace(/-/g, ' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  getRoutingParams(): void {
    this.activatedRoute.paramMap.subscribe(params => {

      // this.country = params.get('country') || '';
      // this.state = params.get('state') || '';
      this.country = (params.get('country')?.replace(/-/g, ' ') || '').toUpperCase();
      this.state = (params.get('state')?.replace(/-/g, ' ') || '').toUpperCase();
      this.city = this.toNormalText(params.get('city') || '');
      // this.city = this.toTitleCaseFromSlug(params.get('city') || '');
      const categoryParam = params.get('category') || '';
      this.categoryRouteSlug = categoryParam.trim().toLowerCase();
      this.category = this.toTitleCaseFromSlug(categoryParam);
      if (this.category) {
        const firstWord = this.category.split(' ')[0].toLowerCase();

        const matchedLabel = this.staticCategoryLabels.find(label =>
          label.toLowerCase().startsWith(firstWord)
        );

        if (matchedLabel) {
          this.fullcategory = matchedLabel;
        }
      }
      this.zip = params.get('zip')?.toUpperCase() || '';
      // Dropdown instant values


      this.selectedCountry = this.country;
      this.selectedState = this.state;
      this.selectedCity = this.city;

      this.searchcountry = this.country;
      this.searchstate = this.state;
      this.searchcity = this.city;

      // Pre-populate lists
      if (this.country && !this.filteredCountries.includes(this.country)) {
        this.filteredCountries = [this.country, ...this.filteredCountries];
      }
      if (this.state && !this.filteredStates.includes(this.state)) {
        this.filteredStates = [this.state, ...this.filteredStates];
      }
      if (this.city && !this.filteredCities.includes(this.city)) {
        this.filteredCities = [this.city, ...this.filteredCities];
      }

      // API chain
      this.fetchescountry().then(() => {
        if (this.country) {
          this.fetchStates(this.country).then(() => {
            if (this.state) {
              this.fetchCities(this.state).then(() => {
                if (this.city) {
                  this.fetchZips(this.city);
                }
              });
            }
          });
        }
      });

      // ✅ CALL AFTER params are ready
      console.log("params", this.country, this.state, this.city, this.category);

      this.getListingData();

      //   if (this.state) {
      this.getPopularCategories();
      // }
    });
  }
  toNormalText(slug: string): string {
    return slug
      .replace(/-/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  getnearbycities(): void {
    console.log('Fetching nearby cities...');

    if (!this.city || !this.state) {
      console.log('City or state not available yet');
      this.nearbyCities = [];
      return;
    }

    const url = `nearbycities?city=${encodeURIComponent(this.city)}&state=${encodeURIComponent(this.state)}&limit=5`;
    console.log('API URL:', url);

    this.isLoadingNearbyCities = true;

    this.web.getData(url)
      .then((res: any) => {
        this.isLoadingNearbyCities = false;

        if (res?.nearby_cities?.length) {
          this.nearbyCities = res.nearby_cities;
        } else if (res?.displayed_data?.length) {
          this.nearbyCities = res.displayed_data;
        } else {
          this.nearbyCities = [];
          this.errorMessage = 'No nearby cities found';
        }

        console.log('Nearby cities:', this.nearbyCities);
      })
      .catch(err => {
        this.isLoadingNearbyCities = false;
        this.nearbyCities = [];
        this.errorMessage = 'Failed to load nearby cities';
        console.error(err);
      });
  }

  getPopularCategories(): void {
    console.log('Fetching popular categories...');

    // if (!this.state) {
    //   console.log('State not available yet');
    //   return;
    // }

    //const url = `popularcategories?state=${encodeURIComponent(this.state)}&limit=5`;
    const url = `popularcategoriesfromindex?country=${this.country}&state=${this.state}&city=${this.city}&limit=5`;
    console.log('Popular Categories API URL:', url);

    this.popularCategoriesLoading = true;
    this.popularCategoriesError = '';

    this.web.getData(url)
      .then((res: any) => {
        this.popularCategoriesLoading = false;

        if (res?.popular_categories?.length) {
          this.popularCategories = res.popular_categories;
        } else if (res?.displayed_data?.length) {
          this.popularCategories = res.displayed_data;
        } else {
          this.popularCategories = [];
          this.popularCategoriesError = res?.message || 'No popular categories found for this state';
        }

        console.log('Popular categories:', this.popularCategories);
      })
      .catch(err => {
        this.popularCategoriesLoading = false;
        this.popularCategories = [];
        this.popularCategoriesError = 'Failed to load popular categories';
        console.error('Error fetching popular categories:', err);
      });
  }

  navigateToNearbyCity(cityStr: string): void {

    const cleaned = cityStr.replace(/\(.*?\)/g, '').trim();
    const parts = cleaned.split(',');

    const cityName = parts[0].trim();
    const state = parts[1]?.trim() || this.state;

    this.country = this.country;

    this.state = state;

    this.city = cityName;

    const citySlug = cityName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const categorySlug = (this.category || 'businesses')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const route = ['business-directory', this.country, state, citySlug, categorySlug];

    console.log('Navigating to nearby city route:', route);
    this.router.navigate(route);
    this.getListingData();

  }
  navigateToCategory(categoryStr: string): void {

    const country = this.country || '';
    const state = this.state || '';
    const city = this.city || '';

    const categorySlug = categoryStr
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const route: string[] = ['business-directory'];

    if (country) {
      route.push(country.toLowerCase());
    }

    if (state) {
      route.push(state.toLowerCase());
    }

    if (city) {
      const citySlug = city
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      route.push(citySlug);
    }

    route.push(categorySlug);

    console.log('Navigating to category route:', route);

    this.category = categoryStr;

    this.router.navigate(route);
  }

  redirectregister() {
    window.location.href = '/register';
  }

  // getListingData(): void {
  //   this.loading = true;
  //   let data = {
  //     country: this.country,
  //     state: this.state,
  //     city: this.city,
  //     category: this.category,
  //     page: this.currentPage.toString(),
  //     page_size: this.pageSize.toString()
  //   };
  //   console.log("data", data);
  //   this.web.postData('getLocationListingData', data).then((response: any) => {
  //     let listing = [];
  //     for (let i = 0; i < response.results.length; i++) {
  //       // response.results[i].isAd = false;
  //       listing.push(response.results[i].source);
  //     }
  //     // if (response && response.data) {
  //     this.listings = listing;
  //     console.log("this.listings", this.listings);
  //     // this.updatePagination(response.pagination);
  //     // }
  //     this.loading = false;
  //   }).catch((error) => {
  //     console.error('Error fetching listing data:', error);
  //     this.loading = false;
  //   });
  // }

  // getListingData(): void {
  //   this.loading = true;

  //   const data = {
  //     country: this.country,
  //     state: this.state,
  //     city: this.city,
  //     category: this.category,
  //     page: this.currentPage.toString(),
  //     pageSize: this.pageSize.toString()
  //   };

  //   this.web.postData('getLocationListingData', data)
  //     .then((response: any) => {

  //       const listing: BusinessListing[] = response.results.map((item: any) =>
  //         this.buildStars(item.source)
  //       );

  //       this.listings = listing;
  //       this.loading = false;
  //       console.log("this.listings", this.listings);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching listing data:', error);
  //       this.loading = false;
  //     });
  // }
  categoryItemListSchema() {

    this.web.postData('listingItemListSchema', {
      category: this.category,
      state: this.state,
      city: this.city,
      country: this.country,
      totalItems: this.totalItems
    }).then((res: any) => {

      if (res.status === "success") {

        this.removeSchemaScript();

        const script = this.renderer.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(res.data);

        this.renderer.appendChild(document.head, script);
      }

    });

  }
  private removeSchemaScript() {
    if (isPlatformBrowser(this.platformId)) {
      const oldScripts = document.querySelectorAll('script[type="application/ld+json"]');
      oldScripts.forEach(script => script.remove());
    }
  }

  /**
   * Align `/business/.../:category` with SEO listing API: short path segments map to canonical taxonomy slugs.
   * (Same `category_slug` param as `SeoLandingService` → `searchallListing`.)
   */
  private resolveSeoCategorySlug(routeSlug: string): string {
    const raw = (routeSlug || '').trim().toLowerCase().replace(/_/g, '-');
    if (!raw) {
      return '';
    }
    const shortAliases: Record<string, string> = {
      health: 'health-medical',
    };
    return shortAliases[raw] || raw;
  }

  private normalizeEsListingDoc(item: any): BusinessListing {
    const doc: any = { ...item };
    doc.company_name = doc.company_name || doc.business_name || '';
    doc.id = doc.id != null ? String(doc.id) : String(doc.userid ?? '');
    doc.zip = doc.zip || doc.zip_code || '';
    doc.avg_rating =
      typeof doc.avg_rating === 'number' ? doc.avg_rating : parseFloat(doc.avg_rating) || 0;
    doc.review_count =
      typeof doc.review_count === 'number'
        ? doc.review_count
        : parseInt(doc.review_count, 10) || 0;
    doc.logo = doc.logo || '';
    doc.website = doc.website || '';
    return doc as BusinessListing;
  }

  getListingData(): void {
    this.loading = true;

    const categorySlug = this.resolveSeoCategorySlug(this.categoryRouteSlug);

    let params = new HttpParams()
      .set('country', (this.country || '').trim())
      .set('state', (this.state || '').trim())
      .set('city', (this.city || '').trim())
      .set('page', String(this.currentPage))
      .set('page_size', String(this.pageSize));

    if ((this.zip || '').trim()) {
      params = params.set('zip', (this.zip || '').trim());
    }
    if (categorySlug) {
      params = params.set('category_slug', categorySlug);
    } else if ((this.category || '').trim()) {
      params = params.set('category', (this.category || '').trim());
    }

    this.http
      .get<{
        status?: boolean;
        data?: any[];
        pagination?: { total_records?: number };
        message?: string;
      }>(`${this.apiUrl}searchallListing`, { params })
      .subscribe({
        next: (response) => {
          this.getPopularCategories();
          const total =
            response.pagination && typeof response.pagination.total_records === 'number'
              ? response.pagination.total_records
              : 0;
          this.totalItems = total;
          this.categoryItemListSchema();
          this.updateSeoMetaClientFormat();
          this.updateCanonicalUrl();

          const rows = response.status && Array.isArray(response.data) ? response.data : [];
          this.listings = rows.map((item) => this.buildStars(this.normalizeEsListingDoc(item)));

          if (this.listings?.length) {
            if (this.city && this.state) {
              this.getnearbycities();
            }
          } else {
            this.isLoading = true;
            console.log('getnearbycities noo');
          }

          this.totalPages = this.pageSize > 0 ? Math.ceil(total / this.pageSize) : 0;
          this.updatePagination({
            page: this.currentPage,
            totalPages: this.totalPages
          });
          this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: { page: this.currentPage },
            queryParamsHandling: 'merge'
          });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching listing data:', error);
          this.loading = false;
          this.listings = [];
          this.totalItems = 0;
          this.totalPages = 0;
        },
      });
  }

  goToUpgrade() {
    this.router.navigate(['/upgrade']);
  }
  toTitleCaseFromSlug(slug: string): string {
    return slug
      .split('-')
      .map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(' ');
  }


  closeBanner(): void {
    this.showBanner = false;
  }

  // Pagination methods
  // updatePagination(pagination: any): void {
  //   const paginate = document.getElementById('paginate');
  //   if (!paginate) return;

  //   paginate.innerHTML = '';

  //   const totalPages = pagination.total_pages || pagination.totalPages;
  //   const currentPage = pagination.page || this.currentPage;
  //   const pageLimit = 5;

  //   let startPage = Math.max(1, currentPage - Math.floor(pageLimit / 2));
  //   let endPage = Math.min(totalPages, currentPage + Math.floor(pageLimit / 2));

  //   if (currentPage - Math.floor(pageLimit / 2) < 1) {
  //     endPage = Math.min(totalPages, endPage + (Math.floor(pageLimit / 2) - (currentPage - 1)));
  //   }
  //   if (currentPage + Math.floor(pageLimit / 2) > totalPages) {
  //     startPage = Math.max(1, startPage - (Math.floor(pageLimit / 2) - (totalPages - currentPage)));
  //   }

  //   const hasPreviousPage = currentPage > 1;
  //   const hasNextPage = currentPage < totalPages;

  //   const prevButton = this.createPaginationButton(
  //     'Previous',
  //     hasPreviousPage,
  //     () => this.performSearch(currentPage - 1)
  //   );
  //   paginate.appendChild(prevButton);

  //   for (let i = startPage; i <= endPage; i++) {
  //     const pageButton = this.createPaginationButton(
  //       i.toString(),
  //       true,
  //       () => this.performSearch(i),
  //       i === currentPage
  //     );
  //     paginate.appendChild(pageButton);
  //   }

  //   const nextButton = this.createPaginationButton(
  //     'Next',
  //     hasNextPage,
  //     () => this.performSearch(currentPage + 1)
  //   );
  //   paginate.appendChild(nextButton);
  // }

  updatePagination(pagination: any): void {
    const paginate = document.getElementById('paginate');
    if (!paginate) return;

    paginate.innerHTML = '';

    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;
    const pageLimit = 5;

    let startPage = Math.max(1, currentPage - Math.floor(pageLimit / 2));
    let endPage = Math.min(totalPages, startPage + pageLimit - 1);

    const hasPreviousPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;

    // Previous
    paginate.appendChild(
      this.createPaginationButton(
        'Previous',
        hasPreviousPage,
        () => this.performSearch(currentPage - 1)
      )
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      paginate.appendChild(
        this.createPaginationButton(
          i.toString(),
          true,
          () => this.performSearch(i),
          i === currentPage
        )
      );
    }

    // Next
    paginate.appendChild(
      this.createPaginationButton(
        'Next',
        hasNextPage,
        () => this.performSearch(currentPage + 1)
      )
    );
  }


  createPaginationButton(
    text: string,
    enabled: boolean,
    clickHandler: Function,
    isActive: boolean = false
  ): HTMLButtonElement {
    const button = document.createElement('button');
    button.innerHTML = text;
    button.disabled = !enabled;

    // Enhanced responsive styling
    const baseClasses = 'px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    const enabledClasses = enabled
      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm'
      : 'bg-gray-100 text-gray-400 cursor-not-allowed';
    const activeClasses = isActive ? 'bg-blue-700 text-white ring-2 ring-blue-500 ring-offset-2' : '';

    button.className = `${baseClasses} ${enabledClasses} ${activeClasses}`;

    if (enabled) {
      button.addEventListener('click', () => clickHandler());
    }

    return button;
  }

  // Helper methods for Angular-based pagination
  getPageNumbers(): number[] {
    const pageLimit = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(pageLimit / 2));
    let endPage = Math.min(this.totalPages, startPage + pageLimit - 1);

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getPageButtonClass(page: number): string {
    const baseClasses = 'px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    if (page === this.currentPage) {
      return `${baseClasses} bg-blue-700 text-white ring-2 ring-blue-500 ring-offset-2`;
    }

    return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm`;
  }

  performSearch(page: number = 1): void {
    this.currentPage = page;
    this.getListingData();
    console.log('Performing search for page:', page);
  }

  onSearchInput(): void {
    if (this.searchQuery.trim()) {
      this.searchService.search(this.searchQuery).subscribe(
        (data: any) => {
          console.log('Search data:', data);
          this.searchResults = data?.displayed_data ?? [];
          this.isDropdownOpen = this.searchResults.length > 0;
        },
        (error) => {
          console.error('Search error:', error);
          this.searchResults = [];
          this.isDropdownOpen = false;
        }
      );
    } else {
      this.searchResults = [];
      this.isDropdownOpen = false;
    }
  }

  performSearchQuery(): void {
    // Navigate to the search results page with the selected parameters
    const country = this.selectedCountry || this.searchcountry || '';
    const state = this.selectedState || this.searchstate || '';
    const city = this.selectedCity || this.searchcity || '';
    const zip = this.searchzip || '';
    const category = this.searchQuery || this.category || '';

    // Format URL parameters
    const formattedCountry = country?.toLowerCase() || '';
    const formattedState = state?.toLowerCase() || '';
    const formattedCity = city?.replace(/\s+/g, '-').toLowerCase() || '';
    const formattedZip = zip?.toLowerCase() || '';
    const formattedCategory = category?.replace(/\s+/g, '-').toLowerCase() || '';

    let url = '';
    if (formattedCountry) url += `/${formattedCountry}`;
    if (formattedState) url += `/${formattedState}`;
    if (formattedCity) url += `/${formattedCity}`;
    if (formattedZip) url += `/${formattedZip}`;
    if (formattedCategory) url += `/${formattedCategory}`;

    console.log('Navigating to search URL:', url);
    this.router.navigate([url]);
  }



  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value);
    this.currentPage = 1; // Reset to first page when changing page size
    this.getListingData();
    console.log('Page size changed to:', this.pageSize);
  }


  formatPhoneForTel(phone: string): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '').slice(0, 10);
  }

  formatPhoneForDisplay(phone: string): string {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '').slice(0, 10);
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }

  formatAddress(listing: any): string {
    const parts = [
      listing.address,
      listing.city,
      listing.state,
      listing.zip
    ].filter(
      value =>
        value &&
        value !== 'NaN' &&
        value !== 'nan' &&
        value !== 'undefined'
    );

    return parts.join(', ');
  }

  private buildStars(listing: BusinessListing): BusinessListing {
    const rating = listing.avg_rating || 0;

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return {
      ...listing,
      stars: Array(fullStars),
      hasHalfStar,
      emptyStars: Array(emptyStars)
    };
  }

  getFallbackImage(index: number): string {
    return this.fallbackImages[index % this.fallbackImages.length];
  }

  processImage(image: string): string {
    if (!image) return 'assets/img/no_preview.png';

    // Replace duplicate base64 prefixes for both PNG and JPG formats
    const prefixes = ['data:image/png;base64,data:image/png;base64,', 'data:image/png;base64,data:image/jpeg;base64,', 'data:image/png;base64,data:image/webp;base64,'];

    for (const prefix of prefixes) {
      if (image.startsWith(prefix)) {
        return image.replace(prefix, prefix.split(',')[0] + ',');
      }
    }

    if (/^(https?:)?\/\//i.test(image) || image.startsWith('data:') || image.startsWith('assets/')) {
      return image;
    }

    return `${this.apiUrl}${image.replace(/^\/+/, '')}`;
  }

  // Search methods
  onCountryChange(event: Event | string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof event === 'string') {
        this.selectedCountry = event;
      } else {
        this.selectedCountry = (event.target as HTMLSelectElement).value;
      }

      this.searchcountry = this.selectedCountry;
      this.selectedState = '';
      this.selectedCity = '';
      this.searchstate = '';
      this.searchcity = '';
      this.searchzip = '';
      this.filteredStates = [];
      this.filteredCities = [];
      this.filteredZips = [];

      if (this.selectedCountry) {
        this.fetchStates(this.selectedCountry).then(() => {
          resolve();
        }).catch(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  fetchescountry(): Promise<void> {
    return new Promise((resolve, reject) => {
      const category = this.category || this.searchQuery || '';
      console.log('Fetching countries with category:', category);

      const url = `${this.apiUrl}getListingCountry?category=${encodeURIComponent(category)}`;
      this.http.get<{ message: string; status: boolean; data: string[] }>(url).subscribe(
        (response) => {
          console.log('Countries API response:', response);
          if (response.status && response.data) {
            this.filteredCountries = response.data;
            console.log("Countries loaded successfully:", this.filteredCountries);
          } else {
            console.warn('No countries found:', response.message);
            this.filteredCountries = [];
          }

          // Always add routeCountry to filteredCountries if it exists
          if (this.country && !this.filteredCountries.includes(this.country)) {
            this.filteredCountries.unshift(this.country);
          }

          resolve();
        },
        (error) => {
          console.error('Error fetching countries:', error);
          this.filteredCountries = this.country ? [this.country] : [];
          resolve();
        }
      );
    });
  }

  fetchStates(countryCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const category = this.category || this.searchQuery || '';
      console.log('Fetching states with category:', category, 'and country:', countryCode);

      const url = `${this.apiUrl}getListingStates?country=${encodeURIComponent(countryCode)}&category=${encodeURIComponent(category)}`;
      this.http.get<{ message: string; status: boolean; data: string[] }>(url).subscribe(
        (response) => {
          console.log('States API response:', response);
          if (response.status && response.data) {
            this.filteredStates = response.data;
            console.log("States loaded successfully:", this.filteredStates);
          } else {
            console.warn('No states found:', response.message);
            this.filteredStates = [];
          }

          // Always add routeState to filteredStates if it exists
          if (this.state && !this.filteredStates.includes(this.state)) {
            this.filteredStates.unshift(this.state);
          }

          resolve();
        },
        (error) => {
          console.error('Error fetching states:', error);
          this.filteredStates = this.state ? [this.state] : [];
          resolve();
        }
      );
    });
  }

  onStateChange(event: Event | string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof event === 'string') {
        this.selectedState = event;
      } else {
        this.selectedState = (event.target as HTMLSelectElement).value;
      }
      if (this.selectedState) {
        this.fetchCities(this.selectedState);
      } else {
        this.filteredCities = [];
        this.filteredZips = [];
      }
      resolve();
    });
  }

  fetchCities(state: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const category = this.category || this.searchQuery || '';
      console.log('Fetching cities with category:', category, 'state:', state, 'country:', this.selectedCountry);

      const url = `getListingCities?country=${encodeURIComponent(this.selectedCountry)}&state=${encodeURIComponent(state)}&category=${encodeURIComponent(category)}`;
      this.web.getData(url).then(
        (response: any) => {
          console.log('Cities API response:', response);
          if (response.status && response.data) {
            this.filteredCities = response.data;
            console.log("Cities loaded successfully:", this.filteredCities);
          } else {
            console.warn('No cities found:', response.message);
            this.filteredCities = [];
          }
          resolve();
        }
      ).catch((error) => {
        console.error('Error fetching cities:', error);
        this.filteredCities = [];
        resolve();
      });
    });
  }

  onCityChange(event: Event | string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof event === 'string') {
        this.selectedCity = event;
      } else {
        this.selectedCity = (event.target as HTMLSelectElement).value;
      }
      if (this.selectedCity) {
        this.fetchZips(this.selectedCity);
      } else {
        this.filteredZips = [];
      }
      resolve();
    });
  }

  fetchZips(city: string): void {
    const state = this.selectedState || this.searchstate;
    const country = this.selectedCountry || this.searchcountry;
    const category = this.category || this.searchQuery || '';

    const url = `getListingZipCodes?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}&category=${encodeURIComponent(category)}`;

    this.web.getData(url).then(
      (response: any) => {
        if (response.status) {
          this.filteredZips = response.data;
        } else {
          console.warn('No zip codes found:', response.message);
          this.filteredZips = [];
        }
      }
    ).catch((error) => {
      console.error('Error fetching zip codes:', error);
      this.filteredZips = [];
    });
  }

  onResultClick(result: any): void {
    const businessName = typeof result === 'string' ? result : result.company_name;
    this.searchQuery = businessName;
    this.isDropdownOpen = false;
    // Navigate to business
    console.log('Navigating to business:', businessName);
  }

  openDropdown(): void {
    if (this.searchQuery.trim() && this.searchResults.length > 0) {
      this.isDropdownOpen = true;
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  getReviewsnew(listingId: number): void {
    this.http
      .get<any[]>(`${this.apiUrl}getReview/${listingId}`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching reviews:', error);
          return throwError(() => error);
        })
      )
      .subscribe((data) => {
        // Calculate total reviews and average rating
        const totalReviews = data.length;
        const totalRating = data.reduce((sum, review) => sum + review[5], 0);
        const averageRating = totalReviews ? totalRating / totalReviews : 0;

        // Update the business data with review information
        const business = this.businessData.find((b) => b.id === listingId);
        if (business) {
          business.totalReviews = totalReviews;
          business.averageRating = Math.round(averageRating);
        }
      });
  }

  getbanner(ids: number[]): void {
    console.log("entered banner");
    const userId = ids;
    this.http
      .get<any[]>(`${this.apiUrl}getimagesbanner/${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching banners:', error);
          this.businessData.forEach((business, i) => {
            if (!business.slides) {
              business.slides = [];
            }
            const fallbackSlide = {
              img: this.getFallbackImage(i),
              altText: 'No Preview Available'
            };
            const existingSlide = business.slides.find(slide => slide.altText === fallbackSlide.altText);
            if (!existingSlide) {
              business.slides.push(fallbackSlide);
            }
          });

          return throwError(() => error);
        })
      )
      .subscribe(data => {
        console.log("Banners Data:", data);

        // Append the slides data to the corresponding business data
        data.forEach(banner => {
          const business = this.businessData.find(item => item.id === banner[1]);
          if (business) {
            // Add the slides to the business data
            if (!business.slides) {
              business.slides = []; // Initialize slides array if not present
            }


            const newSlide = {
              img: banner[2],  // Image URL from banner data
              altText: banner[3] || 'Banner Image'  // Alt text from banner data
            };

            // Check if the slide with the same altText already exists
            const existingSlide = business.slides.find(slide => slide.altText === newSlide.altText);
            if (!existingSlide) {
              business.slides.push(newSlide);
            }
          }
        });

        console.log('Updated Business Data with Banners:', this.businessData);
      });
  }
  getTopCategories(): void {
    this.isLoadingTopCategories = true;

    this.web.getData('topcategory')
      .then((res: any) => {
        this.isLoadingTopCategories = false;

        if (res?.data?.length) {
          this.topCategories = res.data;
        } else {
          this.topCategories = [];
        }
      })
      .catch((err: any) => {
        this.isLoadingTopCategories = false;
        console.error('Error fetching categories', err);
      });
  }
  updateSeoMetaClientFormat() {

    const category = this.fullcategory || '';
    const city = this.city || '';
    const state = this.state || '';

    // Build location safely (avoid extra commas)
    const locationParts = [city, state].filter(Boolean);
    const location = locationParts.join(', ');

    // ✅ TITLE (Client Format)
    let title = '';

    if (category && location) {
      title = `Top ${category} in ${location} | Global Business Pages`;
    } else if (category) {
      title = `Top ${category} | Global Business Pages`;
    } else {
      title = `Top Businesses | Global Business Pages`;
    }

    this.titleService.setTitle(title);

    // ✅ DESCRIPTION (Client Format)
    let description = '';

    if (category && location) {
      description = `Find trusted ${category} businesses in ${location}. Browse verified companies, contact details, services, and locations on Global Business Pages.`;
    } else if (category) {
      description = `Find trusted ${category} businesses. Browse verified companies, contact details, services, and locations on Global Business Pages.`;
    } else {
      description = `Find trusted businesses. Browse verified companies, contact details, services, and locations on Global Business Pages.`;
    }

    this.meta.updateTag({ name: 'description', content: description });

    // ✅ OPTIONAL (SEO Boost)
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });

  }
  updateMetaTags(): void {
    // Get values from the route parameters
    const country = this.routeCountry || this.searchcountry || '';
    const state = this.routeState || this.searchstate || '';
    const city = this.routeCity || this.searchcity || '';
    const zip = this.routeZip || this.searchzip || '';
    const category = this.country || this.searchQuery || '';

    // Country name mapping
    const countryMap: { [key: string]: string } = {
      'us': 'USA',
      'usa': 'USA',
      'uk': 'UK',
      'ca': 'Canada',
      'au': 'Australia',
      'in': 'India',
      'de': 'Germany',
      'fr': 'France',
    };

    // State name mapping (add more as needed)
    const stateMap: { [key: string]: string } = {
      'or': 'Oregon',
      'ca': 'California',
      'ny': 'New York',
      'tx': 'Texas',
      'fl': 'Florida',
    };

    // Clean category if it has country suffix
    let cleanCategory = category;
    if (country && cleanCategory.toLowerCase().endsWith('-' + country.toLowerCase())) {
      cleanCategory = cleanCategory.slice(0, -(country.length + 1));
    }

    // Format the category/industry name (convert hyphens to spaces and capitalize)
    const formattedCategory = cleanCategory
      ? cleanCategory.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
      : 'Businesses';

    // Format location components
    const formattedCity = city
      ? city.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
      : '';

    const formattedState = state
      ? (stateMap[state.toLowerCase()] || state.toUpperCase())
      : '';

    const formattedCountry = country
      ? (countryMap[country.toLowerCase()] || country.toUpperCase())
      : '';

    // Build location string
    let locationParts: string[] = [];
    if (formattedCity) locationParts.push(formattedCity);
    if (formattedState) locationParts.push(formattedState);
    if (formattedCountry) locationParts.push(formattedCountry);

    const locationString = locationParts.length > 0
      ? locationParts.join(', ')
      : '';

    // Create dynamic title
    let title: string;
    if (cleanCategory && locationString) {
      title = `${formattedCategory} in ${locationString} – List or Find Top ${formattedCategory} for $1.30/Year`;
    } else if (cleanCategory) {
      title = `${formattedCategory} – Find Top ${formattedCategory} Businesses for $1.30/Year`;
    } else if (locationString) {
      title = `Business Directory in ${locationString} – List Your Business for $1.30/Year`;
    } else {
      title = `AI-Powered, SEO-Indexed Business Listings | Global Business Pages`;
    }

    // Create dynamic description
    let description: string;
    if (cleanCategory && locationString) {
      description = `Explore the best ${formattedCategory.toLowerCase()} in ${locationString}. Discover detailed listings with essential business information including websites, addresses, and more! List your business for just $1.30/year.`;
    } else if (cleanCategory) {
      description = `Find top ${formattedCategory.toLowerCase()} businesses worldwide. List your ${formattedCategory.toLowerCase()} business for only $1.30/year and reach customers in 150+ countries.`;
    } else if (locationString) {
      description = `Browse businesses in ${locationString}. List your business for $1.30/year and get found by local and global customers.`;
    } else {
      description = `List your business once and get AI-powered, SEO-indexed visibility locally, nationally, and globally with Global Business Pages — just $1.30 per year.`;
    }
  }


}
