import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../../services/search.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { CountService } from '../../../services/count.service';
import { Meta, Title } from '@angular/platform-browser';
import { WebService } from '../../../services/web.service';
import { environment } from '../../../../environments/environment';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CategorySectionComponent } from '../category-section/category-section.component';
import { AffiliatePopupComponent } from '../../../shared/components/affiliate-popup/affiliate-popup.component';
import { HttpClient } from '@angular/common/http';

const US_STATE_CODE_TO_NAME_SLUG: Record<string, string> = {
  AL: 'alabama',
  AK: 'alaska',
  AZ: 'arizona',
  AR: 'arkansas',
  CA: 'california',
  CO: 'colorado',
  CT: 'connecticut',
  DE: 'delaware',
  FL: 'florida',
  GA: 'georgia',
  HI: 'hawaii',
  ID: 'idaho',
  IL: 'illinois',
  IN: 'indiana',
  IA: 'iowa',
  KS: 'kansas',
  KY: 'kentucky',
  LA: 'louisiana',
  ME: 'maine',
  MD: 'maryland',
  MA: 'massachusetts',
  MI: 'michigan',
  MN: 'minnesota',
  MS: 'mississippi',
  MO: 'missouri',
  MT: 'montana',
  NE: 'nebraska',
  NV: 'nevada',
  NH: 'new-hampshire',
  NJ: 'new-jersey',
  NM: 'new-mexico',
  NY: 'new-york',
  NC: 'north-carolina',
  ND: 'north-dakota',
  OH: 'ohio',
  OK: 'oklahoma',
  OR: 'oregon',
  PA: 'pennsylvania',
  RI: 'rhode-island',
  SC: 'south-carolina',
  SD: 'south-dakota',
  TN: 'tennessee',
  TX: 'texas',
  UT: 'utah',
  VT: 'vermont',
  VA: 'virginia',
  WA: 'washington',
  WV: 'west-virginia',
  WI: 'wisconsin',
  WY: 'wyoming',
};


