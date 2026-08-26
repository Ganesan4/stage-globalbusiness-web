import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Meta, Title } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { SlickCarouselModule } from 'ngx-slick-carousel';
@Component({
  selector: 'app-all-listings',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,SlickCarouselModule],
  templateUrl: './all-listings.component.html',
  styleUrl: './all-listings.component.scss'
})
export class AllListingsComponent {
  response:any;
  isModalOpenreview: boolean = false;
  currentPage: number = 1; 
  ReviewForm: FormGroup;
  pageSize: number = 10; 
  filteredStates: string[] = [];
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
  filteredCountries: string[] = [];
  businessData: any[] = [];
  bannerData: any[] = [];
  loading: boolean = false;
  selectedValue: string = '';
  apiUrl = environment.base_url
  businessNames: string;
  showfilter:boolean = false;
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
  isFiltered: boolean=false;
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private meta: Meta,
    private titleService: Title,
    private location: Location,
    private fb: FormBuilder
  ) {
    this.ReviewForm = this.fb.group({
      review: [''], // Add form controls as needed
    });

  }

  ngOnInit(): void {
    this.loading = true;
    navigator.permissions
    .query({ name: 'geolocation' })
    .then((result) => {
      if (result.state === 'granted') {
        this.detectLocation();
      } else if (result.state === 'denied') {
        this.locationPermissionDenied = true; // User denied location access
        this.setDefaultLocation();
      } else {
        this.setDefaultLocation();
      }
    })
    .catch(() => this.setDefaultLocation());
    // this.route.queryParams.subscribe(params => {
    //   this.selectedValue = params['selectedValue'] || 'No value selected';
    //   console.log('Selected Value:', this.selectedValue); // Logs "USA" for the given example
    // });
    const formattedQuery = this.route.snapshot.paramMap.get('formattedQuery');
    this.country = history.state.displayData;
    console.log("country",this.country);
    // this.filteredCountries = country;
    
    // this.fetchStates(this.filteredCountries); 
    // this.fetchCities('AK');
    // this.fetchZips('99501');
    this.getdata(this.country);
    
  }


  setRating(star: number): void {
    this.newReview.rating = star; 
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

  beforeChange(e: any): void {
    console.log('beforeChange', e);
  }
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    // this.isDistanceSelected = false;
  }
  // fetchCountry(): void{
  //   const url = `${this.apiUrl}getCountries`;
  //   this.http.get<{ message: string; status: boolean; data: string[] }>(url).subscribe(
  //     (response) => {
  //       if (response.status) {
  //         this.filteredCountries = response.data;
  //       } else {
  //         console.warn('No countries found:', response.message);
  //         this.filteredCountries = [];
  //       }
  //     }
  //   )
  // }

  DistanceSelection() {
    this.isDistanceSelected = !this.isDistanceSelected;
  
    if (this.isDistanceSelected == true) {
      this.selectedCoordinates = {
        lat: this.Mycenter?.lat || this.defaultLatitude,
        lng: this.Mycenter?.lng || this.defaultLongitude
      };

      console.log('Selected Coordinates:', this.selectedCoordinates);
    }
    else{
      this.isSidebarOpen = false;
      this.loading = true;
      this.getdata(this.country);
    }
  
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
    console.log("newReview.rating",this.newReview.rating);
    this.businessData = this.businessData.filter(business => business.averageRating >= this.newReview.rating);
    this.isFiltered = true;
    if (this.isDistanceSelected) {
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
      this.businessData = this.businessData
        .map((business) => {
          if (business && business.geocodedLocation) {
            const { lat, lng } = business.geocodedLocation;
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
  }
  
  

  resetFilters() {
    this.isDistanceSelected = false;
    this.isSidebarOpen = false;
    this.loading = true;
    this.getdata(this.country);
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


  fetchCountry(): void {
    // Initialize an empty Set to store unique countries
    const countriesSet = new Set<string>();
  
    // Ensure businessData is available and it's an array
    console.log("this.businessData", this.businessData);
  
    if (this.businessData && Array.isArray(this.businessData)) {
      console.log("Entering fetchCountry...");
  
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
  
      // Convert Set to an array and assign it to filteredCountries
      this.filteredCountries = Array.from(countriesSet);
      console.log('this.filteredCountries', this.filteredCountries);
    } else {
      console.log("No valid business data found:", this.businessData);
    }
  }
  
  
  getdata(country: any) {
    this.http.get<any>(`${this.apiUrl}getlistingdata`, {
        params: { country: country }
    }).subscribe(
        response => {
            this.businessData = response.data;
            console.log('API Response:', response);
            const ids = this.businessData.map(item => item.id);
            this.getbanner(ids);
            this.businessData.forEach(business => {
              this.getReviewsnew(business.id); // Fetch reviews for each business on page load
            });
           
            this.loading = false;
            this.fetchCountry();
        },
        error => {
            console.error('API Error:', error);
        }
    );
}

getbanner(ids: number[]) {
  this.http
      .post<any[]>(`${this.apiUrl}getBanners`, { ids: ids })
      .pipe(
          catchError(error => {
              console.error('Error fetching banners:', error);

              // Set the fallback "no_preview" image for all businesses
              this.businessData.forEach(business => {
                  if (!business.slides) {
                      business.slides = []; // Initialize slides array if not present
                  }

                  // Add the fallback slide
                  const fallbackSlide = {
                      img: 'assets/img/no_preview.png', // Fallback image
                      altText: 'No Preview Available' // Default alt text
                  };

                  // Check if the fallback slide already exists
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

                  // Create a new slide object
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

  onCountryChange(event: any): void {
    const selectedCountry = event.target.value;
    console.log("selectedCountry",selectedCountry);
    
    if (selectedCountry) {
      this.fetchStates(selectedCountry);
    } else {
      this.filteredStates = [];
      this.filteredCities = [];
      this.filteredZips = [];
    }
  }

  fetchStates(countryCode: string): void {
    const url = `${this.apiUrl}getListingStates?country=${countryCode}`;
    this.http.get<{ message: string; status: boolean; data: string[] }>(url).subscribe(
      (response) => {
        console.log('responsie',response);
        if (response.status) {
          this.filteredStates = response.data;
          console.log("this.filteredStates",this.filteredStates);
          
        } else {
          console.warn('No states found:', response.message);
          this.filteredStates = [];
        }
      },
      (error) => {
        console.error('Error fetching states:', error);
        this.filteredStates = [];
      }
    );
  }

  onStateChange(event: any): void {
    const selectedState = event.target.value;
    if (selectedState) {
      this.fetchCities(selectedState);
    } else {
      this.filteredCities = [];
      this.filteredZips = [];
    }
  }

  fetchCities(state: string): void {
    const url = `${this.apiUrl}getListingCities?state=${state}`;
    this.http.get<{ message: string; status: boolean; data: string[] }>(url).subscribe(
      (response) => {
        if (response.status) {
          this.filteredCities = response.data;
        } else {
          console.warn('No cities found:', response.message);
          this.filteredCities = [];
        }
      },
      (error) => {
        console.error('Error fetching cities:', error);
        this.filteredCities = [];
      }
    );
  }

  onCityChange(event: any): void {
    const selectedCity = event.target.value;
    if (selectedCity) {
      this.fetchZips(selectedCity);
    } else {
      this.filteredZips = [];
    }
  }

  fetchZips(city: string): void {
    const state = (document.getElementById('state') as HTMLInputElement).value;
    const url = `${this.apiUrl}getListingZipcodes?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;

    this.http.get<{ message: string; status: boolean; data: string[] }>(url).subscribe(
      (response) => {
        if (response.status) {
          this.filteredZips = response.data;
        } else {
          console.warn('No zips found:', response.message);
          this.filteredZips = [];
        }
      },
      (error) => {
        console.error('Error fetching zips:', error);
        this.filteredZips = [];
      }
    );
}

  updateUrl(): void {
    const country = (document.getElementById('country') as HTMLInputElement).value?.trim();
    const state = (document.getElementById('state') as HTMLInputElement).value?.trim();
    const city = (document.getElementById('city') as HTMLInputElement).value?.trim();
    const zip = (document.getElementById('zip') as HTMLInputElement).value?.trim();
  
    const formattedCountry = country?.replace(/\s+/g, '-').toLowerCase() || '';
    const formattedState = state?.replace(/\s+/g, '-').toLowerCase() || '';
    const formattedCity = city?.replace(/\s+/g, '-').toLowerCase() || '';
    const formattedZip = zip?.replace(/\s+/g, '-').toLowerCase() || '';
  
    let url = '/business-directory'; 
    if (formattedCountry) url += `/${formattedCountry}`;
    if (formattedState) url += `/${formattedState}`;
    if (formattedCity) url += `/${formattedCity}`;
    if (formattedZip) url += `/${formattedZip}`;
    // url += `?page=${this.currentPage}&pageSize=${this.pageSize}`;

    this.location.go(url); 
  }

  updateMetaTags(): void {
    const country = (document.getElementById('country') as HTMLInputElement).value || 'all countries';
    const state = (document.getElementById('state') as HTMLInputElement).value || 'all states';
    const city = (document.getElementById('city') as HTMLInputElement).value || 'all cities';
    const businessName = (document.getElementById('businessName') as HTMLInputElement)?.value?.trim() || 'all businesses';
  
    const location = `${city || 'any city'}, ${state || 'any state'}, ${country || 'any country'}`;

    const title = `${this.businessNames} - Best Listings in ${location}`;
    this.titleService.setTitle(title);

    const description = `Explore the best businesses like ${this.businessNames} in ${location}. Discover detailed listings with essential business information including websites, addresses, and more!`;
    this.meta.updateTag({ name: 'description', content: description });
  }  







  performSearch(page: number = 1): void {
    this.currentPage = page;
    this.loading = true;
  
    this.updateUrl();
  
    const country = (document.getElementById('country') as HTMLInputElement).value;
    const state = (document.getElementById('state') as HTMLInputElement).value;
    const city = (document.getElementById('city') as HTMLInputElement).value;
    const zip = (document.getElementById('zip') as HTMLInputElement).value;
  
    const params = new URLSearchParams({
      country,
      state,
      city,
      zip,
      page: this.currentPage.toString(),
      page_size: this.pageSize.toString(),
    });
  
    this.http.get(`${this.apiUrl}searchallListing?${params.toString()}`).subscribe(
      (response: any) => {
        this.showfilter = true;
        console.log("Data:", response.data);
        console.log("PaginationData:", response);
  
        const totalPages = Math.ceil(response.pagination.total_records / this.pageSize);
        const hasPreviousPage = this.currentPage > 1;
        const hasNextPage = this.currentPage < totalPages;
  
        if (response.data && response.data.length > 0) {
          const geocoder = new google.maps.Geocoder();
  
          response.data.forEach((item: any) => {
            const ListingId = item.id;
            const company_name = item.company_name;
            const industry = item.industry;
            const sic_description = item.sic_description;
            const address = item.address || '';
            const city = item.city || '';
            const state = item.state || '';
            const country = item.country || '';
            const zip_code = item.zip || '';
            const phone = item.phone || '';
            const fullAddress = `${address}, ${city}, ${state}, ${country}, ${zip_code}`;
  
            geocoder.geocode({ address: fullAddress }, (results, status) => {
              if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                this.businessData = [
                  ...this.businessData,
                  {
                    id: ListingId,
                    company_name: company_name,
                    industry: industry,
                    sic_description: sic_description,
                    region: address,
                    city: city,
                    state: state,
                    country: country,
                    phone: phone,
                    geocodedLocation : {
                      lat: location.lat(),
                      lng: location.lng(),
                    }
                  },
                ];
                console.log("this.businessDattttta:", this.businessData);
                console.log('Geocoded Location:', {
                  lat: location.lat(),
                  lng: location.lng(),
                });
              } else {
                console.log('Geocoding failed: ', status);
              }
            });
          });
  
          const businessNamesString = response.data
            .map((item: any) => item.company_name || 'Unnamed Business')
            .join(', ');
  
          this.businessNames = businessNamesString;
          console.log("BusinessName:", this.businessNames);
        }
  
        const pagination = {
          totalPages,
          hasPreviousPage,
          hasNextPage,
        };
  
        this.updatePagination(pagination);
        this.loading = false;
        this.updateMetaTags();
      },
      (error) => {
        console.error('Error fetching search results:', error);
      }
    );
  }
  
  // performSearch(page: number = 1): void {
  //   this.currentPage = page; 
  //   this.loading = true;

  //   this.updateUrl();

  //   const country = (document.getElementById('country') as HTMLInputElement).value;
  //   const state = (document.getElementById('state') as HTMLInputElement).value;
  //   const city = (document.getElementById('city') as HTMLInputElement).value;
  //   const zip = (document.getElementById('zip') as HTMLInputElement).value;
    
  //   const params = new URLSearchParams({
  //     country,
  //     state,
  //     city,
  //     zip,
  //     page: this.currentPage.toString(),
  //     page_size: this.pageSize.toString(),
  //   });
  
  //   this.http.get(`${this.apiUrl}searchallListing?${params.toString()}`).subscribe(
  //     (response: any) => {
  //       this.showfilter=true;
  //       console.log("Data:", response.data);
  //       console.log("PaginationData:", response); 

  //       const totalPages = Math.ceil(response.pagination.total_records / this.pageSize);
  //       const hasPreviousPage = this.currentPage > 1;
  //       const hasNextPage = this.currentPage < totalPages;

  //       if (response.data && response.data.length > 0) {
  //         let businessNamesString = '';

  //         for (let i = 0; i < response.data.length; i++) {

  //           const businessName = response.data[i].company_name || 'Unnamed Business';

  //           businessNamesString += businessName + ', ';
  //         }

  //         this.businessNames = businessNamesString.slice(0, -2);

  //         console.log("BusinessName:", this.businessNames);
  //       }

        

  //       const pagination = {
  //         totalPages,
  //         hasPreviousPage,
  //         hasNextPage,
  //       };
  
  //       this.businessData = response.data;
  //       // this.populateResults(response.data);
  //       this.updatePagination(pagination);
  //       this.loading = false;
  //       this.updateMetaTags();
  //     },
  //     (error) => {
  //       console.error('Error fetching search results:', error);
  //     }
  //   );
  // }  

  // populateResults(data: any[]): void {
  //   const productPlaceholder = document.getElementById('productPlaceholder');
  //   if (!productPlaceholder) return;
  
  //   productPlaceholder.innerHTML = ''; // Clear previous results
  
  //   data.forEach((item) => {
  //     const ListingId = item.id;
  //     const businessName = item.company_name;
  //     const industry = item.industry;

  //     const resultItem = document.createElement('div');
  //     resultItem.className =
  //       'bg-white border border-gray-200 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer';

  //       resultItem.addEventListener('click', () => {
  //         this.redirectToListing(ListingId, businessName, industry);
  //       });
  
  //     resultItem.innerHTML = `
  //       <h3 class="text-lg font-semibold text-gray-800 mb-2">${item.company_name}</h3>
  //       <p class="text-sm text-gray-600 mb-1"><span class="font-medium">Address:</span> ${item.address}, ${item.city}, ${item.state} ${item.zip}</p>
  //       <p class="text-sm text-gray-600 mb-1"><span class="font-medium">Phone:</span> ${item.phone}</p>
  //       <p class="text-sm text-gray-600 mb-1"><span class="font-medium">Employees:</span> ${item.total_employee}</p>
  //       <p class="text-sm text-gray-600"><span class="font-medium">Revenue:</span> ${item.sales_volume}</p>
  //     `;
  //     productPlaceholder.appendChild(resultItem);
  //   });
  // }


  populateResults(data: any[]): void {
    const productPlaceholder = document.getElementById('productPlaceholder');
    if (!productPlaceholder) return;

    // Clear previous results
    productPlaceholder.innerHTML = ''; 

    // Optionally hide the old business card list if it's not needed
    const oldBusinessCardContainer = document.getElementById('oldBusinessCards');
    if (oldBusinessCardContainer) {
        oldBusinessCardContainer.style.display = 'none'; // Or you can remove it from the DOM
    }
    

    // Add new results
    data.forEach((item) => {
        const ListingId = item.id;
        const businessName = item.company_name;
        const industry = item.industry;
        const businessDescription = item.sic_description || item.category;
        const region = item.region || '';
        const city = item.city || '';
        const state = item.state || '';
        const country = item.country || '';
        const zip_code = item.zip_code || '';
        const slides = item.slides || []; // Assuming slides is an array

        const fullAddress = `${item.region}, ${item.city}, ${item.state}, ${item.country}, ${item.zip_code}`;
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
          } else {
            console.log('Geocoding failed: ', status);
          }
        });

        const resultItem = document.createElement('div');
        resultItem.className = 'bg-white border border-gray-200 rounded-lg shadow p-4 flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer';

        // Bind the new HTML structure dynamically
        resultItem.innerHTML = `
            <div class="w-full md:w-1/4">
                <ngx-slick-carousel class="carousel relative"
                                    #slickModal="slick-carousel"
                                    [config]="slideConfig"
                                    (init)="slickInit($event)"
                                    (breakpoint)="breakpoint($event)"
                                    (afterChange)="afterChange($event)"
                                    (beforeChange)="beforeChange($event)">
                    ${slides.map(slide => `
                        <div ngxSlickItem class="slide relative">
                            <img [src]="slide.img ? slide.img.replace('data:image/png;base64,data:image/png;base64,', 'data:image/png;base64,') : 'assets/img/no_preview.png'" 
                                [alt]="slide.altText || 'Slide Image'" style="height: 200px;" />
                        </div>
                    `).join('')}
                </ngx-slick-carousel>
            </div>

            <div class="flex-1 md:ml-[30px]">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold">${businessName || 'N/A'}</h3>
                </div>
                <p class="text-sm text-gray-500">${businessDescription || 'No description available'}</p>
                <div class="mt-2 flex space-x-2">
                    <span class="text-xs bg-gray-200 rounded-full px-3 py-1">${industry || 'No industry'}</span>
                </div>

                <div class="mt-4 flex items-center space-x-2">
                    <i class="fas fa-map-marker-alt text-gray-500"></i>
                    <span class="text-sm">${region}, ${city}, ${state}, ${country}</span>
                </div>

                <div class="mt-4 flex space-x-4">
                    <a href="tel:${item.phone}">
                        <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2">
                            <i class="fas fa-phone-alt"></i>
                            <span>Contact</span>
                        </button>
                    </a>
                </div>
            </div>
        `;
        //this.getReviewsnew(ListingId, business);
        resultItem.addEventListener('click', () => {
            this.redirectToListing(ListingId, businessName, industry,country,state,city,zip_code);
        });

        productPlaceholder.appendChild(resultItem);
    });
}

  

  // redirectToListing(ListingId: string): void {
  //   // this.router.navigate([`/all_listings`, ListingId]);
  //   const url = this.router.serializeUrl(this.router.createUrlTree([`/all_listings/${ListingId}`]));
  //   window.open(url, '_blank');
  // }

  // redirectToListing(listingId: string, businessName: string, industry: string,business_country:string, business_state:string, business_city:string,business_zip_code:string): void {
  //   console.log("listingId",listingId);
  //   console.log("businessName",businessName);
  //   console.log("industry",industry);
  //   const country = (document.getElementById('country') as HTMLInputElement)?.value?.trim() || business_country;
  //   const state = (document.getElementById('state') as HTMLInputElement)?.value?.trim() || business_state;
  //   const city = (document.getElementById('city') as HTMLInputElement)?.value?.trim() || business_city;
  //   const zip = (document.getElementById('zip') as HTMLInputElement)?.value?.trim() || business_zip_code;
  
    
  //   const formattedIndustry = industry?.replace(/\s+/g, '-').toLowerCase();
  //   const formattedCountry = country?.replace(/\s+/g, '-').toLowerCase() || '';
  //   const formattedState = state?.replace(/\s+/g, '-').toLowerCase() || '';
  //   const formattedCity = city?.replace(/\s+/g, '-').toLowerCase() || '';
  //   const formattedZip = zip?.replace(/\s+/g, '-').toLowerCase() || '';

  //   let url = `/business-directory`;
  //   if (country) url += `/${formattedCountry}`;
  //   if (state) url += `/${formattedState}`;
  //   if (city) url += `/${formattedCity}`;
  //   if (zip) url += `/${formattedZip}`;
  //   if (industry) url += `/${formattedIndustry}`;
  //   // if (category) url += `/${formattedCategory}`;
  //   // if (businessName) url += `/${formattedBusinessName}`;

  //   this.router.navigate([url], { state: { id: listingId } });
  //   // const link = document.createElement('a');
  //   // link.href = this.router.serializeUrl(this.router.createUrlTree([url]));
  //   // link.target = '_blank';
  //   // document.body.appendChild(link); // Required to make the click work in some browsers
  //   // link.click();
  //   // document.body.removeChild(link);
  // }

  redirectToListing(listingId: string, businessName: string, industry: string, business_country: string, business_state: string, business_city: string, business_zip_code: string): void {
    console.log("Listing ID:", listingId);

    const url = `${this.apiUrl}getregistration/${listingId}`; // Correct API endpoint

    this.http.get(url).subscribe((response: any) => {
        if (response.status === "exist") {
            console.log("Response.SOURCE", response);

            const country = (document.getElementById('country') as HTMLInputElement)?.value?.trim() || business_country;
            const state = (document.getElementById('state') as HTMLInputElement)?.value?.trim() || business_state;
            const city = (document.getElementById('city') as HTMLInputElement)?.value?.trim() || business_city;
            const zip = (document.getElementById('zip') as HTMLInputElement)?.value?.trim() || business_zip_code;

            const formattedIndustry = industry?.replace(/\s+/g, '-').toLowerCase();
            const formattedCountry = country?.replace(/\s+/g, '-').toLowerCase() || '';
            const formattedState = state?.replace(/\s+/g, '-').toLowerCase() || '';
            const formattedCity = city?.replace(/\s+/g, '-').toLowerCase() || '';
            const formattedZip = zip?.replace(/\s+/g, '-').toLowerCase() || '';

            let navigateUrl = `/business-directory-registered`;
            if (country) navigateUrl += `/${formattedCountry}`;
            if (state) navigateUrl += `/${formattedState}`;
            if (city) navigateUrl += `/${formattedCity}`;
            if (zip) navigateUrl += `/${formattedZip}`;
            if (industry) navigateUrl += `/${formattedIndustry}`;
            this.router.navigate([navigateUrl], { state: { id: listingId, source: response.source, data: response.data } });
        } else {
            console.log("else enter");
            const country = (document.getElementById('country') as HTMLInputElement)?.value?.trim() || business_country;
            const state = (document.getElementById('state') as HTMLInputElement)?.value?.trim() || business_state;
            const city = (document.getElementById('city') as HTMLInputElement)?.value?.trim() || business_city;
            const zip = (document.getElementById('zip') as HTMLInputElement)?.value?.trim() || business_zip_code;

            const formattedIndustry = industry?.replace(/\s+/g, '-').toLowerCase();
            const formattedCountry = country?.replace(/\s+/g, '-').toLowerCase() || '';
            const formattedState = state?.replace(/\s+/g, '-').toLowerCase() || '';
            const formattedCity = city?.replace(/\s+/g, '-').toLowerCase() || '';
            const formattedZip = zip?.replace(/\s+/g, '-').toLowerCase() || '';

            let navigateUrl = `/business-directory`;
            if (country) navigateUrl += `/${formattedCountry}`;
            if (state) navigateUrl += `/${formattedState}`;
            if (city) navigateUrl += `/${formattedCity}`;
            if (zip) navigateUrl += `/${formattedZip}`;
            if (industry) navigateUrl += `/${formattedIndustry}`;
            this.router.navigate([navigateUrl], { state: { id: listingId, source: response.source, data: response.data } });

            console.error("Listing ID not found in either table.");
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
    button.className = `px-4 py-2 text-sm rounded ${
      enabled ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    } ${isActive ? 'bg-blue-600 text-white' : ''}`;
    
    if (enabled) {
      button.addEventListener('click', () => clickHandler());
    }
  
    return button;
  }

}
