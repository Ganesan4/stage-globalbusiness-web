import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Meta, Title } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, Subscription, throwError } from 'rxjs';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ChangeDetectorRef } from '@angular/core';
// import { ListingDataService } from '../services/listingData.service';
import { CountDataService } from '../services/countData.service';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-all-listings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlickCarouselModule, FormsModule],
  templateUrl: './all-listings.component.html',
  styleUrl: './all-listings.component.scss'
})
export class AllListingsComponent {
  response: any;
  isModalOpenreview: boolean = false;
  ReviewForm: FormGroup;
  pageSize: number = 10;
  filteredStates: string[] = [];
  isApplyFiltersClicked: boolean = false;
  isSidebarOpen = false;
  isDistanceSelected = false;
  showDropdown = false;
  detectedAddress = '';
  detectedCity = '';
  detectedState = '';
  detectedCountry = '';
  filteredCities: string[] = [];
  slides: { img: string, altText: string }[] = [];
  filteredZips: string[] = [];
  // searchQuery: string = '';
  currentPage: number = 1;
  totalPages: number = 0;
  filteredCountries: any[] = []
  businessData: any[] = [];
  bannerData: any[] = [];
  loading: boolean = false;
  selectedValue: string = '';
  apiUrl = environment.base_url
  businessNames: string;
  showfilter: boolean = false;
  selectedRating: number = 0;
  country: string;
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 1500,
    dots: false,
    arrows: true
  };
  locationInput = '';
  defaultLatitude = 37.7749;
  defaultLongitude = -122.4194;
  locationPermissionDenied = false;
  zoom = 0;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  selectedCoordinates = { lat: null, lng: null };
  calculatedDistances: number[] = [];
  Mycenter: { lat: number; lng: number; };
  totalReviews: number = 0;
  averageRating: number = 0;
  roundedRating: number = 0;
  stars: number[] = [];
  newReview = {
    rating: 0,
  };
  selectedStars: number = 0;
  isFiltered: boolean = false;
  count: any;
  formattedCount: any;
  countData: any;
  nearbyCities: string[] = [];
  isLoadingNearbyCities = false;
  popularCategories: string[] = [];
  popularCategoriesLoading = false;
  popularCategoriesError = '';
  errorMessage: string = '';
  searchQuery: string = ''; // Bind this to the input field
  searchResults: any[] = []; // Store search results
  isDropdownOpen: boolean = false;
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
  isCountryLoading: boolean = false;
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private meta: Meta,
    private titleService: Title,
    private location: Location,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private dataService: CountDataService,
    private searchService: SearchService
  ) {
    this.ReviewForm = this.fb.group({
      review: [''], // Add form controls as needed
    });
    this.initializeSearchSubscription();
  }

  fallbackImages = [
    'assets/img/preview1.jpg',
    'assets/img/preview3.jpg',
    'assets/img/preview4.jpg',
    'assets/img/preview5.jpg',
    'assets/img/preview6.jpg',
  ];

  getFallbackImage(index: number): string {
    return this.fallbackImages[index % this.fallbackImages.length];
  }

  //   ngOnInit(): void {
  //     console.log('nnnnngggoonnnit');
  //     this.loading = true;
  //     navigator.permissions
  //       .query({ name: 'geolocation' })
  //       .then((result) => {
  //         if (result.state === 'granted') {
  //           this.detectLocation();
  //         } else if (result.state === 'denied') {
  //           this.locationPermissionDenied = true; 
  //           this.setDefaultLocation();
  //         } else {
  //           this.setDefaultLocation();
  //         }
  //       })
  //       .catch(() => this.setDefaultLocation());
  //     // const formattedQuery = this.route.snapshot.paramMap.get('formattedQuery');
  //     this.country = this.country ?? history.state.displayData ?? decodeURIComponent(this.route.snapshot.paramMap.get('category'));
  //     console.log("country", this.country);
  //     this.route.paramMap.subscribe(params => {
  //       this.routeCountry = params.get('country')?.toUpperCase() || '';
  //       this.routeState = params.get('state')?.toUpperCase() || '';
  //       this.routeCity = params.get('city')
  //         ? params.get('city')!.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
  //         : '';
  //       this.routeZip = params.get('zip')?.toUpperCase() || '';
  //       // this.routeCategory = params.get('category')?.toLowerCase() || '';
  //  this.loadCountriesAndInitialize();
  //       if (this.routeCountry) {
  //         this.searchcountry = this.routeCountry;
  //         setTimeout(() => {
  //           this.onCountryChange(this.searchcountry).then(() => {
  //             if (this.routeState) {
  //               this.searchstate = this.routeState;
  //               setTimeout(() => {
  //                 this.onStateChange(this.searchstate).then(() => {
  //                   if (this.routeCity) {
  //                     this.searchcity = this.routeCity;
  //                     setTimeout(() => {
  //                       this.onCityChange(this.searchcity).then(() => {
  //                         if (this.routeZip) {
  //                           this.searchzip = this.routeZip;
  //                         }
  //                       });
  //                     });
  //                   }
  //                 });
  //               });
  //             }
  //           });
  //         });
  //       }
  //     });


  // if(this.country == undefined){
  //   this.route.paramMap.subscribe(params => {
  //     let formattedParam = params.get('category');
  //     if (formattedParam) {
  //       formattedParam = formattedParam.replace(/-/g, ' ');
  //       this.country = decodeURIComponent(formattedParam); // Decode URI components
  //     }
  //     // this.country = formattedParam ? formattedParam.replace(/-/g, ' ') : null;
  //     console.log('Business ID:', this.country);
  //   });
  // }
  //   this.searchQuery = this.country;
  //   this.getdata(this.country);
  //   this.count = this.dataService.getData();
  //   this.countData = this.count.source._value;
  // }

  // ngOnInit(): void {
  //   console.log('Component initialized');
  //   this.loading = true;

  //   // Handle geolocation permission
  //   navigator.permissions
  //     .query({ name: 'geolocation' })
  //     .then((result) => {
  //       if (result.state === 'granted') {
  //         this.detectLocation();
  //       } else if (result.state === 'denied') {
  //         this.locationPermissionDenied = true;
  //         this.setDefaultLocation();
  //       } else {
  //         this.setDefaultLocation();
  //       }
  //     })
  //     .catch(() => this.setDefaultLocation());

  //   // Get category from route
  //   this.route.paramMap.subscribe(params => {
  //     // Get category from URL (the last parameter)
  //     const routeCategory = params.get('category') || '';
  //     this.country = decodeURIComponent(routeCategory);
  //     console.log("Category from URL:", this.country);

  //     // Get location parameters from URL
  //     this.routeCountry = params.get('country')?.toUpperCase() || '';
  //     this.routeState = params.get('state')?.toUpperCase() || '';
  //     this.routeCity = params.get('city')
  //       ? params.get('city')!.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
  //       : '';
  //     this.routeZip = params.get('zip')?.toUpperCase() || '';
  //     this.routeCategory = params.get('category')?.toLowerCase() || '';
  //     console.log('URL Parameters:', {
  //       country: this.routeCountry,
  //       state: this.routeState,
  //       city: this.routeCity,
  //       zip: this.routeZip,
  //       category: this.country
  //     });

  //     // Set initial search values
  //     this.searchQuery = this.country;

  //     // Load initial data with category
  //     //this.getdata(this.country);

  //     // Initialize countries dropdown with category
  //     this.loadCountriesAndInitialize();

  //     this.count = this.dataService.getData();
  //     this.countData = this.count.source._value;
  //   });
  // }

  setRating(star: number): void {
    if (!this.isDistanceSelected) {
      this.newReview.rating = star;
    }
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

  slickInit(e: any): void {
    console.log('slick initialized');
  }

  breakpoint(e: any): void {
    console.log('breakpoint', e);
  }

  afterChange(e: any): void {
    console.log('afterChange', e);
  }
  selectedCity: string;
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
  beforeChange(e: any): void {
    console.log('beforeChange', e);
  }
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (!this.isSidebarOpen && !this.isApplyFiltersClicked) {
      this.isDistanceSelected = false;
      this.newReview.rating = 0;
    }
    this.isApplyFiltersClicked = false;
    // this.isDistanceSelected = false;
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
console.log("this.searchcity 1",this.searchcity);

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

  DistanceSelection() {
    this.isDistanceSelected = !this.isDistanceSelected;

    if (this.isDistanceSelected == true) {
      this.selectedCoordinates = {
        lat: this.Mycenter?.lat || this.defaultLatitude,
        lng: this.Mycenter?.lng || this.defaultLongitude
      };

      console.log('Selected Coordinates:', this.selectedCoordinates);
    }
    // else{
    //   this.isSidebarOpen = false;
    //   this.loading = true;
    //   this.getdata(this.country);
    // }

  }


  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRadians = (degree: number) => (degree * Math.PI) / 180;

    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }



  applyFilters(): void {
    console.log("newReview.rating", this.newReview.rating);

    if (this.isDistanceSelected) {
      this.isApplyFiltersClicked = true;
      this.isSidebarOpen = !this.isSidebarOpen;
      // Ensure selectedCoordinates are available
      if (!this.selectedCoordinates || !this.selectedCoordinates.lat || !this.selectedCoordinates.lng) {
        console.error('Selected coordinates are not available.');
        return;
      }

      const { lat: userLat, lng: userLng } = this.selectedCoordinates;

      if (!this.businessData || !Array.isArray(this.businessData)) {
        console.error('Business data is not valid or not an array.');
        return;
      }

      // Calculate distances for businesses with geocoded locations
      console.log("enter location", this.businessData);
      this.businessData = this.businessData
        .map((business) => {
          console.log("enter location");

          if (business && business.geocodedLocation) {
            console.log("enter location 1");
            const { lat, lng } = business.geocodedLocation;
            console.log("business.geocodedLocation", business.geocodedLocation);
            console.log("userLat", userLat);
            console.log("lat", lat);
            console.log("lng", lng);

            business.distance = this.calculateDistance(userLat, userLng, lat, lng); // Add calculated distance to the business
            return business;
          } else {
            console.warn('Skipping business due to missing geocoded location:', business);
            return null; // Skip businesses without geocoded locations
          }
        })
        .sort((a, b) => (a?.distance ?? Infinity) - (b?.distance ?? Infinity));

      console.log('Calculated Distances:', this.businessData);

      // Add further filtering or actions if needed
    } else {
      this.isDistanceSelected = false;
      console.log('Distance filter is not selected.');
    }

    if (this.newReview.rating > 0) {

      if (!this.businessData || this.businessData.length == 0) {

        this.getdata(this.country, 1);
        setTimeout(() => {
          this.businessData = this.businessData.filter(
            business => business.averageRating >= this.newReview.rating
          );
          this.isFiltered = true;
        }, 500);
      } else {

        this.businessData = this.businessData.filter(
          business => business.averageRating >= this.newReview.rating
        );
        this.isFiltered = true;
      }
    }
    this.isSidebarOpen = false;
  }



  resetFilters(): void {
    this.isDistanceSelected = false;
    this.newReview.rating = 0;
    this.isSidebarOpen = false;
    this.loading = true;
    this.getdata(this.country);
    this.cdr.detectChanges(); // Force update
  }


  detectLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Detected Latitude:', latitude, 'Detected Longitude:', longitude);
          this.Mycenter = {
            lat: latitude,
            lng: longitude,
          };
          const locationDetails = await this.getAddressFromLatLng(latitude, longitude);

          if (locationDetails) {
            this.locationInput = locationDetails.address; // Bind detected address to the input
          }
          this.locationPermissionDenied = false; // Reset the flag on successful detection
        },
        (error) => {
          console.error('Error detecting location:', error);

          // Check for permission denial
          if (error.code === error.PERMISSION_DENIED) {
            this.locationPermissionDenied = true; // User denied location access
            // alert('Please enable location services to use this feature.');
          }
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
    this.showDropdown = false;
  }

  async getAddressFromLatLng(latitude: number, longitude: number) {
    const apiKey = 'AIzaSyCvfG8gk8bhzwEPN4PxZMT1grLNgSpsWZQ'; // Replace with your API key
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        const address = data.results[0].formatted_address; // Full address
        console.log('Address:', address);
        return { address };
      } else {
        throw new Error(`Geocoding error: ${data.status}`);
      }
    } catch (error) {
      console.error('Error fetching geolocation:', error);
    }
    return { address: 'Unable to fetch location' };
  }

  setDefaultLocation() {
    this.getAddressFromLatLng(this.defaultLatitude, this.defaultLongitude).then(
      (locationDetails) => {
        this.locationInput = locationDetails?.address || 'Default Location (USA)';
      }
    );
  }



  hideDropdownAfterDelay() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }


  fetchCountry() {
    // Initialize an empty Set to store unique countries
    const countriesSet = new Set<string>();

    // Ensure businessData is available and it's an array
    console.log("this.businessData", this.businessData);

    if (this.businessData && Array.isArray(this.businessData)) {


      // Iterate over the business data to process each item
      this.businessData.forEach((item, index) => {
        console.log("Processing item at index:", index, item);

        if (item) {
          // Check for required properties in the item
          const { region, city, state, country, zip_code } = item;
          if (country) {
            countriesSet.add(country); // Add the country to the Set
          }

          // Construct the full address for geocoding
          const fullAddress = `${region || ''}, ${city || ''}, ${state || ''}, ${country || ''}, ${zip_code || ''}`.trim();
          console.log("Full Address:", fullAddress);

          if (fullAddress) {
            // Perform geocoding for the full address
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: fullAddress }, (results, status) => {
              if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                this.center = {
                  lat: location.lat(),
                  lng: location.lng(),
                };
                this.zoom = 16; // Zoom into the location
                console.log('Geocoded Location:', this.center);

                // Optionally, you can store the geocoded result in the item or another array
                item.geocodedLocation = {
                  lat: location.lat(),
                  lng: location.lng(),
                };
              } else {
                console.log(`Geocoding failed for address "${fullAddress}":`, status);
              }
            });
          } else {
            console.log("Incomplete address for item:", item);
          }
        } else {
          console.log("Invalid item at index:", index);
        }
      });

      // Check the final Set of countries
      console.log("countriesSet", countriesSet);

      this.filteredCountries = Array.from(countriesSet);
      console.log('this.filteredCountries', this.filteredCountries);
    } else {
      console.log("No valid business data found:", this.businessData);
    }
  }
  performSearches(page: number): void {
    const country = this.country; // Provide the required parameter
    this.getdata(country, page);
    console.log('Performing search for page:', page);
  }

  // getdata(country: any, page_no: number = 1): void {
  //   this.loading = true;
  //   this.http.get<any>(`${this.apiUrl}getlistingdata`, {
  //     params: { country: country, page: page_no.toString(), page_size: '10' }
  //   }).subscribe(
  //     response => {

  //       this.businessData = response.data;  // The first 10 items will be returned based on page and page_size
  //       console.log('API Response:', response.data);

  //       // Call methods to update pagination
  //       this.updatePaginationnew(response.pagination);
  //       this.loading = false;
  //       // Fetch reviews for each business
  //       this.businessData.forEach(business => {
  //         console.log('Business ID===============:', business);
  //         console.log('Business ID===============:', business.id);
  //         this.getReviewsnew(business.id);

  //         this.getbanner(business.id);
  //         if (business.country && !this.filteredCountries.includes(business.country)) {
  //           this.filteredCountries.push(business.country);
  //         }
  //       });
  //       this.fetchCountry();
  //       this.fetchescountry();


  //     },
  //     error => {
  //       console.error('API Error:', error);
  //     }
  //   );
  // }

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
          this.getReviewsnew(business.id);
          this.getbanner(business.id);
        });

        // Don't call fetchescountry here as it will interfere with the initialization
      },
      error => {
        console.error('API Error:', error);
        this.loading = false;
      }
    );
  }
  // fetchescountry() {
  //   const category = (document.getElementById('searchBox') as HTMLInputElement).value;
  //   const url = `${this.apiUrl}getListingCountry?category=${category}`;
  //   this.http.get<{ message: string; status: boolean; data: string[] }>(url).subscribe(
  //     (response) => {
  //       console.log('responsie', response);
  //       if (response.status) {
  //         this.filteredCountries = response.data;
  //         console.log("this.filteredCountries", this.filteredCountries);

  //       } else {
  //         console.warn('No states found:', response.message);
  //         this.filteredCountries = [];
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching states:', error);
  //       this.filteredCountries = [];
  //     }
  //   );
  // }
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

  getbanner(ids: number[]) {
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

  selectedCountry: string;
  // onCountryChange(event: Event | string): Promise<void> {
  //   return new Promise((resolve) => {
  //     if (typeof event === 'string') {
  //       this.selectedCountry = event;
  //     } else {
  //       this.selectedCountry = (event.target as HTMLSelectElement).value;
  //     }
  //     if (this.selectedCountry) {
  //       this.fetchStates(this.selectedCountry);
  //     } else {
  //       this.filteredStates = [];
  //       this.filteredCities = [];
  //       this.filteredZips = [];
  //     }
  //     resolve();
  //   });
  // }
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
      
console.log("this.searchcity 2",this.searchcity);
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
  // fetchStates(countryCode: string): void {
  //   const category = (document.getElementById('searchBox') as HTMLInputElement).value;
  //   const url = `${this.apiUrl}getListingStates?country=${countryCode}&category=${category}`;
  //   this.http.get<{ message: string; status: boolean; data: string[] }>(url).subscribe(
  //     (response) => {
  //       console.log('responsie', response);
  //       if (response.status) {
  //         this.filteredStates = response.data;
  //         console.log("this.filteredStates", this.filteredStates);

  //       } else {
  //         console.warn('No states found:', response.message);
  //         this.filteredStates = [];
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching states:', error);
  //       this.filteredStates = [];
  //     }
  //   );
  // }
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

  selectedState: string;
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

  // fetchCities(state: string): void {
  //   const category = (document.getElementById('searchBox') as HTMLInputElement).value;
  //   const url = `${this.apiUrl}getListingCities?country=${this.selectedCountry}&state=${state}&category=${category}`;
  //   this.http.get<{ message: string; status: boolean; data: string[] }>(url).subscribe(
  //     (response) => {
  //       if (response.status) {
  //         this.filteredCities = response.data;
  //       } else {
  //         console.warn('No cities found:', response.message);
  //         this.filteredCities = [];
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching cities:', error);
  //       this.filteredCities = [];
  //     }
  //   );
  // }
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


  updateUrl(): void {
    // Use the same values as in performSearch
    const country = this.selectedCountry || this.routeCountry || '';
    const state = this.selectedState || this.routeState || '';
    const city = this.selectedCity || this.routeCity || '';
    const zip = this.searchzip || this.routeZip || '';
    const category = this.country || this.searchQuery || '';

    // Format URL parameters to match route expectations
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

    this.location.go(url);
  }

  // updateMetaTags(): void {
  //   const country = (document.getElementById('country') as HTMLInputElement).value || 'all countries';
  //   const state = (document.getElementById('state') as HTMLInputElement).value || 'all states';
  //   const city = (document.getElementById('city') as HTMLInputElement).value || 'all cities';
  //   const businessName = (document.getElementById('businessName') as HTMLInputElement)?.value?.trim() || 'all businesses';

  //   const location = `${city || 'any city'}, ${state || 'any state'}, ${country || 'any country'}`;

  //   const title = `${this.businessNames} - Best Listings in ${location}`;
  //   this.titleService.setTitle(title);

  //   const description = `Explore the best businesses like ${this.businessNames} in ${location}. Discover detailed listings with essential business information including websites, addresses, and more!`;
  //   this.meta.updateTag({ name: 'description', content: description });
  // }







  // performSearch(page: number = 1): void {
  //   this.businessData = [];
  //   this.currentPage = page;
  //   this.loading = true;

  //   this.updateUrl();

  //   const country = (document.getElementById('country') as HTMLInputElement).value;
  //   const state = (document.getElementById('state') as HTMLInputElement).value;
  //   const city = (document.getElementById('city') as HTMLInputElement).value;
  //   const zip = (document.getElementById('zip') as HTMLInputElement).value;
  //   const category = (document.getElementById('searchBox') as HTMLInputElement).value;

  //   const params = new URLSearchParams({
  //     country,
  //     state,
  //     city,
  //     zip,
  //     category,
  //     page: this.currentPage.toString(),
  //     page_size: this.pageSize.toString(),
  //   });

  //   this.http.get(`${this.apiUrl}searchallListing?${params.toString()}`).subscribe(
  //     (response: any) => {
  //       this.showfilter = true;
  //       console.log("Data:", response.data);
  //       console.log("PaginationData:", response);

  //       const totalPages = Math.ceil(response.pagination.total_records / this.pageSize);
  //       const hasPreviousPage = this.currentPage > 1;
  //       const hasNextPage = this.currentPage < totalPages;

  //       if (response.data && response.data.length > 0) {
  //         const geocoder = new google.maps.Geocoder();

  //         response.data.forEach((item: any) => {
  //           console.log('item:', item);
  //           this.getReviewsnew(item.id);
  //           this.getbanner(item.id);
  //           if (item.country && !this.filteredCountries.includes(item.country)) {
  //             this.filteredCountries.push(item.country);
  //           }
  //           const ListingId = item.id;
  //           const company_name = item.company_name || item.business_name;
  //           const industry = item.industry || item.description;
  //           const sic_description = item.sic_description || item.category;
  //           const address = item.address || item.region;
  //           const city = item.city || '';
  //           const state = item.state || '';
  //           const country = item.country || '';
  //           const zip_code = item.zip || item.zip_code;
  //           const phone = item.phone || '';
  //           const fullAddress = `${address}, ${city}, ${state}, ${country}, ${zip_code}`;

  //           geocoder.geocode({ address: fullAddress }, (results, status) => {
  //             try {
  //               if (status === 'OK' && results[0]) {
  //                 const location = results[0].geometry.location;

  //                 this.businessData.push({
  //                   id: ListingId,
  //                   company_name: company_name,
  //                   industry: industry,
  //                   sic_description: sic_description,
  //                   region: address,
  //                   city: city,
  //                   state: state,
  //                   country: country,
  //                   phone: phone,
  //                   geocodedLocation: {
  //                     lat: location.lat(),
  //                     lng: location.lng(),
  //                   },
  //                   slides: [{ img: '', altText: '' }],
  //                 });

  //                 console.log("this.businessData:", this.businessData);
  //                 console.log('Geocoded Location:', {
  //                   lat: location.lat(),
  //                   lng: location.lng(),
  //                 });
  //               } else {
  //                 throw new Error(`Geocoding failed with status: ${status}`);
  //               }
  //             } catch (error) {
  //               console.error(error.message);

  //               // Proceed with adding business data without geocoding
  //               this.businessData.push({
  //                 id: ListingId,
  //                 company_name: company_name,
  //                 industry: industry,
  //                 sic_description: sic_description,
  //                 region: address,
  //                 city: city,
  //                 state: state,
  //                 country: country,
  //                 phone: phone,
  //                 geocodedLocation: null, // Indicate that geocoding failed
  //                 slides: [{ img: '', altText: '' }],
  //               });

  //               console.log("Geocoding failed. Proceeding without location data.");
  //             }
  //           });
  //         });

  //         const businessNamesString = response.data
  //           .map((item: any) => item.company_name || item.business_name || 'Unnamed Business')
  //           .join(', ');

  //         this.businessNames = businessNamesString;
  //         console.log("BusinessName:", this.businessNames);
  //       }

  //       const pagination = {
  //         totalPages,
  //         hasPreviousPage,
  //         hasNextPage,
  //       };

  //       this.updatePagination(pagination);
  //       this.loading = false;
  //       this.updateMetaTags();
  //       console.log("this.businessData start", this.businessData);
  //     },
  //     (error) => {
  //       console.error('Error fetching search results:', error);
  //     }
  //   );
  // }
  updateMetaTags(): void {
    // Get values from the route parameters
    const country = this.routeCountry || this.searchcountry || '';
    const state = this.routeState || this.searchstate || '';
    const city = this.routeCity || this.searchcity || '';
    const zip = this.routeZip || this.searchzip || '';
    const category = this.country || this.searchQuery || '';
console.log("this.searchcity 3",this.searchcity);
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

    this.titleService.setTitle(title);

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

    this.meta.updateTag({ name: 'description', content: description });

    // Optional: Add additional meta tags for better SEO
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'keywords', content: this.generateKeywords(formattedCategory, locationParts) });
  }

  // Helper method to generate keywords
  private generateKeywords(category: string, locationParts: string[]): string {
    const keywords: string[] = [];

    if (category && category !== 'Businesses') {
      keywords.push(category.toLowerCase());
      keywords.push(`${category.toLowerCase()} directory`);
      keywords.push(`find ${category.toLowerCase()}`);
    }

    if (locationParts.length > 0) {
      const location = locationParts.join(' ').toLowerCase();
      keywords.push(location);
      keywords.push(`business directory ${location}`);
      keywords.push(`${category.toLowerCase()} ${location}`);
    }

    keywords.push('business listing');
    keywords.push('local business directory');
    keywords.push('global business pages');
    keywords.push('affordable business listing');

    return keywords.slice(0, 10).join(', '); // Limit to 10 keywords
  }

  // // Helper method to generate keywords
  // private generateKeywords(category: string, locationParts: string[]): string {
  //   const keywords: string[] = [];

  //   if (category && category !== 'Businesses') {
  //     keywords.push(category.toLowerCase());
  //     keywords.push(`${category.toLowerCase()} directory`);
  //   }

  //   if (locationParts.length > 0) {
  //     keywords.push(locationParts.join(' ').toLowerCase());
  //     keywords.push(`business directory ${locationParts.join(' ').toLowerCase()}`);
  //   }

  //   keywords.push('business listing');
  //   keywords.push('local business directory');
  //   keywords.push('global business pages');

  //   return keywords.join(', ');
  // }
  ngOnInit(): void {
    console.log('Component initialized');
    this.loading = true;

    // Handle geolocation permission
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        if (result.state === 'granted') {
          this.detectLocation();
        } else if (result.state === 'denied') {
          this.locationPermissionDenied = true;
          this.setDefaultLocation();
        } else {
          this.setDefaultLocation();
        }
      })
      .catch(() => this.setDefaultLocation());

    // Get category from route
    this.route.paramMap.subscribe(params => {
      // Get category from URL (the last parameter)
      const routeCategory = params.get('category')
  ? params.get('category')!
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
  : '';
      this.country = decodeURIComponent(routeCategory);
      console.log("Category from URL:", this.country);

      // Get location parameters from URL
      this.routeCountry = params.get('country')?.toUpperCase() || '';
      this.routeState = params.get('state')?.toUpperCase() || '';
      this.routeCity = params.get('city')
        ? params.get('city')!.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
        : '';
      this.routeZip = params.get('zip')?.toUpperCase() || '';
   //   this.routeCategory = params.get('category')?.toLowerCase() || '';
this.routeCategory = params.get('category')
  ? params.get('category')!
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
  : '';
      console.log('URL Parameters:', {
        country: this.routeCountry,
        state: this.routeState,
        city: this.routeCity,
        zip: this.routeZip,
        category: this.country
      });

      // Immediately set dropdown values from URL for fast display (no API wait)
      this.searchcountry = this.routeCountry || '';
      this.searchstate = this.routeState || '';
      this.searchcity = this.routeCity || '';
      this.selectedCountry = this.routeCountry || '';
      this.selectedState = this.routeState || '';
      this.selectedCity = this.routeCity || '';
console.log("this.searchcity 4",this.searchcity);
      // Pre-populate filtered lists with current URL values for instant dropdown display
      if (this.routeCountry && !this.filteredCountries.includes(this.routeCountry)) {
        this.filteredCountries = [this.routeCountry, ...this.filteredCountries];
      }
      if (this.routeState && !this.filteredStates.includes(this.routeState)) {
        this.filteredStates = [this.routeState, ...this.filteredStates];
      }
      if (this.routeCity && !this.filteredCities.includes(this.routeCity)) {
        this.filteredCities = [this.routeCity, ...this.filteredCities];
      }

      // Trigger change detection to update dropdowns immediately
      this.cdr.detectChanges();

      // Set initial search values
      this.searchQuery = this.country;

      // Update meta tags immediately with URL parameters
      this.updateMetaTags();

      // Load initial data with category (API calls happen in background)
      this.loadCountriesAndInitialize();

      this.count = this.dataService.getData();
      this.countData = this.count.source._value;
    });


    // Get query params for pre-populated location data (fast, no API call needed)
    // this.route.queryParamMap.subscribe(queryParams => {
    //   const queryCity = queryParams.get('city');
    //   const queryState = queryParams.get('state');
    //   const queryCountry = queryParams.get('country');

    //   // Use query params if available (faster), otherwise fall back to route params
    //   if (queryCity) {
    //     this.routeCity = queryCity;
    //   }
    //   if (queryState) {
    //     this.routeState = queryState;
    //   }
    //   if (queryCountry) {
    //     this.routeCountry = queryCountry;
    //   }

    //   // Pre-populate filter values from URL for instant display
    //   this.searchcountry = this.routeCountry || '';
    //   this.searchstate = this.routeState || '';
    //   this.searchcity = this.routeCity || '';
    //   this.selectedCountry = this.routeCountry || '';
    //   this.selectedState = this.routeState || '';
    //   this.selectedCity = this.routeCity || '';

    //   console.log('Query Parameters (fast load):', {
    //     city: queryCity,
    //     state: queryState,
    //     country: queryCountry
    //   });
    // });

  }
  formatTitle(value: string | null | undefined): string {
  if (!value) return 'N/A';

  const text = value.replace(/-/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
  updateCanonicalUrl() {
    const cleanUrl = window.location.origin + this.router.url.split('?')[0];

    const link: HTMLLinkElement | null = document.querySelector("link[rel='canonical']");
    console.log("link", link);

    if (link) {
      link.setAttribute('href', cleanUrl);
    }
  }
  performSearch(page: number = 1): void {
    this.businessData = [];
    this.currentPage = page;
    this.loading = true;

    this.updateUrl();

    // Get values from dropdown selections or route params
    const country = this.selectedCountry || this.routeCountry || '';
    const state = this.selectedState || this.routeState || '';
    const city = this.selectedCity || this.routeCity || '';
    const zip = this.searchzip || this.routeZip || '';
    const category = this.country || this.searchQuery || '';

    // Update breadcrumb variables to reflect current search
    this.routeCountry = country;
    this.routeState = state;
    this.routeCity = city;
    this.routeZip = zip;
    this.routeCategory = category;

    // Update dropdown values to reflect current search
    this.searchcountry = country;
    this.searchstate = state;
    this.searchcity = city;
    this.searchzip = zip;
console.log("this.searchcity 5",this.searchcity);
    // Update selected values for cascading dropdowns
    this.selectedCountry = country;
    this.selectedState = state;
    this.selectedCity = city;

    // Trigger change detection to update the dropdowns
    this.cdr.detectChanges();

    console.log('Search parameters:', { country, state, city, zip, category });

    const params = new URLSearchParams({
      country,
      state,
      city,
      zip,
      category,
      page: this.currentPage.toString(),
      page_size: this.pageSize.toString(),
    });

    this.http.get(`${this.apiUrl}searchallListing?${params.toString()}`).subscribe(
      (response: any) => {
        this.showfilter = true;
        console.log("Search response:", response);

        if (response.status && response.data && response.data.length > 0) {
          // Process the data...
          const totalPages = Math.ceil(response.pagination.total_records / this.pageSize);
          const hasPreviousPage = this.currentPage > 1;
          const hasNextPage = this.currentPage < totalPages;

          const geocoder = new google.maps.Geocoder();

          response.data.forEach((item: any) => {
            console.log('item:', item);
            this.getReviewsnew(item.id);
            this.getbanner(item.id);

            // Add to filteredCountries if not already there
            if (item.country && !this.filteredCountries.includes(item.country)) {
              this.filteredCountries.push(item.country);
            }
this.updateCanonicalUrl();
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
          this.updateMetaTags();

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
       // this.getPopularCategories();
      },
      (error) => {
        console.error('Error fetching search results:', error);
        this.businessData = [];
        this.loading = false;
      }
    );
  }

  redirectregister() {
    this.router.navigate(['/register']);
  }
  redirectToListing(listingId: string, businessName: string, industry: string, business_country: string, business_state: string, business_city: string, business_zip_code: string, sic_description: string, slugUrl?: string, business?: any): void {
    console.log("Listing ID:", listingId);

    if (slugUrl) {
      this.router.navigateByUrl(slugUrl, { state: { id: listingId, data: business } });
      return;
    }

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



  openDropdown(): void {
    if (this.searchQuery.trim() && this.searchResults.length > 0) {
      this.isDropdownOpen = true;
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const searchBox = document.getElementById('searchBox');

    if (searchBox && !searchBox.contains(target)) {
      this.closeDropdown();
    }
  }

  onResultClick(result: any): void {
    console.log('Result Clicked:', result);
    const formattedQuery = result?.replace(/\s+/g, '-').toLowerCase();
    this.isDropdownOpen = false;
    // this.router.navigate([`/${formattedQuery}`]);
    
    this.router.navigate([`/${formattedQuery}`], {
      state: { displayData: result }
    });
    this.country = result;
   // this.ngOnInit();

  }

  initializeSearchSubscription(): void {
    console.log("search_subject", this.searchSubject);
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        switchMap((query) => this.searchService.search(query))
      )
      .subscribe({
        next: (data) => {
          console.log('dataaaa', data);
          this.searchResults = data?.displayed_data ?? []; // Ensure it's always an array
          console.log('this.searchResults length', this.searchResults.length);
          this.isDropdownOpen = this.searchResults.length >= 0;
        },
        error: (error) => {
          console.error('Error fetching search results:', error);
        }
      });
  }

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

}