@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, SlickCarouselModule, FormsModule, NgxSkeletonLoaderModule, CategorySectionComponent, AffiliatePopupComponent],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent implements OnInit, OnDestroy {
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' | null = null;
  searchQuery: string = '';
  searchResults: any[] = [];
  isDropdownOpen: boolean = false;
  filteredStates: string[] = [];
  // location: string = "Houston TX US";
  locationResults: string[] = [];
  locationFilter: string = '';
  isLocationDropdownOpen: boolean = false;
  isTopCategoryLocation: boolean = false;
  pageSize: number = 10;
  location: string = "";
  totalCount: string = '0';
  homeData: any = {};
  safeContent!: SafeHtml;
  httpUrl = environment.base_url;
  contentLoaded: boolean = false;
  locationQuery: string = '';
  filteredZips: string[] = [];
  filteredCities: string[] = [];
  filteredCountries: any[] = []
  city: string = '';
  state: string = '';
  nearbyCities: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  apiUrl = environment.base_url;
  businessNames: string;
  businessData: any[] = [];
  loading: boolean = false;
  selectedCountry: string;
  selectedState: string;
  selectedCity: string;
  country: string;
  currentPage: number = 1;
  totalPages: number = 0;
  locationData: any = {
    location: '',
    nearbyCities: [],
    category: ''
  };
  isCountryLoading: boolean = false;
  showValidationMessage: boolean = false;
  validationMessage: string = '';
  inputTouched: boolean = false;
  category: string = '';
  selectedStars: number = 0;
  isFiltered: boolean = false;
  count: any;
  formattedCount: any;
  countData: any;
  isLoadingNearbyCities = false;
  popularCategories: string[] = [];
  popularCategoriesLoading = false;
  popularCategoriesError = '';
  showAffiliatePopup = false;
  isAffiliateUser: boolean = false;
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;
  searchcountry: string = '';
  routeCountry: string;
  routeState: string;
  routeCity: string;
  routeZip: string;
  searchstate: string = '';
  searchcity: string = '';
  searchzip: string = '';
  routeCategory: string;
  isStatesLoading: boolean = false;
  isCitiesLoading: boolean = false;
  isZipsLoading: boolean = false;
  private countSubscription: Subscription = new Subscription();
  private locationSearchSubject = new Subject<string>();
  private locationSearchSubscription!: Subscription;
  totalRecords: any;
  categorypartial: any;
  /** When set via category carousel, geo + Search navigates to `/usa/.../:categorySlug` (US+city-wide) or `business-directory/.../:categorySlug` for broader/partial scopes. */
  pendingSeoCategorySlug: string | null = null;
  constructor(
    private searchService: SearchService,
    private router: Router,
    private meta: Meta,
    private titleService: Title,
    private countService: CountService,
    private web: WebService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private elementRef: ElementRef
  ) {

    // this.getHomeData();
    console.log("tes1111111");
    this.initializeSearchSubscription();
    // this.initializeLocationSearchSubscription();
  }

  ngOnInit() {
    console.log("testtttt");
    this.loadCountriesAndInitialize();
    this.getHomeData();
    this.isAffiliateUser = localStorage.getItem('affiliateUser') === 'true';
    //  this.getnearbycities();
    // this.countService.initializeFromStorage();
    // this.countSubscription.add(
    //   this.countService.totalCount$.subscribe(count => {
    //     this.totalCount = count;
    //     this.updateMetaTags();
    //   })
    // );
  }
  filteredLocations(): string[] {
    if (!this.locationFilter) {
      return this.locationResults;
    }

    return this.locationResults.filter(loc =>
      loc.toLowerCase().includes(this.locationFilter.toLowerCase())
    );
  }
  toggleLocationDropdown(event: Event) {
    event.stopPropagation();

    this.isLocationDropdownOpen = !this.isLocationDropdownOpen;
  }
  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    setTimeout(() => {
      this.notificationMessage = null;
      this.notificationType = null;
    }, 3000);
  }
  // updateMetaTags(): void {
  //   // console.log('this.totalCount===', this.totalCount);
  //   const title = `List Your Business Worldwide In Global Business Page`;
  //   this.titleService.setTitle(title);

  //   const description = `Total Listings: ${this.totalCount}; Join Global Business Pages to list and promote your business worldwide. Easy, affortable, and trusted by businesses across the globle. Get started today!.`;
  //   this.meta.updateTag({ name: 'description', content: description });
  // }
  formatTitle(value: string | null | undefined): string {
    if (!value) return 'N/A';

    const text = value.replace(/-/g, ' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  onInputFocus(): void {
    this.inputTouched = true;
  }
  async loadCountriesAndInitialize(): Promise<void> {
    try {
      // Wait for initial category to be set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Set dropdown values directly from URL parameters IMMEDIATELY
      this.searchcountry = this.routeCountry || '';
      this.searchstate = this.routeState || '';
      this.searchcity = this.routeCity || '';
      this.searchzip = this.routeZip || '';
      console.log("this.searchcity 1", this.searchcity);

      // Set selected values for cascading dropdowns
      this.selectedCountry = this.routeCountry || '';
      this.selectedState = this.routeState || '';
      this.selectedCity = this.routeCity || '';

      // Force update the DOM
      this.cdr.detectChanges();

      // START MAIN DATA FETCH IMMEDIATELY (don't wait for dropdown APIs)
      console.log('Starting main data fetch immediately with URL parameters:', {
        country: this.selectedCountry,
        state: this.routeState,
        city: this.routeCity,
        zip: this.routeZip,
        category: this.country
      });

      // Perform search immediately - don't await this, let it run in parallel
      this.performSearch();

      // Load dropdown data in the BACKGROUND (non-blocking)
      // This happens AFTER the main data fetch starts
      this.loadDropdownDataInBackground();

    } catch (error) {
      console.error('Error initializing from URL parameters:', error);
      // Still try to perform search
      this.performSearch();
    }
  }
  // New method to load dropdown data in background (non-blocking)
  private async loadDropdownDataInBackground(): Promise<void> {
    try {
      // Fetch countries for dropdown (background)
      await this.fetchescountry();
      console.log('Countries loaded in background:', this.filteredCountries);

      // Initialize cascading dropdowns from URL parameters (background)
      if (this.routeCountry) {
        try {
          await this.onCountryChange(this.routeCountry);
          if (this.routeState) {
            await this.onStateChange(this.routeState);
            if (this.routeCity) {
              await this.onCityChange(this.routeCity);
            }
          }
        } catch (error) {
          console.log('Error initializing cascading dropdowns in background:', error);
        }
      }
    } catch (error) {
      console.error('Error loading dropdown data in background:', error);
    }
  }
  fetchescountry(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Use the category from the URL or searchQuery
      const category = this.country || this.searchQuery || '';
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
          if (this.routeCountry && !this.filteredCountries.includes(this.routeCountry)) {
            this.filteredCountries.unshift(this.routeCountry);
          }

          resolve();
        },
        (error) => {
          console.error('Error fetching countries:', error);
          this.filteredCountries = [];

          // Always add routeCountry to filteredCountries if it exists
          if (this.routeCountry && !this.filteredCountries.includes(this.routeCountry)) {
            this.filteredCountries.unshift(this.routeCountry);
          }

          resolve();
        }
      );
    });
  }


  getListingCountryPartial(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Use taxonomy slug/display from carousel or typed query (not geographic `country`)
      this.isCountryLoading = true;
      const category = this.categoryForPartialGeoApis();
      console.log('Fetching countries with category:', category);

      const url = `${this.apiUrl}getListingCountryPartial?category=${encodeURIComponent(category)}`;
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
          if (this.routeCountry && !this.filteredCountries.includes(this.routeCountry)) {
            this.filteredCountries.unshift(this.routeCountry);
          }
          this.isCountryLoading = false;
          resolve();
        },
        (error) => {
          console.error('Error fetching countries:', error);
          this.filteredCountries = [];

          // Always add routeCountry to filteredCountries if it exists
          if (this.routeCountry && !this.filteredCountries.includes(this.routeCountry)) {
            this.filteredCountries.unshift(this.routeCountry);
          }
          this.isCountryLoading = false;
          resolve();
        }
      );
    });
  }

  initializeSearchSubscription(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        switchMap((query) => this.searchService.search(query))
      )
      .subscribe({
        next: (data) => {

          this.searchResults = data?.displayed_data ?? [];

          this.isDropdownOpen = this.searchResults.length >= 0;
        },
        error: (error) => {
          console.error('Error fetching search results:', error);
        }
      });
  }
  initializeLocationSearchSubscription(): void {
    this.locationSearchSubscription = this.locationSearchSubject
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        switchMap((query) => this.searchService.searchlocation(query))
      )
      .subscribe({
        next: (data) => {
          this.locationResults = data?.displayed_data ?? [];
          this.isLocationDropdownOpen = this.locationResults.length >= 0;
          console.log(this.isLocationDropdownOpen, "this.isLocationDropdownOpen");

        },
        error: (error) => {
          console.error('Error fetching location results:', error);
        }
      });
  }

  // performSearch(page: number = 1): void {
  //   if (this.searchQuery.trim()) {

  //     this.searchSubject.next(this.searchQuery);

  //   } else {
  //     this.searchResults = [];
  //     this.isDropdownOpen = false;
  //   }
  //   this.showValidationMessage = false;
  // }
  performLocationSearch(): void {
    if (this.locationQuery.trim()) {
      this.locationSearchSubject.next(this.locationQuery);
    } else {
      this.locationResults = [];
      this.isLocationDropdownOpen = false;
    }
  }
  selectLocation(result: any): void {
    this.locationQuery = result;
    this.isLocationDropdownOpen = false;
    const parts = this.locationQuery.split(', ');

    if (parts.length === 3) {
      // Format: "city, state, country"
      this.city = parts[0];
      this.state = parts[1];
      const country = parts[2];
      this.location = `${this.city} ${this.state} ${country}`;
      this.locationData.location = this.location;
      this.locationData.category = this.category || '';
    } else if (parts.length === 2) {
      // Fallback for old format: "city, state"
      this.city = parts[0];
      this.state = parts[1];
      const country = 'US'; // default fallback
      this.location = `${this.city} ${this.state} ${country}`;
      this.locationData.location = this.location;
      this.locationData.category = this.category || '';
    }
    const businessSlug = this.searchQuery;
    this.navigateToBusiness(businessSlug);
    //  this.getnearbycities();
  }

  // Add a method to set category (you might call this from somewhere else)
  setCategory(category: string): void {
    this.category = category;
    this.locationData.category = category;
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.countSubscription?.unsubscribe();
  }

  openDropdown(): void {
    if (this.searchQuery.trim() && this.searchResults.length > 0) {
      this.isDropdownOpen = true;
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
    this.isLocationDropdownOpen = false;
  }


  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: MouseEvent): void {
  //   const target = event.target as HTMLElement;
  //   const searchBox = document.getElementById('searchBox');

  //   if (searchBox && !searchBox.contains(target)) {
  //     this.closeDropdown();
  //   }

  // }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {

    const target = event.target as HTMLElement;
    const searchBox = document.getElementById('searchBox');
    const locationDropdown = document.getElementById('locationDropdown');

    // ✅ If clicking inside search box → close location dropdown
    if (searchBox && searchBox.contains(target)) {
      this.isLocationDropdownOpen = false;
      return;
    }

    // ✅ If clicking inside location dropdown → do nothing
    if (locationDropdown && locationDropdown.contains(target)) {
      return;
    }

    // ✅ Otherwise close everything
    this.closeDropdown(); // business dropdown
    this.isLocationDropdownOpen = false;
  }
  // onResultClick(result: any): void {
  //   this.searchQuery = result;
  //   this.isDropdownOpen = false;
  //   this.searchResults = [];
  // const formattedQuery = encodeURIComponent(result).replace(/[!'()*-+_]/g, escape).toLowerCase();
  // // console.log('formattedQuery', formattedQuery);
  // this.isDropdownOpen = false;

  // this.router.navigate([`/${formattedQuery}`], {
  //   state: { displayData: result }
  // });

  //}
  onResultClick(result: any): void {
    // result could be a string (business name) or object
    const businessName = typeof result === 'string' ? result : result.company_name;
    this.searchQuery = businessName;
    // Close dropdown
    this.isDropdownOpen = false;
    this.cdr.detectChanges();
    // this.fetchLocationsByKeyword();
    this.country = result;
    this.fetchescountry();
    this.ngOnInit();
    // Build the route
    // this.navigateToBusiness(businessName);
  }

  receiveCategory(category: string) {
    const slug = (category ?? '').trim().toLowerCase();
    this.categorypartial = slug || category;
    this.pendingSeoCategorySlug = slug || null;
    console.log('Received category in search-bar (SEO slug):', this.pendingSeoCategorySlug);
    this.isTopCategoryLocation = true;
    this.getListingCountryPartial();
    queueMicrotask(() => {
      const el =
        typeof document !== 'undefined'
          ? document.getElementById('homepage-location-filters')
          : null;
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /** URL segment for programmatic `/usa/:state/:city/:category` (hyphen slug). */
  private slugSegmentForSeo(raw: string): string {
    if (!(raw ?? '').trim()) {
      return '';
    }
    return raw
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /** Converts US state code (`AK`) or name (`Alaska`) to required full-name slug (`alaska`). */
  private stateSlugForSeo(raw: string): string {
    const normalized = (raw || '').trim().toUpperCase();
    if (normalized && US_STATE_CODE_TO_NAME_SLUG[normalized]) {
      return US_STATE_CODE_TO_NAME_SLUG[normalized];
    }
    return this.slugSegmentForSeo(raw);
  }

  private isUnitedStatesSelection(country: string): boolean {
    const raw = (country || '').trim();
    if (!raw) {
      return false;
    }
    const compact = raw.toUpperCase().replace(/[.\s]/g, '');
    if (compact === 'US' || compact === 'USA' || compact.includes('UNITEDSTATES')) {
      return true;
    }
    const slug = this.slugSegmentForSeo(raw);
    return slug === 'us' || slug === 'usa' || slug === 'united-states';
  }

  /** Category slug for SEO `/usa/...` navigation (carousel or partial filter). */
  private categorySlugForSeoNavigation(): string {
    const pending = (this.pendingSeoCategorySlug || '').trim().toLowerCase();
    const partial =
      this.categorypartial != null && `${this.categorypartial}`.trim() !== ''
        ? `${this.categorypartial}`.trim().toLowerCase()
        : '';
    return pending || partial;
  }

  /** Resolve geo dropdowns — partial filters use ngModel `search*`; legacy row uses `selected*`. */
  private geoSelectionsForSearch(): { country: string; state: string; city: string; zip: string } {
    return {
      country: this.selectedCountry || this.searchcountry || this.routeCountry || '',
      state: this.selectedState || this.searchstate || this.routeState || '',
      city: this.selectedCity || this.searchcity || this.routeCity || '',
      zip: (this.searchzip || this.routeZip || '').trim(),
    };
  }

  /**
   * After carousel category pick, navigate US searches to SEO landing (`/usa/...`) by geo depth:
   * - category only → `/usa/:category`
   * - state + category → `/usa/:state/:category`
   * - state + city + category → `/usa/:state/:city/:category` (optional zip query)
   * Non-US still uses `business-directory/...`. City requires state; zip requires city + state.
   */
  private attemptSeoCarouselNavigation(): boolean {
    const pendingCat = this.categorySlugForSeoNavigation();
    if (!pendingCat) {
      return false;
    }

    const { country, state, city, zip } = this.geoSelectionsForSearch();

    const c = city.trim();
    const s = state.trim();
    const z = zip.trim();

    if (c !== '' && s === '') {
      return false;
    }
    if (z !== '' && (s === '' || c === '')) {
      return false;
    }

    if (!country.trim()) {
      return false;
    }

    if (this.isUnitedStatesSelection(country)) {
      const navExtras = z !== '' ? { queryParams: { zip: z } } : {};
      if (c !== '' && s !== '') {
        const stateSlug = this.stateSlugForSeo(state);
        const citySlug = this.slugSegmentForSeo(city);
        if (stateSlug && citySlug) {
          this.router.navigate(['/usa', stateSlug, citySlug, pendingCat], navExtras);
          this.pendingSeoCategorySlug = null;
          return true;
        }
      } else if (s !== '') {
        const stateSlug = this.stateSlugForSeo(state);
        if (stateSlug) {
          this.router.navigate(['/usa', stateSlug, pendingCat], navExtras);
          this.pendingSeoCategorySlug = null;
          return true;
        }
      } else {
        this.router.navigate(['/usa', pendingCat], navExtras);
        this.pendingSeoCategorySlug = null;
        return true;
      }
    }

    const countrySlug = this.slugSegmentForSeo(country);
    if (!countrySlug) {
      return false;
    }

    const segments: string[] = ['/business-directory', countrySlug];
    if (s !== '') {
      const stateSlug = this.slugSegmentForSeo(state);
      if (!stateSlug) {
        return false;
      }
      segments.push(stateSlug);
    }
    if (c !== '') {
      const citySlug = this.slugSegmentForSeo(city);
      if (!citySlug) {
        return false;
      }
      segments.push(citySlug);
    }
    if (z !== '') {
      segments.push(z.toLowerCase());
    }

    segments.push(pendingCat);
    this.router.navigate(segments);
    this.pendingSeoCategorySlug = null;
    return true;
  }

  /** Taxonomy slug or search text for carousel + geo `getListing*Partial` APIs (matches getListingCountryPartial). */
  private categoryForPartialGeoApis(): string {
    const fromPartial =
      this.categorypartial != null && `${this.categorypartial}`.trim() !== ''
        ? `${this.categorypartial}`.trim()
        : '';
    return fromPartial || (this.searchQuery || '').trim();
  }

  // onResultClick(result: any): void {
  //   console.log('Result Clicked:', result);
  //   const formattedQuery = result?.replace(/\s+/g, '-').toLowerCase();
  //   this.isDropdownOpen = false;
  //   // this.router.navigate([`/${formattedQuery}`]);

  //   // this.router.navigate([`/${formattedQuery}`], {
  //   //   state: { displayData: result }
  //   // });
  //   this.country = result;
  //   this.ngOnInit();

  // }


  // private navigateToBusiness(businessName: string): void {
  //   if (!this.location) {
  //     this.location = 'RICHARDSON-FORT AK US';
  //   }


  //   const parts = this.location.split(' ');

  //   const country = parts.pop();
  //   const state = parts.pop();
  //   const city = parts.join(' ');

  //   const citySlug = city.toLowerCase().replace(/\s+/g, '-');
  //   const businessSlug = businessName.toLowerCase().replace(/\s+/g, '-');


  //   const route = ['', country!, state!, citySlug, businessSlug];

  //   console.log('Navigating to:', route);
  //   this.sendCategoryData(city, state, businessName);
  //   this.router.navigate(route);
  // }

  private navigateToBusiness(businessName: string): void {
    // Fallback location
    // if (!this.location) {
    //   this.location = 'RICHARDSON-FORT AK US';
    // }

    // Location format: "CITY STATE COUNTRY"
    const parts = this.location.split(' ');

    const country = parts.pop()!; // US
    const state = parts.pop()!;   // AK
    const city = parts.join(' '); // RICHARDSON-FORT

    // Slugs
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    const categorySlug = businessName.toLowerCase().replace(/\s+/g, '-');


    this.sendCategoryData(city, state, businessName);

    this.router.navigate([
      'business-directory',
      country,
      state,
      citySlug,
      categorySlug
    ]);
  }

  private async fetchLocationsByKeyword(): Promise<void> {
    try {
      const response = await this.web.getData(
        `searchLocationByKeyword?q=${encodeURIComponent(this.searchQuery)}`
      );

      if (response) {
        this.locationResults = response.displayed_data;
        this.isLocationDropdownOpen = true;
      } else {
        this.locationResults = [];
        this.isLocationDropdownOpen = false;
      }

    } catch (error) {
      console.error('Error fetching locations:', error);
      this.locationResults = [];
      this.isLocationDropdownOpen = false;
    }
  }

  private async sendCategoryData(city: string, state: string, category?: string): Promise<void> {
    try {
      const response = await this.web.postData('storepopularcategory', {
        form: {
          city: city,
          state: state,
          category: category
        }
      });

      if (response.status) {
        console.log('Category data stored successfully');
      } else {
        console.log('Failed to store category data');
      }
    } catch (error) {
      console.error('Error sending category data:', error);
    }
  }
  private navigateToSearchResults(): void {
    const parts = this.location.split(' ');

    const country = parts.pop();
    const state = parts.pop();
    const city = parts.join(' ');

    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    const searchSlug = this.searchQuery.toLowerCase().replace(/\s+/g, '-');

    const route = ['', country!, state!.toLowerCase(), citySlug, 'search', searchSlug];

    console.log('Navigating to search results:', route);
    this.router.navigate(route);
  }
  onSearchButtonClick(): void {
    if (!this.searchQuery.trim()) {
      this.showValidationMessage = true;
      this.showNotification('Please enter the Business Name', 'error');
      return;
    }

    // if (!this.location) {
    //   this.location = 'RICHARDSON-FORT AK US';
    // }
    this.showValidationMessage = false;
    const businessSlug = this.searchQuery;
    this.navigateToBusiness(businessSlug);
  }

  getHomeData() {
    console.log("entered getHomeData");

    this.web.getData('getSearchbar').then((res: any) => {
      console.log('entered getHomeData 1', res);
      if (res.status && res.data.length > 0) {
        console.log('entered getHomeData 2');
        this.homeData = res.data[0];
        console.log('this.homeData', this.homeData);
        // Sanitize and set the content
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.homeData.content);

        // Set contentLoaded to true immediately after data is received
        this.contentLoaded = true;
      } else {
        // Even if no data, stop showing skeleton
        this.contentLoaded = true;
      }
    }).catch(err => {
      console.error('Error loading home data:', err);
      // Stop skeleton loader even on error
      this.contentLoaded = true;
    });
  }
  onInputBlur(): void {
    if (this.inputTouched && !this.searchQuery.trim()) {
      this.showValidationMessage = true;
      this.validationMessage = 'Enter business name';
    }
  }

  onCategoryClick(): void {


    const { country, state, city } = this.geoSelectionsForSearch();
    const zip = this.searchzip || this.routeZip || '';
    const category = this.categorypartial || '';

    const formattedCountry = country?.toLowerCase() || '';
    const formattedState = state?.toLowerCase() || '';
    const formattedCity = city?.replace(/\s+/g, '-').toLowerCase() || '';
    const formattedZip = zip?.toLowerCase() || '';
    const formattedCategory = category?.replace(/\s+/g, '-').toLowerCase() || '';
    console.log("formattedCountry", formattedCountry, "formattedState", formattedState, "formattedCity", formattedCity, "formattedZip", formattedZip, "formattedCategory", formattedCategory);
    let url = '/business';

    if (formattedCountry) url += `/${formattedCountry}`;
    if (formattedState) url += `/${formattedState}`;
    if (formattedCity) url += `/${formattedCity}`;
    if (formattedZip) url += `/${formattedZip}`;
    if (formattedCategory) url += `/${formattedCategory}`;

    this.router.navigateByUrl(url);
  }
  // listing page code

  performSearch(page: number = 1): void {

    //  if (this.searchQuery.trim()) {

    //   this.searchSubject.next(this.searchQuery);

    // } else {
    //   this.searchResults = [];
    //   this.isDropdownOpen = false;
    // }
    // this.showValidationMessage = false;

    this.businessData = [];
    this.currentPage = page;
    this.loading = true;

    //   this.updateUrl();

    // Get values from dropdown selections or route params
    const { country, state, city, zip } = this.geoSelectionsForSearch();

    const slugFromPartialRaw =
      this.categorypartial != null && `${this.categorypartial}`.trim() !== ''
        ? `${this.categorypartial}`.trim().toLowerCase()
        : '';
    const categoryText = (this.searchQuery || '').trim();

    // Update breadcrumb variables to reflect current search
    this.routeCountry = country;
    this.routeState = state;
    this.routeCity = city;
    this.routeZip = zip;
    this.routeCategory = slugFromPartialRaw || categoryText;

    // Update dropdown values to reflect current search
    this.searchcountry = country;
    this.searchstate = state;
    this.searchcity = city;
    this.searchzip = zip;
    console.log('this.searchcity 5', this.searchcity);
    // Update selected values for cascading dropdowns
    this.selectedCountry = country;
    this.selectedState = state;
    this.selectedCity = city;

    const seoCategorySelected = !!this.categorySlugForSeoNavigation();
    if (seoCategorySelected) {
      const cTrim = city.trim();
      const sTrim = state.trim();
      const zTrim = zip.trim();

      if (!country.trim()) {
        this.loading = false;
        this.showNotification('Select a country to search with your category.', 'error');
        this.cdr.detectChanges();
        return;
      }
      if (cTrim && !sTrim) {
        this.loading = false;
        this.showNotification('Select a state when searching by city.', 'error');
        this.cdr.detectChanges();
        return;
      }
      if (zTrim && (!sTrim || !cTrim)) {
        this.loading = false;
        this.showNotification('Select state and city when searching by ZIP.', 'error');
        this.cdr.detectChanges();
        return;
      }
    }

    // Carousel + geo → `/business-directory/.../:categorySlug` or US locality `/usa/.../:slug`
    if (this.attemptSeoCarouselNavigation()) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    // Trigger change detection to update the dropdowns
    this.cdr.detectChanges();

    console.log('Search parameters:', {
      country,
      state,
      city,
      zip,
      categoryText,
      category_slug: slugFromPartialRaw || undefined,
    });

    const params = new URLSearchParams();
    params.set('country', country);
    params.set('state', state);
    params.set('city', city);
    params.set('zip', zip);
    if (slugFromPartialRaw) {
      params.set('category_slug', slugFromPartialRaw);
    }
    if (categoryText) {
      params.set('category', categoryText);
    }
    params.set('page', String(this.currentPage));
    params.set('page_size', String(this.pageSize));

    if (
      !country.trim() &&
      !state.trim() &&
      !city.trim() &&
      !zip.trim() &&
      !categoryText &&
      !slugFromPartialRaw
    ) {
      console.log('All search parameters are empty. API call skipped.');
      this.loading = false;
      this.businessData = [];
      return;
    }

    this.http.get(`${this.apiUrl}searchallbusinessListing?${params.toString()}`).subscribe(
      (response: any) => {
        //this.showfilter = true;
        console.log("Search response:", response);

        if (response.status && response.data && response.data.length > 0) {
          // Process the data...
          const totalPages = Math.ceil(response.pagination.total_records / this.pageSize);
          const hasPreviousPage = this.currentPage > 1;
          const hasNextPage = this.currentPage < totalPages;

          const geocoder = new google.maps.Geocoder();
          this.totalRecords = response.pagination.total_records;
          response.data.forEach((item: any) => {
            console.log('item:', item);
            // this.getReviewsnew(item.id);
            // this.getbanner(item.id);

            // Add to filteredCountries if not already there
            if (item.country && !this.filteredCountries.includes(item.country)) {
              this.filteredCountries.push(item.country);
            }

            // Process business data...
            const ListingId = item.id;
            const company_name = item.company_name || item.business_name;
            const industry = item.industry || item.description;
            const sic_description = item.sic_description || item.category;
            const address = item.address || item.region;
            const city = item.city || '';
            const state = item.state || '';
            const country = item.country || '';
            const zip_code = item.zip || item.zip_code;
            const phone = item.phone || '';
            const slug_url = item.slug_url || '';
            const source_table = item.source_table || '';
            const fullAddress = `${address}, ${city}, ${state}, ${country}, ${zip_code}`;

            // Geocoding logic...
            geocoder.geocode({ address: fullAddress }, (results, status) => {
              try {
                if (status === 'OK' && results[0]) {
                  const location = results[0].geometry.location;

                  this.businessData.push({
                    id: ListingId,
                    company_name: company_name,
                    industry: industry,
                    sic_description: sic_description,
                    region: address,
                    city: city,
                    state: state,
                    country: country,
                    phone: phone,
                    slug_url: slug_url,
                    source_table: source_table,
                    geocodedLocation: {
                      lat: location.lat(),
                      lng: location.lng(),
                    },
                    slides: [{ img: '', altText: '' }],
                  });
                } else {
                  throw new Error(`Geocoding failed with status: ${status}`);
                }
              } catch (error) {
                console.error(error.message);

                // Add without geocoding
                this.businessData.push({
                  id: ListingId,
                  company_name: company_name,
                  industry: industry,
                  sic_description: sic_description,
                  region: address,
                  city: city,
                  state: state,
                  country: country,
                  phone: phone,
                  slug_url: slug_url,
                  source_table: source_table,
                  geocodedLocation: null,
                  slides: [{ img: '', altText: '' }],
                });
              }
            });
          });

          const businessNamesString = response.data
            .map((item: any) => item.company_name || item.business_name || 'Unnamed Business')
            .join(', ');

          this.businessNames = businessNamesString;

          const pagination = {
            totalPages,
            hasPreviousPage,
            hasNextPage,
          };

          this.updatePagination(pagination);
          this.loading = false;
          //  this.updateMetaTags();

          // Fetch nearby cities and popular categories after search results are loaded
          this.getnearbycities();

        } else {
          // No results found
          console.log('No results found for search parameters');
          this.businessData = [];
          this.loading = false;

          // Clear pagination
          const paginate = document.getElementById('paginate');
          if (paginate) {
            paginate.innerHTML = '';
          }
        }
        this.getPopularCategories();
      },
      (error) => {
        console.error('Error fetching search results:', error);
        this.businessData = [];
        this.loading = false;
      }
    );
  }
  updatePaginationnew(pagination: any): void {
    const paginate = document.getElementById('paginate');
    if (!paginate) return;

    paginate.innerHTML = ''; // Clear the existing pagination

    const totalPages = pagination.total_pages;
    const currentPage = pagination.page;

    // Set pageLimit dynamically based on screen width
    let pageLimit = 5; // Default for desktop
    const screenWidth = window.innerWidth;

    if (screenWidth < 640) {
      pageLimit = 1; // Mobile view
    } else if (screenWidth < 1024) {
      pageLimit = 5; // Tablet view
    } else {
      pageLimit = 7; // Desktop view
    }

    let startPage = Math.max(1, currentPage - Math.floor(pageLimit / 2));
    let endPage = Math.min(totalPages, currentPage + Math.floor(pageLimit / 2));

    if (currentPage - Math.floor(pageLimit / 2) < 1) {
      endPage = Math.min(totalPages, endPage + (Math.floor(pageLimit / 2) - (currentPage - 1)));
    }
    if (currentPage + Math.floor(pageLimit / 2) > totalPages) {
      startPage = Math.max(1, startPage - (Math.floor(pageLimit / 2) - (totalPages - currentPage)));
    }

    // Create Previous button
    const prevButton = this.createPaginationButton(
      'Previous',
      pagination.page > 1,
      () => this.performSearches(currentPage - 1)
    );
    paginate.appendChild(prevButton);

    // Create page buttons
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = this.createPaginationButton(
        i.toString(),
        true,
        () => this.performSearches(i),
        i === currentPage
      );
      paginate.appendChild(pageButton);
    }

    // Create Next button
    const nextButton = this.createPaginationButton(
      'Next',
      pagination.page < totalPages,
      () => this.performSearches(currentPage + 1)
    );
    paginate.appendChild(nextButton);
  }
  performSearches(page: number): void {
    const country = this.country; // Provide the required parameter
    this.getdata(country, page);
    console.log('Performing search for page:', page);
  }
  getdata(country: any, page_no: number = 1): void {
    this.loading = true;

    // Don't override the category if it's already set from URL
    const searchCategory = this.country || country;

    this.http.get<any>(`${this.apiUrl}getlistingdata`, {
      params: {
        country: searchCategory,
        page: page_no.toString(),
        page_size: '10'
      }
    }).subscribe(
      response => {
        this.businessData = response.data;
        console.log('API Response:', response.data);

        // Call methods to update pagination
        this.updatePaginationnew(response.pagination);
        this.loading = false;

        // Fetch reviews for each business
        this.businessData.forEach(business => {
          // this.getReviewsnew(business.id);
          // this.getbanner(business.id);
        });

        // Don't call fetchescountry here as it will interfere with the initialization
      },
      error => {
        console.error('API Error:', error);
        this.loading = false;
      }
    );
  }
  redirectregister() {
    this.router.navigate(['/register']);
  }
  redirectToListing(listingId: string, businessName: string, industry: string, business_country: string, business_state: string, business_city: string, business_zip_code: string, sic_description: string): void {
    console.log("Listing ID:", listingId);

    const url = `${this.apiUrl}getregistration/${listingId}`; // Correct API endpoint

    this.http.get(url).subscribe((response: any) => {
      if (response.status === "exist") {
        console.log("Response.SOURCE", response);

        const country = (document.getElementById('country') as HTMLInputElement)?.value?.trim() || business_country;
        const state = (document.getElementById('state') as HTMLInputElement)?.value?.trim() || business_state;
        const city = (document.getElementById('city') as HTMLInputElement)?.value?.trim() || business_city;
        const zip = (document.getElementById('zip') as HTMLInputElement)?.value?.trim() || business_zip_code;

        const formattedBusinessName = businessName?.replace(/\s+/g, '-').toLowerCase();
        const formattedIndustry = industry?.replace(/\s+/g, '-').toLowerCase();
        const formattedCountry = country?.replace(/\s+/g, '-').toLowerCase() || '';
        const formattedState = state?.replace(/\s+/g, '-').toLowerCase() || '';
        const formattedCity = city?.replace(/\s+/g, '-').toLowerCase() || '';
        const formattedZip = zip?.replace(/\s+/g, '-').toLowerCase() || '';
        // const formattedId = listingId?.replace(/\s+/g, '-').toLowerCase() || '';

        let navigateUrl = `/business-directory-registered`;
        if (country) navigateUrl += `/${formattedCountry}`;
        if (state) navigateUrl += `/${formattedState}`;
        if (city) navigateUrl += `/${formattedCity}`;
        if (zip) navigateUrl += `/${formattedZip}`;
        if (industry) navigateUrl += `/${formattedIndustry}`;
        if (businessName) navigateUrl += `/${formattedBusinessName}`;
        if (listingId) navigateUrl += `/${listingId}`;
        this.router.navigate([navigateUrl], { state: { id: listingId, source: response.source, data: response.data } });
      } else {
        console.log("else enter");
        const country = (document.getElementById('country') as HTMLInputElement)?.value?.trim() || business_country;
        const state = (document.getElementById('state') as HTMLInputElement)?.value?.trim() || business_state;
        const city = (document.getElementById('city') as HTMLInputElement)?.value?.trim() || business_city;
        const zip = (document.getElementById('zip') as HTMLInputElement)?.value?.trim() || business_zip_code;

        const formattedIndustry = encodeURIComponent(industry?.replace(/\s+/g, '-').toLowerCase());
        const formattedSicDescription = encodeURIComponent(sic_description?.replace(/\s+/g, '-').toLowerCase());
        const formattedBusinessName = encodeURIComponent(businessName?.replace(/\s+/g, '-').toLowerCase());

        const formattedCountry = country?.replace(/\s+/g, '-').toLowerCase() || '';
        const formattedState = state?.replace(/\s+/g, '-').toLowerCase() || '';
        const formattedCity = city?.replace(/\s+/g, '-').toLowerCase() || '';
        const formattedZip = zip?.replace(/\s+/g, '-').toLowerCase() || '';
        // const formattedId = listingId?.replace(/\s+/g, '-').toLowerCase() || '';
        console.log("maharaja", listingId)
        let navigateUrl = `/business-directory`;
        if (country) navigateUrl += `/${formattedCountry}`;
        if (state) navigateUrl += `/${formattedState}`;
        if (city) navigateUrl += `/${formattedCity}`;
        if (zip) navigateUrl += `/${formattedZip}`;
        if (industry) navigateUrl += `/${formattedIndustry}`;
        if (sic_description) navigateUrl += `/${formattedSicDescription}`;
        if (businessName) navigateUrl += `/${formattedBusinessName}`;
        if (listingId) navigateUrl += `/${listingId}`;
        this.router.navigate([navigateUrl], { state: { id: listingId, source: response.source, data: response.data } });

        // console.error("Listing ID not found in either table.");
      }
    }, error => {
      console.error("Error:", error);
    });
  }


  updatePagination(pagination: any): void {
    const paginate = document.getElementById('paginate');
    if (!paginate) return;

    paginate.innerHTML = '';

    const totalPages = pagination.totalPages;
    const currentPage = this.currentPage;
    const pageLimit = 5;

    let startPage = Math.max(1, currentPage - Math.floor(pageLimit / 2));
    let endPage = Math.min(totalPages, currentPage + Math.floor(pageLimit / 2));

    if (currentPage - Math.floor(pageLimit / 2) < 1) {
      endPage = Math.min(totalPages, endPage + (Math.floor(pageLimit / 2) - (currentPage - 1)));
    }
    if (currentPage + Math.floor(pageLimit / 2) > totalPages) {
      startPage = Math.max(1, startPage - (Math.floor(pageLimit / 2) - (totalPages - currentPage)));
    }

    const prevButton = this.createPaginationButton(
      'Previous',
      pagination.hasPreviousPage,
      () => this.performSearch(currentPage - 1)
    );
    paginate.appendChild(prevButton);

    for (let i = startPage; i <= endPage; i++) {
      const pageButton = this.createPaginationButton(
        i.toString(),
        true,
        () => this.performSearch(i),
        i === currentPage
      );
      paginate.appendChild(pageButton);
    }

    const nextButton = this.createPaginationButton(
      'Next',
      pagination.hasNextPage,
      () => this.performSearch(currentPage + 1)
    );
    paginate.appendChild(nextButton);
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
    button.className = `px-4 py-2 text-sm rounded ${enabled ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      } ${isActive ? 'bg-blue-600 text-white' : ''}`;

    if (enabled) {
      button.addEventListener('click', () => clickHandler());
    }

    return button;
  }

  performelasticSearch(page: number = 1): void {
    this.currentPage = page;
    if (this.searchQuery.trim()) {
      this.searchSubject.next(this.searchQuery); // Emit the latest search query
      // this.updateUrl();
    } else {
      this.searchResults = [];
      this.isDropdownOpen = false;
    }
  }
  onBusinessClick(business: any): void {
    if (business.slug_url) {
      this.router.navigateByUrl(business.slug_url, { state: { id: business.id, data: business } });
      return;
    }

    // Optional: if you want category from clicked business
    this.searchQuery = business.category || business.sic_description || business.company_name || business.business_name;

    // Update URL
    const url = this.buildUrl();

    // Navigate properly
    this.router.navigateByUrl(url);
  }
  buildUrl(): string {

    const { country, state, city } = this.geoSelectionsForSearch();
    const zip = this.searchzip || this.routeZip || '';
    const category = this.country || this.searchQuery || '';

    const formattedCountry = country?.toLowerCase() || '';
    const formattedState = state?.toLowerCase() || '';
    const formattedCity = city?.replace(/\s+/g, '-').toLowerCase() || '';
    const formattedZip = zip?.toLowerCase() || '';
    const formattedCategory = category?.replace(/\s+/g, '-').toLowerCase() || '';

    let url = '/business-directory';

    if (formattedCountry) url += `/${formattedCountry}`;
    if (formattedState) url += `/${formattedState}`;
    if (formattedCity) url += `/${formattedCity}`;
    if (formattedZip) url += `/${formattedZip}`;
    if (formattedCategory) url += `/${formattedCategory}`;

    return url;
  }
  // initializeSearchSubscription(): void {
  //   console.log("search_subject", this.searchSubject);
  //   this.searchSubscription = this.searchSubject
  //     .pipe(
  //       debounceTime(100),
  //       distinctUntilChanged(),
  //       switchMap((query) => this.searchService.search(query))
  //     )
  //     .subscribe({
  //       next: (data) => {
  //         console.log('dataaaa', data);
  //         this.searchResults = data?.displayed_data ?? []; // Ensure it's always an array
  //         console.log('this.searchResults length', this.searchResults.length);
  //         this.isDropdownOpen = this.searchResults.length >= 0;
  //       },
  //       error: (error) => {
  //         console.error('Error fetching search results:', error);
  //       }
  //     });
  // }

  truncateText(text: string): string {
    if (!text) return '';
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  }

  getnearbycities(): void {
    console.log('Fetching nearby cities...');

    if (!this.routeCity || !this.routeState) {
      console.log('City or state not available yet');
      this.nearbyCities = []; // Set to empty array if can't fetch
      return;
    }

    const url = `${this.apiUrl}nearbycities?city=${encodeURIComponent(this.routeCity)}&state=${encodeURIComponent(this.routeState)}&limit=5`;
    console.log('API URL:', url);

    this.isLoadingNearbyCities = true;

    this.http.get(url).subscribe(
      (res: any) => {
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
      },
      err => {
        this.isLoadingNearbyCities = false;
        this.nearbyCities = [];
        this.errorMessage = 'Failed to load nearby cities';
        console.error(err);
      }
    );
  }

  getPopularCategories(): void {
    console.log('Fetching popular categories...');

    // Use routeState if available, otherwise default to 'AK' as per the original request
    const state = this.routeState || 'AK';

    const url = `${this.apiUrl}popularcategories?state=${encodeURIComponent(state)}&limit=5`;
    console.log('Popular Categories API URL:', url);

    this.popularCategoriesLoading = true;
    this.popularCategoriesError = '';

    this.http.get(url).subscribe(
      (res: any) => {
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
      },
      err => {
        this.popularCategoriesLoading = false;
        this.popularCategories = [];
        this.popularCategoriesError = 'Failed to load popular categories';
        console.error('Error fetching popular categories:', err);
      }
    );
  }

  navigateToNearbyCity(cityStr: string): void {
    const cleaned = cityStr.replace(/\(.*?\)/g, '').trim();
    const parts = cleaned.split(',');

    const cityName = parts[0].trim();
    const state = parts[1]?.trim() || this.routeState;

    const country = this.routeCountry;

    const stateSlug = state.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
    const citySlug = cityName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
    const categorySlug = (this.routeCategory || 'businesses').toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

    const route = ['business-directory', country, stateSlug, citySlug, categorySlug];

    console.log('Navigating to nearby city route:', route);
    this.router.navigate(route);
  }

  navigateToCategory(categoryStr: string): void {
    // Keep existing location
    const country = this.routeCountry;
    const state = this.routeState;
    const cityName = this.routeCity;

    // Create city slug (same logic as before)
    const citySlug = cityName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

    // Create category slug
    const categorySlug = categoryStr.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

    // Update only category
    this.routeCategory = categoryStr;

    const route = ['business-directory', country, state, citySlug, categorySlug];

    console.log('Navigating to category route:', route);

    this.router.navigate(route);
  }
  onCountryChange(event: Event | string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof event === 'string') {
        this.selectedCountry = event;
      } else {
        this.selectedCountry = (event.target as HTMLSelectElement).value;
      }

      // Update the searchcountry model
      this.searchcountry = this.selectedCountry;

      // Clear dependent dropdowns

      console.log("this.searchcity 2", this.searchcity);
      if (this.selectedCountry) {
        this.isStatesLoading = true;
        this.fetchStates(this.selectedCountry).then(() => {
          // Trigger change detection to update the UI
          this.cdr.detectChanges();
          resolve();
        }).catch(() => {
          this.isStatesLoading = true;
          this.cdr.detectChanges();
          resolve();
        });
      } else {
        this.isStatesLoading = true;
        // Trigger change detection to update the UI
        this.cdr.detectChanges();
        resolve();
      }
    });
  }

  onCountryChangePartial(event: Event | string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof event === 'string') {
        this.selectedCountry = event;
      } else {
        this.selectedCountry = (event.target as HTMLSelectElement).value;
      }

      // Update the searchcountry model
      this.searchcountry = this.selectedCountry;

      // Clear dependent dropdowns

      console.log("this.searchcity 2", this.searchcity);
      if (this.selectedCountry) {
        this.isStatesLoading = true;
        this.getListingStatesPartial(this.selectedCountry).then(() => {
          // Trigger change detection to update the UI
          this.cdr.detectChanges();
          resolve();
        }).catch(() => {
          this.isStatesLoading = true;
          this.cdr.detectChanges();
          resolve();
        });
      } else {
        this.isStatesLoading = true;
        // Trigger change detection to update the UI
        this.cdr.detectChanges();
        resolve();
      }
    });
  }
  fetchStates(countryCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const category = this.country || this.searchQuery || '';
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
          if (this.routeState && !this.filteredStates.includes(this.routeState)) {
            this.filteredStates.unshift(this.routeState);
          }
          this.isStatesLoading = false;
          resolve();
        },
        (error) => {
          this.isStatesLoading = false;
          console.error('Error fetching states:', error);
          this.filteredStates = this.routeState ? [this.routeState] : [];
          resolve();
        }
      );
    });
  }

  getListingStatesPartial(countryCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const category = this.categoryForPartialGeoApis();
      console.log('Fetching states with category:', category, 'and country:', countryCode);

      const url = `${this.apiUrl}getListingStatesPartial?country=${encodeURIComponent(countryCode)}&category=${encodeURIComponent(category)}`;
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
          if (this.routeState && !this.filteredStates.includes(this.routeState)) {
            this.filteredStates.unshift(this.routeState);
          }
          this.isStatesLoading = false;
          resolve();
        },
        (error) => {
          this.isStatesLoading = false;
          console.error('Error fetching states:', error);
          this.filteredStates = this.routeState ? [this.routeState] : [];
          resolve();
        }
      );
    });
  }


  onStateChange(event: Event | string): Promise<void> {
    this.isCitiesLoading = true;
    return new Promise((resolve) => {
      if (typeof event === 'string') {
        this.selectedState = event;
      }
      else {
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

  onStateChangePartial(event: Event | string): Promise<void> {
    this.isCitiesLoading = true;
    return new Promise((resolve) => {
      if (typeof event === 'string') {
        this.selectedState = event;
      }
      else {
        this.selectedState = (event.target as HTMLSelectElement).value;
      }
      this.searchstate = this.selectedState;
      if (this.selectedState) {
        this.getListingCitiesPartial(this.selectedState);
      } else {
        this.filteredCities = [];
        this.filteredZips = [];
      }
      resolve();
    });
  }
  fetchCities(state: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const category = this.country || this.searchQuery || '';
      console.log('Fetching cities with category:', category, 'state:', state, 'country:', this.selectedCountry);

      const url = `${this.apiUrl}getListingCities?country=${encodeURIComponent(this.selectedCountry)}&state=${encodeURIComponent(state)}&category=${encodeURIComponent(category)}`;
      this.http.get<{ message: string; status: boolean; data: string[] }>(url).subscribe(
        (response) => {
          console.log('Cities API response:', response);
          if (response.status && response.data) {
            this.filteredCities = response.data;
            console.log("Cities loaded successfully:", this.filteredCities);
          } else {
            console.warn('No cities found:', response.message);
            this.filteredCities = [];
          }

          // Always add routeCity to filteredCities if it exists
          if (this.routeCity && !this.filteredCities.includes(this.routeCity)) {
            this.filteredCities.unshift(this.routeCity);
          }
          this.isCitiesLoading = false;
          resolve();
        },
        (error) => {
          console.error('Error fetching cities:', error);
          this.filteredCities = this.routeCity ? [this.routeCity] : [];
          this.isCitiesLoading = false;
          resolve();
        }
      );
    });
  }

  getListingCitiesPartial(state: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const category = this.categoryForPartialGeoApis();
      console.log('Fetching cities with category:', category, 'state:', state, 'country:', this.selectedCountry);

      const url = `${this.apiUrl}getListingCitiesPartial?country=${encodeURIComponent(this.selectedCountry)}&state=${encodeURIComponent(state)}&category=${encodeURIComponent(category)}`;
      this.http.get<{ message: string; status: boolean; data: string[] }>(url).subscribe(
        (response) => {
          console.log('Cities API response:', response);
          if (response.status && response.data) {
            this.filteredCities = response.data;
            console.log("Cities loaded successfully:", this.filteredCities);
          } else {
            console.warn('No cities found:', response.message);
            this.filteredCities = [];
          }

          // Always add routeCity to filteredCities if it exists
          if (this.routeCity && !this.filteredCities.includes(this.routeCity)) {
            this.filteredCities.unshift(this.routeCity);
          }
          this.isCitiesLoading = false;
          resolve();
        },
        (error) => {
          console.error('Error fetching cities:', error);
          this.filteredCities = this.routeCity ? [this.routeCity] : [];
          this.isCitiesLoading = false;
          resolve();
        }
      );
    });
  }

  fetchZips(city: string): void {
    const state = this.selectedState || this.searchstate;
    const country = this.selectedCountry || this.searchcountry;
    const category = this.country || this.searchQuery || '';

    const url = `${this.apiUrl}getListingZipCodes?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}&category=${encodeURIComponent(category)}`;

    this.http.get<{ message: string; status: boolean; data: string[] }>(url).subscribe(
      (response) => {
        if (response.status) {
          this.filteredZips = response.data;
        } else {
          console.warn('No zip codes found:', response.message);
          this.filteredZips = [];
        }
        this.isZipsLoading = false;
      },
      (error) => {
        console.error('Error fetching zip codes:', error);
        this.filteredZips = [];
        this.isZipsLoading = false;
      }
    );
  }

  getListingZipCodesPartial(city: string): void {
    const state = this.selectedState || this.searchstate;
    const country = this.selectedCountry || this.searchcountry;
    const category = this.categoryForPartialGeoApis();

    const url = `${this.apiUrl}getListingZipCodesPartial?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}&category=${encodeURIComponent(category)}`;

    this.http.get<{ message: string; status: boolean; data: string[] }>(url).subscribe(
      (response) => {
        if (response.status) {
          this.filteredZips = response.data;
        } else {
          console.warn('No zip codes found:', response.message);
          this.filteredZips = [];
        }
        this.isZipsLoading = false;
      },
      (error) => {
        console.error('Error fetching zip codes:', error);
        this.filteredZips = [];
        this.isZipsLoading = false;
      }
    );
  }

  onCityChange(event: Event | string): Promise<void> {
    this.isZipsLoading = true;
    return new Promise((resolve) => {
      if (typeof event === 'string') {
        this.selectedCity = event
      }
      else {
        this.selectedCity = (event.target as HTMLSelectElement).value
      }
      if (this.selectedCity) {
        this.fetchZips(this.selectedCity);
      } else {
        this.filteredZips = [];
      }
      resolve();
    });
  }

  onBecomeAffiliate(): void {
    this.isAffiliateUser = localStorage.getItem('affiliateUser') === 'true';
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userId = localStorage.getItem('userId');
    
    if (this.isAffiliateUser) {
      this.router.navigate(['/account/affiliate-dashboard']);
    } else if (isLoggedIn === 'true' && userId) {
      this.router.navigate(['/account/myprofile']);
    } else {
      this.showAffiliatePopup = true;
    }
  }

  closeAffiliatePopup(): void {
    this.showAffiliatePopup = false;
  }

  onCityChangePartial(event: Event | string): Promise<void> {
    this.isZipsLoading = true;
    return new Promise((resolve) => {
      if (typeof event === 'string') {
        this.selectedCity = event
      }
      else {
        this.selectedCity = (event.target as HTMLSelectElement).value
      }
      this.searchcity = this.selectedCity;
      if (this.selectedCity) {
        this.getListingZipCodesPartial(this.selectedCity);
      } else {
        this.filteredZips = [];
      }
      resolve();
    });
  }


}
