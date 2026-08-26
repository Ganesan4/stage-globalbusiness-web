import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, ViewChild, signal, effect, ElementRef, Renderer2, HostListener, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { catchError, isEmpty } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Branch, BranchMapMarker } from './model';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { WebService } from '../services/web.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
  selector: 'app-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, SlickCarouselModule, ReactiveFormsModule, GoogleMapsModule],
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.scss'
})

export class ListingComponent implements OnInit, OnDestroy {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow | undefined;

  branches = signal<Branch[]>([]);
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 }; // Center of Switzerland
  zoom = 0;
  markers: BranchMapMarker[] = [];
  selectedBranch = signal<Branch | null>(null);
  // Business Information
  apiUrl = environment.base_url;
  listingId: string | undefined;
  isModalOpenfeedback = false;
  totalReviews: number = 0;
  averageRating: number = 0;
  roundedRating: number = 0;
  stars: number[] = [];
  banners: any[] = [];
  businessProfiles: any[] = [];
  addreviews: any[] = [];
  displayedAmenities: any[] = [];
  displayedAmenities1: any[] = [];
  isModalOpenreview = false;
  isModalOpenaddreview = false;
  feedbackForm: FormGroup;
  feedbackSubmitted = false;
  reviewSubmitted: boolean = false;
  businessName: string = 'Global Business Pages';
  logoUrl: string = 'assets/logo.jpg';
  reviews: { id: number; userId: number; content: string; image: string; rating: number }[] = [];
  category: string = 'Restaurant';
  tags: string[] = ['Italian', 'Casual Dining'];
  rating: number = 4.5;
  reviewCount: number = 120;
  newReview = {
    name: '',
    email: '',
    comments: '',
    rating: 0
  };
  @ViewChild('scrollTarget') scrollTarget: ElementRef;
  // Gallery Images
  // images: string[] = [
  //   'assets/img/business1.jpg',
  //   'assets/img/business1.jpg',
  //   'assets/img/business1.jpg'
  // ];
  slides: { img: string; altText: string | null; email: any; website: any; phone: any; }[] = [];
  existingEmails: any;
  userdetails: any;
  reviewpayload: any;
  responsereview: Object;
  getreviewdata: {
    id: any; userId: any; name: any; email: any; text: any; rating: any;
    // Generate initials and assign random color
    initials: any; profileColor: string;
  }[];
  selectedContent: SafeHtml;
  isModalOpenedmetrics: boolean = false;
  activeTab: any = 1;
  isMobileView: boolean = false;
  gallery = [];
  isLightboxOpen = false;
  currentImageIndex = 0;
  galleryCount = 0;
  firstSegment: string;
  user_Id: any;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkViewportWidth();
  }

  ngOnInit() {
    console.log('DEBUG - Route params keys:', this.route.snapshot.paramMap.keys);
    console.log('DEBUG - ID from route:', this.route.snapshot.paramMap.get('id'));
    console.log('DEBUG - Full URL:', window.location.href);
    this.aiSnippetsJson();
    this.checkViewportWidth();
    this.getGalleryImages();
  }


  // aiSnippetsJson() {
  //   this.route.url.subscribe(segments => {
  //     this.firstSegment = segments[0]?.path;
  //     this.user_Id = this.route.snapshot.paramMap.get('id');

  //     this.web.postData('aiSnippetsJson', {
  //       listingId: this.user_Id,
  //       firstSegment: this.firstSegment,
  //       pageUrl: window.location.href  
  //     }).then((res: any) => {
  //       if (res.status === "success") {
  //         console.log('AI Snippets:', res.data);

  //         const script = this.renderer.createElement('script');
  //         script.type = 'application/ld+json';
  //         script.text = JSON.stringify(res.data);
  //         this.renderer.appendChild(document.head, script);
  //       }
  //     });
  //   });
  // }

  // aiSnippetsJson() {
  //   const id = this.route.snapshot.paramMap.get('id');
  //   console.log('DEBUG - aiSnippetsJson called, id:', id);
  //   if (!id) {
  //     console.log('No listing ID available, skipping AI snippets');
  //     return;
  //   }
  //   if (!isPlatformBrowser(this.platformId)) {
  //     console.log('DEBUG - Not in browser, skipping AI snippets');
  //     return;
  //   }

  //   this.firstSegment = this.route.snapshot.url[0]?.path || '';
  //   // this.route.url.subscribe(segments => {
  //   //   this.firstSegment = segments[0]?.path;
  //   //   this.user_Id = this.route.snapshot.paramMap.get('id');

  //   this.web.postData('aiSnippetsJson', {
  //     listingId: id,

  //     firstSegment: this.firstSegment,
  //     pageUrl: window.location.href
  //   }).then((res: any) => {
  //     if (res.status === "success") {
  //       console.log('AI Snippets:', res.data);

  //       // ✅ Remove/replace old JSON-LD by targeting unique ID
  //       // const existingScript = document.getElementById('structured-data-schema');
  //       // if (existingScript) {
  //       //   existingScript.remove();
  //       // }

  //       this.removeSchemaScript();

  //       // ✅ Add the new one
  //       const script = this.renderer.createElement('script');
  //       // script.id = 'structured-data-schema';
  //       script.type = 'application/ld+json';
  //       script.text = JSON.stringify(res.data);
  //       this.renderer.appendChild(document.head, script);
  //     }
  //   });
  //   // });
  // }
