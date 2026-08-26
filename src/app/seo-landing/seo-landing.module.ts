import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SlickCarouselModule } from 'ngx-slick-carousel';

import { SeoBreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { InternalLinksComponent } from './components/internal-links/internal-links.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { SeoLandingPageComponent } from './pages/landing/seo-landing-page.component';
import { SeoLandingRoutingModule } from './seo-landing-routing.module';
import { SeoLandingService } from './services/seo-landing.service';
import { SeoMetaService } from './services/seo-meta.service';

@NgModule({
  declarations: [
    SeoLandingPageComponent,
    SeoBreadcrumbComponent,
    InternalLinksComponent,
    PaginationComponent,
  ],
  imports: [CommonModule, HttpClientModule, SeoLandingRoutingModule, SlickCarouselModule],
  providers: [SeoLandingService, SeoMetaService],
})
export class SeoLandingModule {}
