import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, ActivatedRoute } from '@angular/router';
import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { WebService } from '../services/web.service';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { Meta, Title } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../services/search.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime,switchMap, distinctUntilChanged } from 'rxjs/operators';

Injectable({
  providedIn: 'root'
})
//import { WebService } from '../services/web.service';

@Component({
  selector: 'app-global-business',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, SlickCarouselModule,FormsModule],
  templateUrl: './home.component.html', 
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent{
  searchQuery: string = ''; // Bind this to the input field
  searchResults: any[] = []; // Store search results
  isDropdownOpen: boolean = false;
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;
  apiUrl = environment.base_url;
  response:any;
  currentPage: number = 1; 
  pageSize: number = 10;   
  filteredStates: string[] = [];
  filteredCities: string[] = [];
  filteredZips: string[] = [];
  filteredCountries: string[] = [];
  loading: boolean = false;
  image: any;
  datas: any;
  rate: any;
  businessNames: string;
  constructor(
   private searchService: SearchService,
   private http: HttpClient, 
   private router: Router,
   private web: WebService,
   private route: ActivatedRoute,
   private meta: Meta,
   private titleService: Title,
   private location: Location,
  ) {
    this.initializeSearchSubscription();
  }

  ngOnInit(): void {
    // this.fetchCountry();
  }

  ngOnChanges(): void {

  }  

  fetchCountry(): void{
    const url = `${this.apiUrl}getCountries`;
    this.http.get<{ message: string; status: boolean; data: string[] }>(url).subscribe(
      (response) => {
        if (response.status) {
          this.filteredCountries = response.data;
        } else {
          console.warn('No countries found:', response.message);
          this.filteredCountries = [];
        }
      }
    )
  }

  onCountryChange(event: any): void {
    const selectedCountry = event.target.value;
    if (selectedCountry) {
      this.fetchStates(selectedCountry);
    } else {
      this.filteredStates = [];
      this.filteredCities = [];
      this.filteredZips = [];
    }
  }

  fetchStates(countryCode: string): void {
    const url = `${this.apiUrl}getStates?country=${countryCode}`;
    this.http.get<{ message: string; status: boolean; data: string[] }>(url).subscribe(
      (response) => {
        if (response.status) {
          this.filteredStates = response.data;
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
    const url = `${this.apiUrl}getCities?state=${state}`;
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
    const url = `${this.apiUrl}getZipCodes?city=${city}`;
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

  openModal(): void {
    console.log("modal check");
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
  
    let url = ''; 
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


  initializeSearchSubscription(): void {
    this.searchSubscription = this.searchSubject
    .pipe(
      debounceTime(100), 
      distinctUntilChanged(),
      switchMap((query) => this.searchService.search(query)) 
    )
    .subscribe({
      next: (data) => {
        this.searchResults = data;
        this.isDropdownOpen = true;
      },
      error: (error) => {
        console.error('Error fetching search results:', error);
      }
    });
  }

  performSearch(page: number = 1): void {
    this.currentPage = page;
    if (this.searchQuery.trim()) {
      this.searchSubject.next(this.searchQuery); // Emit the latest search query
    } else {
      this.searchResults = [];
      this.isDropdownOpen = false;
    }
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }
  // performSearch(page: number = 1): void {
  //   this.currentPage = page;
  //   // this.loading = true;
  //   if (this.searchQuery.trim()) {
  //     this.searchService.search(this.searchQuery).subscribe({
  //       next: (data) => {
  //         this.searchResults = data;
  //         this.isDropdownOpen = true;
  //       },
  //       error: (error) => {
  //         console.error('Error fetching search results:', error);
  //       },
  //     });
  //   } else {
  //     this.searchResults = [];
  //     this.isDropdownOpen = false;
  //   }
  // }

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
    const formattedQuery = result.display_data?.replace(/\s+/g, '-').toLowerCase();
    this.isDropdownOpen = false; 
   // this.router.navigate([`/${formattedQuery}`]);

    this.router.navigate([`/${formattedQuery}`], {
      state: { displayData: result.display_data } 
    });

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
  
  //   this.http.get(`${this.apiUrl}searchListing?${params.toString()}`).subscribe(
  //     (response: any) => {
  //       console.log('Data:', response.data);
  //       console.log('PaginationData:', response);
  
  //       const totalPages = Math.ceil(response.pagination.total_records / this.pageSize);
  //       const hasPreviousPage = this.currentPage > 1;
  //       const hasNextPage = this.currentPage < totalPages;

  //       // if (response.data && response.data.length > 0) {
  //       //   this.businessNames = response.data[0][0] || 'Business Listings';
  //       // }
  //       if (response.data && response.data.length > 0) {
  //         let businessNamesString = '';

  //         for (let i = 0; i < response.data.length; i++) {

  //           const businessName = response.data[i].business_name || 'Unnamed Business';

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
  
  //       this.populateResults(response.data);
  //       // this.imageProfile(response.data);
  //       this.updatePagination(pagination);
  //       this.loading = false;
  //       this.updateMetaTags();
  //     },
  //     (error) => {
  //       console.error('Error fetching search results:', error);
  //     }
  //   );
  // }  

  imageProfile(data: any[]): void {
    const productPlaceholder = document.getElementById('productPlaceholder');
    if (!productPlaceholder) return;
  
    productPlaceholder.innerHTML = ''; // Clear previous results
  
    data.forEach((item) => {
      const id = item[57];

    });
  }

  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: true,
    arrows: true,
    infinite: true,
  }; 
  
  populateResults(data: any[]): void {
    this.datas = data;
    // const productPlaceholder = document.getElementById('productPlaceholder');
    // if (!productPlaceholder) return;
  
    // productPlaceholder.innerHTML = ''; // Clear previous results

      // this.businessNames = businessName;
  
    //   // Handle redirection on card click
    //   resultItem.addEventListener('click', () => {
    //     this.redirectToListing(listingId);
    //   });

      // Handle redirection on card click
      // resultItem.addEventListener('click', () => {
      //   this.redirectToListing(listingId, businessName, category);
      // });
  
    //   resultItem.innerHTML = `
    //     <div class="flex justify-center items-center mb-4">
    //       <div>
    //         <h3 class="text-lg font-semibold text-gray-800">${businessName}</h3>
    //           <p class="text-sm text-gray-600">
    //             <span class="font-medium">Website:</span> 
    //             ${website ? `<a href="${website}" target="_blank" class="text-gray-600 inline-block max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis no-underline hover:underline">${website}</a>` : 'N/A'}
    //           </p>
    //       </div>
    //     </div>
    //     <p class="text-sm text-gray-600 mb-1"><span class="font-medium">Address:</span> ${city}, ${state}, ${country} ${zipCode}</p>
    //     <p class="text-sm text-gray-600 mb-1"><span class="font-medium">Phone:</span> ${phone}</p>
    //     <p class="text-sm text-gray-600 mb-1"><span class="font-medium">Email:</span> ${email}</p>
    //     <p class="text-sm text-gray-600"><span class="font-medium">Revenue:</span> ${revenue || 'N/A'}</p>
    //   `;
  
    //   productPlaceholder.appendChild(resultItem);
    // });
  }

  // redirectToListing(listingId: string): void {
  //   // this.router.navigate([`/listing/${listingId}`]);
  //   const url = this.router.serializeUrl(this.router.createUrlTree([`/listing/${listingId}`]));
  //   window.open(url, '_blank');

  redirectToListing(listingId: string, businessName: string, category: string): void {
    const country = (document.getElementById('country') as HTMLInputElement).value?.trim();
    const state = (document.getElementById('state') as HTMLInputElement).value?.trim();
    const city = (document.getElementById('city') as HTMLInputElement).value?.trim();
    const zip = (document.getElementById('zip') as HTMLInputElement).value?.trim();

    const formattedBusinessName = businessName.replace(/\s+/g, '-').toLowerCase();
    const formattedCategory = category.replace(/\s+/g, '-').toLowerCase();
    const formattedCountry = country?.replace(/\s+/g, '-').toLowerCase() || '';
    const formattedState = state?.replace(/\s+/g, '-').toLowerCase() || '';
    const formattedCity = city?.replace(/\s+/g, '-').toLowerCase() || '';
    const formattedZip = zip?.replace(/\s+/g, '-').toLowerCase() || '';

    let url = `/listing/${listingId}`;
    if (country) url += `/${formattedCountry}`;
    if (state) url += `/${formattedState}`;
    if (city) url += `/${formattedCity}`;
    if (zip) url += `/${formattedZip}`;
    if (category) url += `/${formattedCategory}`;
    if (businessName) url += `/${formattedBusinessName}`;

    this.router.navigate([url]);
    // const link = document.createElement('a');
    // link.href = this.router.serializeUrl(this.router.createUrlTree([url]));
    // link.target = '_blank';
    // document.body.appendChild(link); // Required to make the click work in some browsers
    // link.click();
    // document.body.removeChild(link);
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

    if (text === 'Previous') {
      button.innerHTML = '&#8592;'; // Left arrow (←)
    } else if (text === 'Next') {
      button.innerHTML = '&#8594;'; // Right arrow (→)
    } else {
      button.innerHTML = text; // Keep the page number as text
    }

    button.className = `px-4 py-2 text-sm rounded ${
      enabled ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    } ${isActive ? 'bg-blue-600 text-white' : ''}`;
    
    if (enabled) {
      button.addEventListener('click', () => clickHandler());
    }
  
    return button;
  }
  
}
