import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SeoLandingPageComponent } from './pages/landing/seo-landing-page.component';

/**
 * Single child route — subcategory paths are resolved by app-level ``usa`` matchers
 * (e.g. ``/usa/arkansas/home-services/roofing``), not ``:subcategory`` here.
 * A nested ``:subcategory`` route caused ``/usa/arkansas/home-services`` to be read as
 * category=arkansas + subcategory=home-services.
 */
const routes: Routes = [
  {
    path: '',
    component: SeoLandingPageComponent,
    data: {
      seoLandingDepth: 'category',
      canonicalPattern: 'self',
      title: 'Local business listings | Global Business Pages',
    },
    runGuardsAndResolvers: 'always',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SeoLandingRoutingModule {}