aiSnippetsJson() {
    const id = this.route.snapshot.paramMap.get('id') || history.state?.id || this.listingId;
    this.firstSegment = this.route.snapshot.url[0]?.path || '';
    // this.route.url.subscribe(segments => {
    //   this.firstSegment = segments[0]?.path;
    //   this.user_Id = this.route.snapshot.paramMap.get('id');

    this.web.postData('aiSnippetsJson', {
      listingId: id,
      firstSegment: this.firstSegment,
      pageUrl: window.location.href
    }).then((res: any) => {
      if (res.status === "success") {
        console.log('AI Snippets:', res.data);

        // ✅ Remove/replace old JSON-LD by targeting unique ID
        // const existingScript = document.getElementById('structured-data-schema');
        // if (existingScript) {
        //   existingScript.remove();
        // }

        this.removeSchemaScript();

        // ✅ Add the new one
        const script = this.renderer.createElement('script');
        // script.id = 'structured-data-schema';
        script.type = 'application/ld+json';
        script.text = JSON.stringify(res.data);
        this.renderer.appendChild(document.head, script);
      }
    });
    // });
    this.updateCanonicalUrl();
  }
    updateCanonicalUrl() {
    const cleanUrl = window.location.origin + this.router.url.split('?')[0];
console.log("cleanUrl",cleanUrl);

    const link: HTMLLinkElement | null = document.querySelector("link[rel='canonical']");
    console.log("link", link);

    if (link) {
      link.setAttribute('href', cleanUrl);
    }
  }
  ngOnDestroy() {
    this.removeSchemaScript();
  }

  private removeSchemaScript() {
    if (isPlatformBrowser(this.platformId)) {
      const oldScripts = document.querySelectorAll('script[type="application/ld+json"]');
      oldScripts.forEach(script => script.remove());
    }
  }



  checkViewportWidth() {
    this.isMobileView = window.innerWidth < 680;
  }

  changeTab(tabIndex: number) {
    this.activeTab = tabIndex;
    console.log('Active Tab:', this.activeTab);
  }

  changeFromDropdown(event: Event) {
    this.activeTab = (event.target as HTMLSelectElement).value;
    console.log('Active Tab:', this.activeTab);
  }

  constructor(private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private web: WebService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object) {

    // const id = this.route.snapshot.paramMap.get('id');
    // console.log('ID:', id); 
    this.getAllRegister();
    // this.getbanner();
    // this.getReviews();
    this.feedbackForm = this.fb.group({
      name: ['', Validators.required],
      feedback_email: ['', [Validators.required, Validators.email]],
      feedback_address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
      comments: ['', Validators.required],
    });
  }
  // ngOnInit(): void {

  // const id = this.route.snapshot.paramMap.get('id');
  // console.log('ID:', id); 
  // this.getAllRegister();

  // this.getReviews();
  // this.getbanner();
  // }

  getbanner() {

    const navigation = this.router.getCurrentNavigation();
    const state = (navigation?.extras.state || history.state) as { id?: string; source?: string; data?: any };

    if (state) {
      this.listingId = state.id;
      console.log('Listing ID new:', this.listingId);
      console.log('Source:', state.source);
      console.log('Data:', state.data);
    } else {
      console.log('No state passed to this page.');
    }

    const userId = this.listingId;
    console.log('ID:', userId);
    this.http
      .get<any[]>(`${this.apiUrl}getBanners/${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching banners:', error);
          return throwError(() => error);
        })
      )
      .subscribe(data => {
        console.log("Dataaaa:", data);
        this.slides = data.map(banner => {
          const rawImage = banner[2];
          const cleanedImage = rawImage.replace(/^(data:image\/\w+;base64,)+/, 'data:image/png;base64,'); // Ensure correct base64 format
          return {
            img: cleanedImage,
            altText: banner[3],
            email: this.userdetails[0][4],
            website: this.userdetails[0][6],
            phone: this.userdetails[0][3]
          };
        });
        console.log("this.slides", this.slides);

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

  getReviews() {
    const navigation = this.router.getCurrentNavigation();
    const state = (navigation?.extras.state || history.state) as { id?: string; source?: string; data?: any };

    if (state) {
      this.listingId = state.id;
      console.log('Listing ID new:', this.listingId);
      console.log('Source:', state.source);
      console.log('Data:', state.data);
    } else {
      console.log('No state passed to this page.');
    }

    const userId = this.listingId;
    console.log('ID:', userId);
    this.http
      .get<any[]>(`${this.apiUrl}getReview/${userId}`)
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

  get name() {
    return this.feedbackForm.get('name');
  }

  get feedback_email() {
    return this.feedbackForm.get('feedback_email');
  }

  get feedback_address() {
    return this.feedbackForm.get('feedback_address');
  }

  get phone() {
    return this.feedbackForm.get('phone');
  }

  get comments() {
    return this.feedbackForm.get('comments');
  }
  truncateText(text: string): string {
    return text.length > 150 ? text.substring(0, 150) : text;
  }

  getTruncatedHtml(html: string): SafeHtml {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;
    const text = tempElement.textContent || tempElement.innerText || '';
    const truncated = text.length > 150 ? text.substring(0, 150) + '...' : text;
    return this.sanitizer.bypassSecurityTrustHtml(truncated);
  }


  openModalmetrics(content: string): void {
    // this.selectedContent = content;
    this.selectedContent = this.sanitizer.bypassSecurityTrustHtml(content);
    this.isModalOpenedmetrics = true;
    this.renderer.addClass(document.body, 'no-scroll')

  }

  closeModalmetrics(): void {
    this.isModalOpenedmetrics = false;
    this.renderer.removeClass(document.body, 'no-scroll')
    this.selectedContent = '';
  }


  onSubmit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { id?: string; source?: string; data?: any };

    if (state) {
      this.listingId = state.id;
      console.log('Listing ID new:', this.listingId);
      console.log('Source:', state.source);
      console.log('Data:', state.data);
    } else {
      console.log('No state passed to this page.');
    }

    const id = this.listingId;
    console.log('ID:', id);
    if (this.feedbackForm.valid) {
      this.feedbackSubmitted = true;
      const feedbackData = {
        name: this.feedbackForm.value.name,
        feedback_email: this.feedbackForm.value.feedback_email,
        feedback_address: this.feedbackForm.value.feedback_address,
        phone: this.feedbackForm.value.phone,
        comments: this.feedbackForm.value.comments,
        userid: id,
      };


      this.http.post(`${this.apiUrl}save-feedback`, feedbackData)
        .subscribe(
          response => {
            console.log('Feedback submitted successfully', response);
          },
          error => {
            console.error('Error occurred while submitting feedback', error);
          }
        );
      setTimeout(() => {
        this.feedbackSubmitted = false;
        this.closeModalfeedback();
        this.feedbackForm.reset();
      }, 2000);
    } else {
      // Mark all fields as touched to trigger validation messages
      this.feedbackForm.markAllAsTouched();
    }
  }


  openModalfeedback() {
    this.isModalOpenfeedback = true;
  }

  closeModalfeedback() {
    this.isModalOpenfeedback = false;
    this.feedbackSubmitted = false;
    this.feedbackForm.reset();
  }
  openModalreview() {
    this.isModalOpenreview = true;
  }

  closeModalreview() {
    this.isModalOpenreview = false;

  }

  openModaladdreview() {
    this.isModalOpenaddreview = true;
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

      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras.state as { id?: string; source?: string; data?: any };

      if (state) {
        this.listingId = state.id;
        console.log('Listing ID new:', this.listingId);
        console.log('Source:', state.source);
        console.log('Data:', state.data);
      } else {
        console.log('No state passed to this page.');
      }

      const id = this.listingId;
      console.log('ID:', id);
      this.reviewpayload = {
        userid: id,
        name: this.newReview.name,
        email: this.addreviews[0].email,
        comments: this.newReview.comments,
        ratings: this.addreviews[0].ratings,
      };
      console.log("this.reviewpayload", this.reviewpayload);

      this.http.post<ReviewResponse>(`${this.apiUrl}save-review`, this.reviewpayload)
        .subscribe(
          (response) => {
            console.log('Review submitted successfully', response);
            if (response.status === true) {
              this.reviewSubmitted = true; // Show the success message
              setTimeout(() => {
                this.closeModaladdreview(); // Close modal after 2 seconds
                this.reviewSubmitted = false; // Reset success message visibility
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
  closeModaladdreview(): void {
    this.isModalOpenaddreview = false;
    this.newReview = { name: '', email: '', comments: '', rating: 0 }; // Reset form after close
  }

  profile = {
    name: 'Business Name',
    company: 'tags',
    description:
      'Brief description about the business. Highlight the unique value proposition or primary offerings here.',


  };

  openIndex: number | null = null;

  toggle(index: number): void {
    this.openIndex = this.openIndex === index ? null : index;
  }
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 1500,
    dots: true,
    arrows: true
  };

  slideConfiggallery = {
    slidesToShow: 3,
    slidesToScroll: 3,
    infinite: false, // Disable infinite looping
    arrows: true,
    speed: 200,
    autoplay: false,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };



  amenities = [
    { name: 'Wi-Fi Access', icon: 'fas fa-wifi' },
    { name: 'Parking Facilities', icon: 'fas fa-parking' },
    { name: 'Accessibility Features', icon: 'fas fa-wheelchair' },
    { name: 'Air Conditioning/Heating', icon: 'fas fa-snowflake' },
    { name: 'Pet-Friendly Options', icon: 'fas fa-paw' },
    { name: 'Restrooms', icon: 'fas fa-restroom' },
    { name: 'Outdoor Seating', icon: 'fas fa-chair' },
    { name: 'Takeout Options', icon: 'fas fa-box' },
    { name: 'Kid-Friendly Menu', icon: 'fas fa-child' },
    { name: 'Breakfast Available', icon: 'fas fa-coffee' },
    { name: 'Vegetarian/Vegan Options', icon: 'fas fa-leaf' },
    { name: 'Gym/Fitness Center', icon: 'fas fa-dumbbell' },
    { name: 'Pool Facilities', icon: 'fas fa-swimmer' },
    { name: 'Spa Services', icon: 'fas fa-spa' },
    { name: 'Personal Trainers Available', icon: 'fas fa-user-tie' },
    { name: 'Catering Services', icon: 'fas fa-utensils' },
    { name: 'Conference Rooms', icon: 'fas fa-users' },
    { name: 'Printing/Copying Services', icon: 'fas fa-print' },
    { name: 'High-Speed Internet', icon: 'fas fa-bolt' },
    { name: 'Business Center', icon: 'fas fa-building' },
    { name: 'Event Planning Services', icon: 'fas fa-calendar-alt' },
    { name: 'Live Music/Entertainment', icon: 'fas fa-music' },
    { name: 'Game Room', icon: 'fas fa-gamepad' },
    { name: 'Sports Facilities', icon: 'fas fa-futbol' },
    { name: 'Library/Reading Area', icon: 'fas fa-book' },
    { name: '24/7 Security', icon: 'fas fa-shield-alt' },
    { name: 'CCTV Surveillance', icon: 'fas fa-video' },
    { name: 'Safe Deposit Boxes', icon: 'fas fa-box' },
    { name: 'Emergency Exits', icon: 'fas fa-door-open' },
    { name: 'Proximity to Public Transportation', icon: 'fas fa-bus' },
    { name: 'Nearby Attractions', icon: 'fas fa-map-marker-alt' },
    { name: 'Local Tours/Guided Services', icon: 'fas fa-hiking' },
    { name: 'Recycling Programs', icon: 'fas fa-recycle' },
    { name: 'Sustainable Practices', icon: 'fas fa-leaf' },
    { name: 'Electric Vehicle Charging Stations', icon: 'fas fa-charging-station' },
    { name: 'Loyalty Programs', icon: 'fas fa-gift' },
    { name: 'Gift Shop', icon: 'fas fa-store' },
    { name: 'Shuttle Services', icon: 'fas fa-bus' }
  ];


  // Modal control
  isModalOpen = false;

  // Method to open the modal
  openModal() {
    this.isModalOpen = true;
    this.renderer.addClass(document.body, 'no-scroll');
  }

  // Method to close the modal
  closeModal() {
    this.isModalOpen = false;
    this.renderer.removeClass(document.body, 'no-scroll');
  }
  scrollToSection() {
    this.scrollTarget.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
  removeSlide() {
    this.slides.length = this.slides.length - 1;
  }


  // Contact Information
  phoneNumber: string = '+1 234 567 890';
  email: string = 'contact@business.com';
  address: string = '123 Business St., City, Country';
  websiteUrl: string = 'https://business.com';

  // Operating Hours
  operatingHours: { name: string; hours: string }[] = [
    { name: 'Monday', hours: '9:00 AM - 5:00 PM' },
    { name: 'Tuesday', hours: '9:00 AM - 5:00 PM' },
    { name: 'Wednesday', hours: '9:00 AM - 5:00 PM' },
    { name: 'Thursday', hours: '9:00 AM - 5:00 PM' },
    { name: 'Friday', hours: '9:00 AM - 5:00 PM' },
    { name: 'Saturday', hours: '10:00 AM - 2:00 PM' },
    { name: 'Sunday', hours: 'Closed' }
  ];

  // Services
  services: { name: string; description: string }[] = [
    { name: 'Dine-in', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.' },
    { name: 'Takeout', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.' },
    { name: 'Delivery', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.' }
  ];


  openEmail(email: string): void {
    window.location.href = `mailto:${email}`;
  }

  // Method to call phone number
  callPhone(phone: string): void {
    window.location.href = `tel:${phone}`;
  }

  // Method to visit website
  visitWebsite(website: string): void {
    window.location.href = website;
  }

  getValidUrl(url: string): string {
    if (!/^https?:\/\//i.test(url)) {
      return `http://${url}`;
    }
    return url;
  }

  getFullAddress(): string {
    const address = this.userdetails[0][8] || '';
    const city = this.userdetails[0][10] || '';
    const state = this.userdetails[0][9] || '';
    const country = this.userdetails[0][7] || '';

    // Combine fields with commas, filtering out empty values
    return [address, city, state, country].filter(part => part.trim() !== '').join(', ');
  }

  getAllRegister() {
    const navigation = this.router.getCurrentNavigation();
    const state = (navigation?.extras.state || history.state) as { id?: string; source?: string; data?: any };
    console.log('stating', state);

    // if (state) {
    //   this.listingId = state.id;
    //   console.log('Listing ID new:', this.listingId);
    //   console.log('Source:', state.source);
    //   console.log('Data:', state.data);
    // } else if (this.listingId == undefined) {
    //   this.route.paramMap.subscribe(params => {
    //     this.listingId = params.get('id');
    //     console.log('Business ID:', this.listingId);
    //   });
    // } else {
    //   console.log('No state passed to this page.');
    // }

    // const id = this.listingId;
    // console.log('ID:', id);

    if (state?.id) {
      this.listingId = state.id;
    } else {
      this.listingId = this.route.snapshot.paramMap.get('id') || history.state?.id;
    }

    this.http.get<any>(`${this.apiUrl}getregistration/${this.listingId}`)
      .subscribe(response => {
        console.log("Registration detail response:", response);
        const registrationData = response?.data ?? response;

        if (Array.isArray(registrationData) && Array.isArray(registrationData[0])) {
          this.setRegistrationDetails(registrationData);
        } else {
          this.fetchLegacyRegisterDetails();
        }
      }, error => {
        console.error('Error fetching getregistration:', error);
        this.fetchLegacyRegisterDetails();
      });
  }

  private fetchLegacyRegisterDetails(): void {
    this.http.get<any[]>(`${this.apiUrl}getAllregister/${this.listingId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching getAllregister:', error);
          return throwError(() => error);
        })
      )
      .subscribe(data => this.setRegistrationDetails(data));
  }

  private setRegistrationDetails(data: any[]): void {
    console.log("Dataaaa:", data);
    const filteredObject = data;
    if (filteredObject) {
      console.log("Object with id 177:", filteredObject);
      this.userdetails = filteredObject;
      console.log("this.userdetails", this.userdetails);

      const amenitiesArray = this.userdetails[0]?.find((entry) => Array.isArray(entry));
      console.log("Extracted Amenities Data:", amenitiesArray);

      if (Array.isArray(amenitiesArray)) {
        console.log("Processing amenities...");
        this.displayedAmenities = amenitiesArray.map((item) => {
          const matchedAmenity = this.amenities.find(amenity => amenity.name === item.title);
          return matchedAmenity
            ? { name: matchedAmenity.name, icon: matchedAmenity.icon, category: item.category, cost: item.cost, description: item.description, isFree: item.isFree }
            : { name: item.title, icon: 'fas fa-question-circle' };
        });

        console.log("All Matched Amenities:", this.displayedAmenities);

        // Limit to the first 6 displayed amenities
        this.displayedAmenities1 = this.displayedAmenities.slice(0, 6);
      } else {
        console.log("No amenities array found.");
      }

      this.getbanner();
      this.getCoordinates();
      this.getReviews();
    } else {
      console.log("No object found with id 177.");
    }
  }

  // FAQs
  faqs: { question: string; answer: string }[] = [
    { question: 'Do you offer vegetarian options?', answer: 'Yes, we have a variety of vegetarian dishes available.' },
    { question: 'Is parking available?', answer: 'Yes, we provide parking spaces for our customers.' },
    { question: 'Can I make a reservation?', answer: 'Yes, reservations can be made by calling our contact number.' }
  ];


  // center: google.maps.LatLngLiteral = { lat: 24, lng: 12 }; // Default location
  // zoom = 4;
  display!: google.maps.LatLngLiteral;

  getCoordinates() {
    const fullAddress = `${this.userdetails[0][0]}, ${this.userdetails[0][8]}, ${this.userdetails[0][10]}, ${this.userdetails[0][9]}, ${this.userdetails[0][7]}`;
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
        this.initializeMarkers(location.lat(), location.lng());
      } else {
        console.log('Geocoding failed: ', status);
      }
    });
  }

  // Methods to move map on events
  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.center = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
    }
  }

  move(event: google.maps.MapMouseEvent) {
    console.log('Mouse moved to:', event.latLng?.toJSON());
  }

  initializeMarkers(lat: number, lng: number) {
    this.branches.set([
      {
        id: 1,
        name: this.userdetails[0][0],
        lat: lat,
        lng: lng,
        postCode: this.userdetails[0][11],
        state: this.userdetails[0][9],
        city: this.userdetails[0][10],
        address: this.userdetails[0][8]
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
      }
    }));
    console.log('Updated markers:', this.markers);
  }


  // getMarkers() {
  //   console.log('branches', this.branches());
  //   return this.branches()
  //     .map((branch) => {
  //       const marker: BranchMapMarker = {
  //         label: '',
  //         position: { lat: branch.lat, lng: branch.lng },
  //         title: branch.name,
  //         options: { animation: google.maps.Animation.DROP },
  //         branch: branch,
  //       };
  //       return marker;
  //     })
  //     .filter(
  //       (marker) => !isNaN(marker.position.lat) && !isNaN(marker.position.lng)
  //     );
  // }

  openInfoWindow(branch: Branch, marker: MapMarker): void {
    this.selectedBranch.set(branch);
    if (this.infoWindow) {
      this.infoWindow.open(marker);
    }
  }

  getValidImageSrc(imageUrl: string): string {
    if (imageUrl && imageUrl.endsWith('undefined')) {
      return 'assets/img/dummys.jpg'
    }
    else {
      return imageUrl || 'assets/img/dummys.jpg';
    }
  }

  getServerImageUrl(imagePath: string): string {
    if (!imagePath) {
      return 'assets/img/dummys.jpg';
    }
    if (/^(https?:)?\/\//i.test(imagePath) || imagePath.startsWith('data:') || imagePath.startsWith('assets/')) {
      return imagePath;
    }
    return `${this.apiUrl}${imagePath.replace(/^\/+/, '')}`;
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) {
      return ''
    }
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  cpage = 1; // Current page
  cpagesize = 10; // Page size

  getGalleryImages() {
    const navigation = this.router.getCurrentNavigation();
    const state = (navigation?.extras.state || history.state) as { id?: string; source?: string; data?: any };

    if (state?.id) {
      this.listingId = state.id;
    } else {
      this.listingId = this.route.snapshot.paramMap.get('id') || history.state?.id;
    }

    this.fetchGalleryImages(this.cpage, this.cpagesize);
  }

  fetchGalleryImages(page: number, pageSize: number) {
    const id = this.listingId;
    this.http
      .get<any>(`${this.apiUrl}getGallery/${id}?page=${page}&pageSize=${pageSize}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching gallery images:', error);
          return throwError(() => error);
        })
      )
      .subscribe(datas => {
        this.gallery = [...this.gallery, ...datas.data.rows];
        console.log('Galleryyyy:', this.gallery);
        this.galleryCount = datas.data.count;
        console.log('Gallery Count:', this.galleryCount);
      });
  }

  onAfterChange(event: any) {
    console.log('onAfterChange', event);
    const currentSlide = event.currentSlide;
    const totalSlides = this.gallery.length;

    // Check if we're at the last slide
    if (totalSlides - currentSlide <= 3) {
      // if (currentSlide === totalSlides - 1) {
      this.loadMoreImages();
    }
  }

  loadMoreImages() {
    if (this.gallery.length < this.galleryCount) {
      this.cpage++;
      this.fetchGalleryImages(this.cpage, this.cpagesize);
    }
  }

  openLightbox(index: number): void {
    this.currentImageIndex = index;
    this.isLightboxOpen = true;
  }

  closeLightbox(): void {
    this.isLightboxOpen = false;
  }

  prevImage(): void {
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.gallery.length) % this.gallery.length;
  }

  nextImage(): void {
    this.currentImageIndex =
      (this.currentImageIndex + 1) % this.gallery.length;
  }
}
