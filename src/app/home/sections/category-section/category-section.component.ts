import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

import { WebService } from '../../../services/web.service';
import { httpGetWithSeo404Fallback } from '../../../seo-landing/seo-http-404-retry';
import { seoPublicApiRoot } from '../../../seo-landing/seo-public-api-root';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { environment } from '../../../../environments/environment';
export interface Category {
  id: string;
  label: string;
  icon: string;
  iconUrl?: string | null;
  isActive?: boolean;
}

@Component({
  selector: 'app-category-section',
  standalone: true,
  imports: [CommonModule,SlickCarouselModule],
  templateUrl: './category-section.component.html',
  styleUrl: './category-section.component.scss'
})
export class CategorySectionComponent implements OnInit, OnChanges {
@Output() categorySelected = new EventEmitter<string>();
  @Input() locationData: any = {
    location: '',
    nearbyCities: [],
    category: ''
  };

  categories: Category[] = [];

  city: string = '';
  state: string = '';
  country: string = '';
  category: string = '';
  nearbyCities: string[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
slideConfig = {
  slidesToShow: 5,
  slidesToScroll: 2,
  infinite: true,
  arrows: true,
  dots: false,
  autoplay: true,

  speed: 1800,            
  autoplaySpeed: 2500,   
  cssEase: 'ease-in-out',
  pauseOnHover: true,   

  responsive: [
    { breakpoint: 1280, settings: { slidesToShow: 4, slidesToScroll: 2 } },
    { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 2 } },
    { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2 } },
    { breakpoint: 640, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } }
  ]
};

  /**
   * Carousel fallback when `GET /api/seo/categories` fails. Slugs MUST match `public.seo_category.slug`
   * (same as Postgres seed) so URLs and Elasticsearch `category_slug` filters stay aligned.
   * Loose substring matching (e.g. `food*` for all categories) would overlap and return wrong mixes.
   */
  private readonly STATIC_SEO_CATEGORIES_FALLBACK: ReadonlyArray<{ slug: string; label: string }> = [
    { slug: 'restaurants-food', label: 'Restaurants & Food' },
    { slug: 'health-medical', label: 'Health & Medical' },
    { slug: 'home-services', label: 'Home Services' },
    { slug: 'shopping-retail', label: 'Shopping & Retail' },
    { slug: 'beauty-personal-care', label: 'Beauty & Personal Care' },
    { slug: 'automotive', label: 'Automotive' },
    { slug: 'financial-services', label: 'Financial Services' },
    { slug: 'legal-services', label: 'Legal Services' },
    { slug: 'professional-services', label: 'Professional Services' },
    { slug: 'fitness-wellness', label: 'Fitness & Wellness' },
    { slug: 'education-training', label: 'Education & Training' },
    { slug: 'real-estate', label: 'Real Estate' },
    { slug: 'childcare-family', label: 'Childcare & Family' },
    { slug: 'pet-services', label: 'Pet Services' },
    { slug: 'travel-hospitality', label: 'Travel & Hospitality' },
    { slug: 'technology-services', label: 'Technology Services' },
    { slug: 'green-sustainable', label: 'Green & Sustainable' },
    { slug: 'events-entertainment', label: 'Events & Entertainment' },
    { slug: 'logistics-delivery', label: 'Logistics & Delivery' },
    { slug: 'specialty-services', label: 'Specialty Services' },
  ];

  /** Icons keyed by seeded category display names (fallback + API consistency). */
  private readonly seoCategoryLabelIcons: Record<string, string> = {
    'Restaurants & Food': 'fa-solid fa-utensils',
    'Health & Medical': 'fa-solid fa-heart-pulse',
    'Home Services': 'fa-solid fa-home',
    'Shopping & Retail': 'fa-solid fa-store',
    'Beauty & Personal Care': 'fa-solid fa-spa',
    Automotive: 'fa-solid fa-car',
    'Financial Services': 'fa-solid fa-coins',
    'Legal Services': 'fa-solid fa-scale-balanced',
    'Professional Services': 'fa-solid fa-briefcase',
    'Fitness & Wellness': 'fa-solid fa-dumbbell',
    'Education & Training': 'fa-solid fa-graduation-cap',
    'Real Estate': 'fa-solid fa-building',
    'Childcare & Family': 'fa-solid fa-users',
    'Pet Services': 'fa-solid fa-paw',
    'Travel & Hospitality': 'fa-solid fa-hotel',
    'Technology Services': 'fa-solid fa-laptop-code',
    'Green & Sustainable': 'fa-solid fa-leaf',
    'Events & Entertainment': 'fa-solid fa-film',
    'Logistics & Delivery': 'fa-solid fa-truck-fast',
    'Specialty Services': 'fa-solid fa-star',
  };

  // ---------- KEYWORD FALLBACK when label has no mapped icon ---
  private readonly iconMap: Record<string, string> = {
    seo: 'fa-solid fa-chart-line',
    marketing: 'fa-solid fa-bullhorn',
    business: 'fa-solid fa-briefcase',
    hotel: 'fa-solid fa-hotel',
    hotels: 'fa-solid fa-hotel',
    motel: 'fa-solid fa-bed',
    lodging: 'fa-solid fa-bed',
    sport: 'fa-solid fa-football',
    sports: 'fa-solid fa-football',
    recreation: 'fa-solid fa-person-hiking',
    recreational: 'fa-solid fa-person-hiking',
    amusement: 'fa-solid fa-gamepad',
    entertainment: 'fa-solid fa-gamepad',
    club: 'fa-solid fa-people-group',
    food: 'fa-solid fa-utensils',
    restaurant: 'fa-solid fa-utensils',
    doctor: 'fa-solid fa-user-doctor',
    health: 'fa-solid fa-heart-pulse',
    legal: 'fa-solid fa-scale-balanced',
    default: 'fa-solid fa-layer-group'
  };

  constructor(
    private web: WebService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.hydrateCategoriesFromApi();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['locationData'] && this.locationData) {
      this.parseLocation();
      this.category = this.locationData.category || '';
    }

    if (this.city && this.state) {
      this.getnearbycities();
    }
  }

  // ---------- BUILD STATIC CATEGORIES ----------
  private initializeStaticCategories(): void {
    this.categories = this.STATIC_SEO_CATEGORIES_FALLBACK.map((row, index) => ({
      id: row.slug,
      label: this.formatLabel(row.label),
      icon: this.getExactIcon(row.label),
      iconUrl: null,
      isActive: index === 0,
    }));
  }

  private hydrateCategoriesFromApi(): void {
    const catalogUrl = `${seoPublicApiRoot(environment.base_url, false)}categories`;

    httpGetWithSeo404Fallback<
      { status?: boolean; data?: unknown; message?: string }
    >(this.http, catalogUrl)
      .pipe(
        timeout(5000),
        catchError(() => of(null))
      )
      .subscribe((response) => {
        const rows =
          response && typeof response === 'object' && response.status !== false && Array.isArray(response.data)
            ? (response.data as unknown[])
            : [];
        if (!rows.length) {
          this.initializeStaticCategories();
          return;
        }
        this.categories = this.mapRemoteTaxonomy(rows as Array<Record<string, any>>);
      });
  }

  private mapRemoteTaxonomy(rows: Array<Record<string, any>>): Category[] {
    return rows.map((node, index) => {
      const nodeName = (node['name'] as string) || '';
      const nodeSlug = (node['slug'] as string) || '';
      const slug = `${nodeSlug || this.generateId(nodeName)}`.trim().toLowerCase();
      const label = this.formatLabel(nodeName || slug);
      const iconCssRaw =
        typeof node['icon_css_class'] === 'string' ? (node['icon_css_class'] as string).trim() : '';
      const iconUrlRaw = typeof node['icon_url'] === 'string' ? (node['icon_url'] as string).trim() : '';
      return {
        id: slug,
        label,
        icon: iconCssRaw || this.getExactIcon(label),
        iconUrl: iconUrlRaw || null,
        isActive: index === 0,
      };
    });
  }

  private slugSegment(raw: string, fallback?: string): string {
    const value = (raw && raw.trim()) || (fallback && fallback.trim()) || '';
    if (!value) {
      return fallback ? this.slugSegment(fallback, '') : '';
    }

    const normalized = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return normalized.length ? normalized : this.slugSegment(fallback || '');
  }

  iconBroken(category: Category, event?: Event): void {
    category.iconUrl = null;
    if (event?.target instanceof HTMLImageElement) {
      event.target.style.visibility = 'hidden';
    }
  }

  // ---------- ICON LOOKUP: exact match -> keyword fallback -> default ----------
  private getExactIcon(label: string): string {
    const mapped = this.seoCategoryLabelIcons[label];
    if (mapped) {
      return mapped;
    }
    return this.getIconByKeyword(label);
  }

  private getIconByKeyword(name: string): string {
    const key = name.toLowerCase();
    for (const mapKey in this.iconMap) {
      if (key.includes(mapKey)) {
        return this.iconMap[mapKey];
      }
    }
    return this.iconMap['default'];
  }

  // ---------- CLICK HANDLER (unchanged) ----------
  // onCategoryClick(category: Category): void {
  //   this.categories.forEach(cat => (cat.isActive = false));
  //   category.isActive = true;
  //   this.category = category.label.toLowerCase();

  //   const route = this.buildLocationRoute();
  //   route.push(category.id);
  //   this.router.navigate(route);
  // }
