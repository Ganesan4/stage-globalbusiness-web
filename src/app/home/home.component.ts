import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { Meta, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../services/search.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { CountService } from '../services/count.service'; 
import { WhyChooseUsComponent } from '../home/sections/why-choose-us/why-choose-us.component';
import { BenefitsComponent } from './sections/benefits/benefits.component';
import { HowItWorksComponent } from './sections/how-it-works/how-it-works.component';
import { SearchBarComponent } from './sections/search-bar/search-bar.component';
import { TestimonialComponent } from './sections/testimonial/testimonial.component';
import { FaqComponent } from './sections/faq/faq.component';
import { HowCustomersFindComponent } from './sections/how-customers-find/how-customers-find.component';

Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-global-business',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, SlickCarouselModule, FormsModule, SearchBarComponent, WhyChooseUsComponent, BenefitsComponent, HowItWorksComponent, FaqComponent, TestimonialComponent, HowCustomersFindComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  searchQuery: string = ''; 
  searchResults: any[] = []; 
  isDropdownOpen: boolean = false;
  totalCount: string = '0';
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;
  private countSubscription: Subscription = new Subscription();

  constructor(
    private searchService: SearchService,
    private router: Router,
    private meta: Meta,
    private titleService: Title,
    private countService: CountService
  ) {
    this.initializeSearchSubscription();
  }

  ngOnInit(): void {
    this.countService.initializeFromStorage();
    this.countSubscription.add(
      this.countService.totalCount$.subscribe(count => {
        this.totalCount = count;
        this.updateMetaTags();
      })
    );
  }

  updateMetaTags(): void {
    // console.log('this.totalCount===', this.totalCount);
     const title = `AI-Powered, SEO-Indexed Business Listings | Global Business Pages`;
    // const title = `Global Business Directory | Local Yellow Pages for All Cities Worldwide`;
    // const title = `List Your Business Worldwide In Global Business Page`;
    this.titleService.setTitle(title);
const description = `List your business once and get AI-powered, SEO-indexed visibility locally, nationally, and globally across 150+ countries — for just $1.30 per year.`;

    // const description = `Get found locally and globally with the world’s most affordable business directory. List your business for $1.30/year and reach customers in 150+ countries.`;
    // const description = `Total Listings: ${this.totalCount}; Join Global Business Pages to list and promote your business worldwide. Easy, affortable, and trusted by businesses across the globle. Get started today!.`;
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
          console.log('dataaaa', data);
          this.searchResults = data?.displayed_data ?? []; 
          console.log('this.searchResults length', this.searchResults.length);
          this.isDropdownOpen = this.searchResults.length >= 0;
        },
        error: (error) => {
          console.error('Error fetching search results:', error);
        }
      });
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      this.searchSubject.next(this.searchQuery); 
    } else {
      this.searchResults = [];
      this.isDropdownOpen = false;
    }
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
    const formattedQuery = encodeURIComponent(result).replace(/[!'()*-+_]/g, escape).toLowerCase();
    console.log('formattedQuery', formattedQuery);
    this.isDropdownOpen = false;

    this.router.navigate([`/${formattedQuery}`], {
      state: { displayData: result }
    });

  }

}
