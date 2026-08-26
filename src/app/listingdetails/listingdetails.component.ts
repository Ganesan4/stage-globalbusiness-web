import { Component, signal, ViewChild, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../services/web.service';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { Branch, BranchMapMarker } from './model';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';
interface ReviewResponse {
  status: boolean;
  message: string;
  data: {
    comments: string | null;
    email: string;
    name: string | null;
    rating: number;
    status: string;
    userid: number;
  };
}

@Component({
  selector: 'app-listingdetails',
  standalone: true,
  imports: [GoogleMapsModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listingdetails.component.html',
  styleUrl: './listingdetails.component.scss'
})
export class ListingdetailsComponent implements OnInit, OnDestroy {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow | undefined;
  getreviewdata: {
    id: any; userId: any; name: any; email: any; text: any; rating: any;
    // Generate initials and assign random color
    initials: any; profileColor: string;
  }[];
  branches = signal<Branch[]>([]);
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 }; // Center of Switzerland
  zoom = 0;
  reviewSubmitted: boolean = false;
  markers: BranchMapMarker[] = [];
  apiUrl = environment.base_url;
  selectedBranch = signal<Branch | null>(null);
  totalReviews: number = 0;
  averageRating: number = 0;
  roundedRating: number = 0;
  stars: number[] = [];
  listingdetails: any;
  selectedContent: string;
  ListingId: string | null = null;
  isModalOpenedmetrics: boolean = false;
  isModalOpenreview = false;
  isModalOpenaddreview = false;
  reviewpayload: any;
  addreviews: any[] = [];
  newReview = {
    name: '',
    email: '',
    comments: '',
    rating: 0
  };

  constructor(
    private route: ActivatedRoute,
    private web: WebService,
    private http: HttpClient,
    private router: Router,
    private renderer: Renderer2,
  ) {

  }
  ngOnInit(): void {
    console.log("FULL URL:", this.router.url);
    console.log('DEBUG - Route params keys:', this.route.snapshot.paramMap.keys);
    console.log('DEBUG - All params:', this.route.snapshot.params);
    
    // Try to get ID from route param first, fallback to last URL segment
    this.ListingId = this.route.snapshot.paramMap.get('id');
    if (history.state?.data) {
      this.listingdetails = history.state.data;
    }
    if (!this.ListingId && history.state?.id) {
      this.ListingId = history.state.id.toString();
      console.log('DEBUG - Loaded ID from navigation state:', this.ListingId);
    }
    if (!this.ListingId) {
      // Extract ID from last URL segment (e.g., /business-directory/.../837923)
      const urlSegments = this.router.url.split('/');
      const lastSegment = urlSegments[urlSegments.length - 1];
      // Check if last segment is a number (ID)
      if (lastSegment && /^\d+$/.test(lastSegment)) {
        this.ListingId = lastSegment;
        console.log('DEBUG - Extracted ID from URL:', this.ListingId);
      }
    }
    
    console.log("Listing ID:", this.ListingId);
    if (!this.ListingId) {
      this.loadListingIdFromSlug();
      return;
    }
    this.loadListingPageData();
  }

  private loadListingPageData(): void {
    this.getListingsDetails();
    this.aiSnippetsJson();
    this.getReviews();
  }

  private loadListingIdFromSlug(): void {
    const categorySlug = this.route.snapshot.paramMap.get('categorySlug');
    const citySlug = this.route.snapshot.paramMap.get('citySlug');
    const businessSlug = this.route.snapshot.paramMap.get('businessSlug');

    if (!categorySlug || !citySlug || !businessSlug) {
      return;
    }

    const category = categorySlug.replace(/-/g, ' ');
    const city = citySlug.replace(/-/g, ' ');
    const expectedSlugUrl = `/${categorySlug}/${citySlug}/${businessSlug}`;
    const params = new URLSearchParams({
      country: '',
      state: '',
      city,
      zip: '',
      category,
      page: '1',
      page_size: '10',
    });

    this.http.get<any>(`${this.apiUrl}searchallListing?${params.toString()}`).subscribe(response => {
      const listing = response?.data?.find((item: any) => item.slug_url === expectedSlugUrl || item.slug === businessSlug);
      if (listing?.id) {
        this.ListingId = listing.id.toString();
        console.log('DEBUG - Loaded ID from slug URL:', this.ListingId);
        this.loadListingPageData();
      }
    });
  }


  fields = [
    { key: 'company_name', label: 'Company Name' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'zip', label: 'Zip Code' },
    { key: 'county', label: 'County' },
    { key: 'phone', label: 'Phone' },
    { key: 'website', label: 'Website' },
    { key: 'sic_code', label: 'SIC Code' },
    { key: 'sic_description', label: 'SIC Description' },
    { key: 'fax_number', label: 'Fax Number' },
    { key: 'total_employee', label: 'Total Employee' },
    { key: 'employee_range', label: 'Employee Range' },
    { key: 'naics_number', label: 'NAICS Number' },
    { key: 'industry', label: 'Industry' },
  ];


  openModaladdreview() {
    this.isModalOpenaddreview = true;
  }
  closeModaladdreview(): void {
    this.isModalOpenaddreview = false;
    this.newReview = { name: '', email: '', comments: '', rating: 0 }; // Reset form after close
  }

  aiSnippetsJson() {
      this.web.postData('aiSnippetsJson', {
        listingId: this.ListingId,
        firstSegment: this.route.snapshot.url[0]?.path,
        pageUrl: window.location.href
      }).then((res: any) => {
        if (res.status === "success") {
          console.log('AI Snippets:', res.data);
          this.removeSchemaScript();
          const script = this.renderer.createElement('script');
          script.type = 'application/ld+json';
          script.text = JSON.stringify(res.data);
          this.renderer.appendChild(document.head, script);
        }
      // });
    });
  }

  ngOnDestroy() {
    this.removeSchemaScript();
  }

  private removeSchemaScript() {
    const oldScripts = document.querySelectorAll('script[type="application/ld+json"]');
    oldScripts.forEach(script => script.remove());
  }

  getListingsDetails() {
    if (!this.ListingId) return;
    console.log('IDddddd:', this.ListingId);
    this.web.getData(`getListingDetails/${this.ListingId}`).then((response: any) => {
      if (response.status) {
        this.listingdetails = response.data;
        console.log('this.listingdetails', this.listingdetails);
        this.initializeMapFromListingDetails();
        // this.center = {
        //   lat : parseFloat(this.listingdetails.latitude),
        //   lng : parseFloat(this.listingdetails.longitude)
        //   }
        // this.zoom = 14;  
        // this.initializeMarkers(this.center.lat, this.center.lng);
      }
    })
  }

  private initializeMapFromListingDetails(): void {
    if (!this.listingdetails) return;

    const fullAddress = `${this.listingdetails.company_name}, ${this.listingdetails.address}, ${this.listingdetails.city}, ${this.listingdetails.state}, ${this.listingdetails.country}`;
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: fullAddress }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        this.center = {
          lat: location.lat(),
          lng: location.lng(),
        };
        this.zoom = 16;
        console.log('Geocoded Location:', this.center);
        this.initializeMarkers(location.lat(), location.lng());
      } else {
        console.log('Geocoding failed: ', status);
      }
    });
  }
  submitReview(): void {
    if (this.newReview.name && this.newReview.email && this.newReview.comments && this.newReview.rating) {
      this.addreviews.push({
        author: this.newReview.name,
        email: this.newReview.email,
        text: this.newReview.comments,
        ratings: this.newReview.rating
      });
      console.log("this.addreviews", this.addreviews);
      console.log("this.newReview", this.newReview);
      // const id = this.route.snapshot.paramMap.get('id');
      //  console.log('ID:', id); 
      this.reviewpayload = {
        userid: this.ListingId,
        name: this.newReview.name,
        email: this.addreviews[0].email,
        comments: this.newReview.comments,
        ratings: this.addreviews[0].ratings,
      };
      console.log("this.reviewpayload", this.reviewpayload);

      this.http.post<ReviewResponse>(`${this.apiUrl}save-review-listing`, this.reviewpayload)
        .subscribe(
          (response) => {
            console.log('Review submitted successfully', response);
            if (response.status === true) {
              this.reviewSubmitted = true;
              setTimeout(() => {
                this.closeModaladdreview();
                this.reviewSubmitted = false;
                this.ngOnInit();
              }, 2000);
            }
          },
          (error) => {
            console.error('Error occurred while submitting review', error);
          }
        );
    }
  }
  setRating(star: number): void {
    this.newReview.rating = star;
  }
  getReviews() {
    // const userId = this.route.snapshot.paramMap.get('id');
    console.log('IDdddddddddddd:', this.ListingId);
    this.http
      .get<any[]>(`${this.apiUrl}getReview-listing/${this.ListingId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching reviews:', error);
          return throwError(() => error);
        })
      )
      .subscribe(data => {
        console.log("Dataaaa:", data);

        // Filter reviews with status === 1
        this.getreviewdata = data
          .filter(review => review[6] === 1) // Only include reviews with status 1
          .map(review => ({
            id: review[0],
            userId: review[1],
            name: review[2],
            email: review[3],
            text: review[4],
            rating: review[5],
            initials: review[2].charAt(0).toUpperCase(),
            profileColor: this.getRandomColor(),
          }));
        console.log("this.getreviewdata", this.getreviewdata);

        const filteredReviews = data.filter(review => review[6] === 1);


        this.totalReviews = filteredReviews.length;
        const totalRating = filteredReviews.reduce((sum, review) => sum + review[5], 0);
        this.averageRating = this.totalReviews ? totalRating / this.totalReviews : 0;

        this.stars = Array(5).fill(0);
        this.roundedRating = Math.round(this.averageRating);
      });
  }

  getRandomColor(): string {
    const colors = ['#FFB6C1', '#87CEFA', '#FFD700', '#90EE90', '#FF4500', '#9370DB'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  initializeMarkers(lat: number, lng: number) {
    this.branches.set([
      {
        id: this.listingdetails.id,
        name: this.listingdetails.company_name,
        lat: lat,
        lng: lng,
        address: this.listingdetails.address,
        state: this.listingdetails.state,
        city: this.listingdetails.city,
        postCode: this.listingdetails.zip,
      }
    ]);
    this.updateMarkers();
  }

  updateMarkers() {
    this.markers = this.branches().map(branch => ({
      branch,
      position: {
        lat: branch.lat,
        lng: branch.lng
      },
      title: branch.name,
      options: {
        icon: {
          url: 'assets/img/markerr.png',
          scaledSize: { width: 40, height: 40 } // Adjust marker size
        },
        animation: google.maps.Animation.BOUNCE
      },
    }));
    console.log('Updated markers:', this.markers);
  }

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.center = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
    }
  }

  openInfoWindow(branch: Branch, marker: MapMarker): void {
    this.selectedBranch.set(branch);
    if (this.infoWindow) {
      this.infoWindow.open(marker);
    }
  }

  truncateText(text: string): string {
    return text.length > 150 ? text.substring(0, 150) : text;
  }

  // openModalmetrics(content: string): void {
  //     this.selectedContent = content;
  //     this.isModalOpenedmetrics = true;
  //   }

  //   closeModalmetrics(): void {
  //     this.isModalOpenedmetrics = false;
  //     this.selectedContent = '';
  //   }

}
