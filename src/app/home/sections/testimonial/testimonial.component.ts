import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SlickCarouselComponent, SlickCarouselModule } from 'ngx-slick-carousel';
import { Router } from '@angular/router';
import { AffiliatePopupComponent } from '../../../shared/components/affiliate-popup/affiliate-popup.component';
@Component({
  selector: 'app-testimonial',
  standalone: true,
  imports: [SlickCarouselModule, CommonModule, AffiliatePopupComponent],
  templateUrl: './testimonial.component.html',
  styleUrl: './testimonial.component.scss'
})
export class TestimonialComponent implements OnInit {
constructor(private router: Router) {}
  @ViewChild('slickModal', { static: true }) slickModal!: SlickCarouselComponent;
  showAffiliatePopup = false;
  isAffiliateUser: boolean = false;

  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: false,       // disable default arrows
    dots: false,         // removed dots
    infinite: true,
    speed: 600,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } }
    ]
  };


  testimonials = [
    {
      text: "GlobalBusinessPages.com provided amazing exposure for my local business. local buyers contacted me, and the site’s features helped boost my online presence. Highly recommended!",
      name: "John T.",
      avatar: "assets/img/avatar1.png",
      expanded: false
    },
    {
      text: "Joining for just $1.30/year was a game changer! My local customers increased, and inquiries from localbuyers have been steady. Fantastic platform for business growth!",
      name: "Sarah K.",
      avatar: "assets/img/avatar6.png",
      expanded: false
    },
    {
      text: "Within weeks of joining, I saw local and localenquiries flood in. GlobalBusinessPages.com offers a simple yet powerful way to expand your business presence online.",
      name: "Tom L.",
      avatar: "assets/img/avatar2.png",
      expanded: false
    },
    {
      text: "Affordable and effective! For just $1.30/year, I got listed, added my products, and started receiving inquiries from customers worldwide. Worth every penny!",
      name: "Emma W.",
      avatar: "assets/img/avatar7.png",
      expanded: false
    },
    {
      text: "GlobalBusinessPages.com allowed me to add 50 business details and product pages. The best part? Real buyers reached out, not fake listings like other sites!",
      name: "Marcus D.",
      avatar: "assets/img/avatar3.png",
      expanded: false
    },
    {
      text: "Fantastic service! For such a low price, GlobalBusinessPages.com brought more local customers and expanded my reach to localbuyers. Definitely worth the investment!",
      name: "Linda B.",
      avatar: "assets/img/avatar8.png",
      expanded: false
    },
    {
      text: "I added detailed information and products, and within a month, local inquiries started pouring in. The weekly updates keep my listing at the top. Great platform!",
      name: "James H.",
      avatar: "assets/img/avatar4.png",
      expanded: false
    },
    {
      text: "As a small business owner, GlobalBusinessPages.com has been a godsend. Affordable, professional, and a great way to ensure customers find me both locally and internationally.",
      name: "Natalie C.",
      avatar: "assets/img/avatar9.png",
      expanded: false
    },
    {
      text: "GlobalBusinessPages.com has been incredibly effective. My business profile is visible worldwide, and I love how easy it is to update my information regularly. Highly satisfied!",
      name: "David M.",
      avatar: "assets/img/avatar5.png",
      expanded: false
    },
    {
      text: "Joining for $1.30/year was one of the best decisions! My business grew with international and local customers. I trust GlobalBusinessPages.com to keep my listing active.",
      name: "Sophia G.",
      avatar: "assets/img/avatar10.png",
      expanded: false
    }
  ];


  next() { this.slickModal.slickNext(); }
  prev() { this.slickModal.slickPrev(); }


  ngOnInit() {
    this.testimonials = this.testimonials.map(t => ({
      ...t,
      expanded: false   // auto add
    }));
    this.isAffiliateUser = localStorage.getItem('affiliateUser') === 'true';
  }

  toggleText(item: any) {
    item.expanded = !item.expanded;
  }

goToUpgrade() {
  this.router.navigate(['/upgrade']);
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

}
