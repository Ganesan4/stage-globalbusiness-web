import { Component, OnInit } from '@angular/core';
import { WebService } from '../../../services/web.service';
import { CountService } from '../../../services/count.service';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CommonModule } from '@angular/common';
import { SlickCarouselModule } from 'ngx-slick-carousel';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [NgxSkeletonLoaderModule, CommonModule, SlickCarouselModule],
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.scss'
})
export class HowItWorksComponent implements OnInit {

  formattedCount: any;
  contentLoaded: boolean = false;

  constructor(
    private web: WebService,
    private countService: CountService
  ) { }

  slideConfigTop = {
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    speed: 3000,
    cssEase: 'linear',
    arrows: false,
    dots: false,
    infinite: true,
    pauseOnHover: false,
    swipe: false,
    touchMove: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3, speed: 3000 }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2, speed: 3000 }
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1, speed: 3000 }
      }
    ]
  };

  slideConfigBottom = {
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    speed: 3000,
    cssEase: 'linear',
    arrows: false,
    dots: false,
    infinite: true,
    pauseOnHover: false,
    swipe: false,
    touchMove: false,
    rtl: true, // Right to left for opposite direction
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3, speed: 3000, rtl: true }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2, speed: 3000, rtl: true }
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1, speed: 3000, rtl: true }
      }
    ]
  };

  logosTop = [
    'assets/logo/logo1.png',
    'assets/logo/logo2.png',
    'assets/logo/logo3.png',
    'assets/logo/logo4.png',
    'assets/logo/logo5.png',

  ];

  logosBottom = [
    'assets/logo/logo5.png',
    'assets/logo/logo6.png',
    'assets/logo/logo7.png',
    'assets/logo/logo8.png',
    'assets/logo/logo1.png',
  ];

  ngOnInit(): void {
    this.getTotalCount();
  }

  getTotalCount() {
    this.web.getData('getTotalCount').then((response) => {
      console.log("response", response);

      let formattedCount: string; // Declare the variable

      if (response == undefined) {
        formattedCount = '0'; // Assign to formattedCount, not this.formattedCount
      } else if (response >= 1000 * 1000 * 1000) {
        formattedCount = (response / (1000 * 1000 * 1000)).toFixed(1) + '+ Billions';
      } else if (response >= 1000 * 1000) {
        formattedCount = (response / (1000 * 1000)).toFixed(1) + '+ Million';
      } else if (response >= 1000) {
        formattedCount = (response / 1000).toFixed(1) + '+ Thousand';
      } else {
        formattedCount = response.toString();
      }

      this.formattedCount = formattedCount;
      this.countService.setTotalCount(formattedCount);

      // ✅ Show UI now
      setTimeout(() => {
        this.contentLoaded = true;
      }, 500);
    }).catch(error => {
      console.error('Error fetching total count:', error);
      this.countService.setTotalCount('0');
      this.contentLoaded = true;
    });
  }
}