onCategoryClick(category: Category): void {
  this.categories.forEach((cat) => (cat.isActive = false));
  category.isActive = true;

  this.category = category.label.toLowerCase();
  const slug = `${category.id || ''}`.trim().toLowerCase();
  console.log('Category clicked (taxonomy slug):', slug || category.label);

  this.categorySelected.emit(slug || this.generateId(category.label));
}

  // ---------- LOCATION ROUTE BUILDER (unchanged) ----------
  private buildLocationRoute(): string[] {
    if (!this.city || !this.state || !this.country) {
      return ['US', 'AK', 'RICHARDSON-FORT'];
    }
    const citySlug = this.city.toLowerCase().replace(/\s+/g, '-');
    return [this.country, this.state, citySlug];
  }

  // ---------- PARSING & HELPERS (unchanged) ----------
  private parseLocation(): void {
    if (this.locationData && this.locationData.location) {
      const parts = this.locationData.location.split(' ');
      if (parts.length >= 3) {
        this.country = parts.pop() || '';
        this.state = parts.pop() || '';
        this.city = parts.join(' ');
      } else {
        this.city = this.locationData.location;
        this.state = '';
        this.country = '';
      }
    }
  }

  private generateId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  private formatLabel(name: string): string {
    // Preserve exact spelling (no automatic title‑case)
    return name;
  }

  // ---------- NEARBY CITIES (unchanged) ----------
  get hasNearbyCities(): boolean {
    return this.locationData?.nearbyCities?.length > 0;
  }

  getCityName(cityData: any): string {
    if (typeof cityData === 'string') return cityData;
    if (cityData?.city) return cityData.city;
    if (cityData?.name) return cityData.name;
    return 'Unknown City';
  }

  getCityState(cityData: any): string {
    if (cityData && typeof cityData === 'object' && cityData.state) {
      return cityData.state;
    }
    return this.state;
  }

  get categoryName(): string {
    return this.category || 'businesses';
  }

  getnearbycities(): void {
    if (!this.city || !this.state) return;
    const url = `nearbycities?city=${encodeURIComponent(this.city)}&state=${encodeURIComponent(this.state)}&limit=5`;
    this.isLoading = true;
    this.web.getData(url)
      .then((res: any) => {
        this.isLoading = false;
        if (res?.nearby_cities?.length > 0) {
          this.nearbyCities = res.nearby_cities;
        } else if (res?.displayed_data?.length > 0) {
          this.nearbyCities = res.displayed_data;
        } else {
          this.errorMessage = 'No nearby cities found';
          this.nearbyCities = [];
        }
        this.locationData.nearbyCities = this.nearbyCities;
      })
      .catch(err => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load nearby cities. Please try again.';
        this.nearbyCities = [];
        this.locationData.nearbyCities = [];
        console.error('Error loading nearby cities:', err);
      });
  }

  navigateToNearbyCity(cityStr: string): void {
    const parts = cityStr.split(',');
    const cityName = parts[0].trim();
    const stateName = parts[1]?.trim() || this.state;
    const activeSlug =
      this.categories.find((c) => c.isActive)?.id ||
      this.categories[0]?.id ||
      'home-services';
    const citySlug = cityName.toLowerCase().replace(/\s+/g, '-');
    const route = [this.country, stateName, citySlug, activeSlug];
    this.router.navigate(route);
  }
}