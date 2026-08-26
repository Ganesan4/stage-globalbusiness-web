// import { Routes } from '@angular/router';
// import { HomeComponent } from './home/home.component';
// import { RegisterComponent } from './register/register.component';
// import { LoginComponent } from './login/login.component';
// import { TermsandconditionsComponent } from './termsandconditions/termsandconditions.component'
// import { DashboardComponent } from './dashboard/dashboard.component';
// import { BannermanagementComponent } from './bannermanagement/bannermanagement.component';
// import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
// import { MyaccountComponent } from './myaccount/myaccount.component';
// import { AllbusinessComponent } from './allbusiness/allbusiness.component';
// import { FeedbackComponent } from './feedback/feedback.component';
// import { AllreviewsComponent } from './allreviews/allreviews.component';
// import { UseraccessComponent } from './useraccess/useraccess.component';
// import { AuthGuard } from './auth.guard';
// import { ChangePasswordComponent } from './change-password/change-password.component';
// import { BusinessListingComponent } from './business-listing/business-listing.component';
// import { ListingComponent } from './listing/listing.component';
// import { AllListingsComponent } from './all-listings/all-listings.component';
// import { ListingdetailsComponent } from './listingdetails/listingdetails.component';
// import { GallerymanagementComponent } from './gallerymanagement/gallerymanagement.component';
// import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
// import { AboutUsComponent } from './about-us/about-us.component';
// import { GpdrComponent } from './gpdr/gpdr.component';
// import { UnsubscribeComponent } from './unsubscribe/unsubscribe.component';

// export const routes: Routes = [
//     { path: '', component: HomeComponent },
//     { path: 'register', component: RegisterComponent },
//     { path: 'login', component: LoginComponent },
//     { path: 'termsandconditions', component: TermsandconditionsComponent },
//     { path: 'privacy', component: PrivacyPolicyComponent},
//     { path: 'about-us', component: AboutUsComponent},
//     { path: 'gdpr-compliance', component:GpdrComponent},
//     { path: 'unsubscribe', component:UnsubscribeComponent},

//     // First search bar result page..
//     { path: 'business-directory/:category', component: AllListingsComponent},
//     { path: 'business-directory/:country/:category', component: AllListingsComponent},
//     { path: 'business-directory/:country/:state/:category', component: AllListingsComponent},
//     { path: 'business-directory/:country/:state/:city/:category', component: AllListingsComponent},
//     { path: 'business-directory/:country/:state/:city/:zip/:category', component: AllListingsComponent},

//     // Listing Table user Details Page
//     // { path: 'business-directory/:country', component: ListingdetailsComponent},
//     // { path: 'business-directory/:country/:state/:companyName', component: ListingdetailsComponent},
//     // { path: 'business-directory/:country/:state/:city/:companyName', component: ListingdetailsComponent},
//     // { path: 'business-directory/:country/:state/:city/:zip/:companyName', component: ListingdetailsComponent},
//     { path: 'business-directory/:country/:state/:city/:zip/:companyName/:businessName', component: ListingdetailsComponent},
//     { path: 'business-directory/:country/:state/:city/:zip/:companyName/:sic_description/:businessName', component: ListingdetailsComponent},
//     { path: 'business-directory/:country/:state/:city/:zip/:companyName/:sic_description/:businessName/:id', component: ListingdetailsComponent},

//     // registeration table user Details Page
//     { path: 'business-directory-registered/:country', component: ListingComponent},
//     { path: 'business-directory-registered/:country/:state/:companyName', component: ListingComponent},
//     { path: 'business-directory-registered/:country/:state/:city/:companyName', component: ListingComponent},
//     { path: 'business-directory-registered/:country/:state/:city/:zip/:companyName', component: ListingComponent},
//     { path: 'business-directory-registered/:country/:state/:city/:zip/:companyName/:id', component: ListingComponent},

//     { 
//       path: 'account',
//       component: DashboardLayoutComponent,
//       canActivate: [AuthGuard], 
//       children: [
//         { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
//         { path: 'myprofile', component: MyaccountComponent, canActivate: [AuthGuard] },
//         { path: 'allbusiness', component: AllbusinessComponent, canActivate: [AuthGuard] },
//         { path: 'businesslisting', component: BusinessListingComponent, canActivate: [AuthGuard] },
//         { path: 'useraccess', component: UseraccessComponent, canActivate: [AuthGuard] },
//         { path: 'feedback', component: FeedbackComponent, canActivate: [AuthGuard] },
//         { path: 'allreviews', component: AllreviewsComponent, canActivate: [AuthGuard] },
//         { path: 'bannermanagement', component: BannermanagementComponent, canActivate: [AuthGuard] },
//         { path: 'changepassword', component: ChangePasswordComponent, canActivate: [AuthGuard] },
//         { path: 'gallerymanagement', component: GallerymanagementComponent, canActivate: [AuthGuard] },
//       ]
//     },
//     { path: ':category', component: AllListingsComponent },
//     // { path: ':country', component: HomeComponent },
//     // { path: ':country/:state', component: HomeComponent },
//     // { path: ':country/:state/:city', component: HomeComponent },
//     // { path: ':country/:state/:city/:zip', component: HomeComponent },
//     // { path: ':category', component: AllListingsComponent },
//   ];





import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { TermsandconditionsComponent } from './termsandconditions/termsandconditions.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BannermanagementComponent } from './bannermanagement/bannermanagement.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { MyaccountComponent } from './myaccount/myaccount.component';
import { AllbusinessComponent } from './allbusiness/allbusiness.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { AllreviewsComponent } from './allreviews/allreviews.component';
import { UseraccessComponent } from './useraccess/useraccess.component';
import { AuthGuard } from './auth.guard';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { BusinessListingComponent } from './business-listing/business-listing.component';
import { ListingComponent } from './listing/listing.component';
import { AllListingsComponent } from './all-listings/all-listings.component';
import { ListingdetailsComponent } from './listingdetails/listingdetails.component';
import { GallerymanagementComponent } from './gallerymanagement/gallerymanagement.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { GpdrComponent } from './gpdr/gpdr.component';
import { UnsubscribeComponent } from './unsubscribe/unsubscribe.component';
import { LocationListingComponent } from './location-listing/location-listing.component';
import { UpgradeComponent } from './upgrade/upgrade.component';
import {
  matchUsaCountryCategory,
  matchUsaStateCityCategory,
  matchUsaStateCityCategorySubcategory,
  matchUsaStateCategorySubcategory,
  matchUsaTwoSegments,
} from './seo-landing/usa-seo-url-matchers';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AffiliateDashboardComponent } from './affiliate/affiliate-dashboard/affiliate-dashboard.component';
import { SlugRouterComponent } from './slug-router/slug-router.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
    data: { title: 'Global Business Pages | Find Local Businesses' },
  },

  { path: 'discover', redirectTo: '/business-directory/us', pathMatch: 'full' },

  { path: 'register', component: RegisterComponent, data: { title: 'Register | Global Business Pages' } },
  { path: 'login', component: LoginComponent, data: { title: 'Sign in | Global Business Pages' } },
  { path: 'forgot-password', component: ForgotPasswordComponent, data: { title: 'Forgot password | Global Business Pages' } },
  { path: 'reset-password', component: ResetPasswordComponent, data: { title: 'Reset password | Global Business Pages' } },

  { path: 'account/affiliate-dashboard', component: AffiliateDashboardComponent, data: { title: 'Affiliate dashboard | Global Business Pages' } },

  { path: 'termsandconditions', component: TermsandconditionsComponent, data: { title: 'Terms of Use | Global Business Pages' } },
  { path: 'privacy', component: PrivacyPolicyComponent, data: { title: 'Privacy Policy | Global Business Pages' } },
  { path: 'about-us', component: AboutUsComponent, data: { title: 'About Us | Global Business Pages' } },
  { path: 'gdpr-compliance', component: GpdrComponent, data: { title: 'GDPR Compliance | Global Business Pages' } },
  { path: 'unsubscribe', component: UnsubscribeComponent, data: { title: 'Unsubscribe | Global Business Pages' } },

  { path: 'business-directory/:category', component: AllListingsComponent },
  { path: 'business-directory/:country/:category', component: AllListingsComponent },
  { path: 'business-directory/:country/:state/:category', component: AllListingsComponent },
  { path: 'business-directory/:country/:state/:city/:category', component: AllListingsComponent },
  { path: 'business-directory/:country/:state/:city/:zip/:category', component: AllListingsComponent },

  { path: 'business-directory/:country/:state/:city/:zip/:industry/:businessName', component: ListingdetailsComponent },
  { path: 'business-directory/:country/:state/:city/:zip/:industry/:sic_description/:businessName', component: ListingdetailsComponent },
  { path: 'business-directory/:country/:state/:city/:zip/:industry/:sic_description/:businessName/:id', component: ListingdetailsComponent },

  { path: 'business-directory-registered/:country', component: ListingComponent },
  { path: 'business-directory-registered/:country/:state/:companyName', component: ListingComponent },
  { path: 'business-directory-registered/:country/:state/:city/:companyName', component: ListingComponent },
  { path: 'business-directory-registered/:country/:state/:city/:zip/:companyName', component: ListingComponent },
  { path: 'business-directory-registered/:country/:state/:city/:zip/:companyName/:id', component: ListingComponent },
  
  
  { path: 'business/:category', component: LocationListingComponent },
  { path: 'business/:country/:category', component: LocationListingComponent },
  { path: 'business/:country/:state/:category', component: LocationListingComponent },
  { path: 'business/:country/:state/:city/:category', component: LocationListingComponent },
  { path: 'business/:country/:state/:city/:zip/:category', component: LocationListingComponent },

  { path: 'upgrade', component: UpgradeComponent, data: { title: 'Upgrade | Global Business Pages' } },

  // USA SEO landing — all matchers are children of ``usa`` (segments exclude the ``usa`` prefix).
  {
    path: 'usa',
    children: [
      {
        matcher: matchUsaStateCityCategorySubcategory,
        loadChildren: () =>
          import('./seo-landing/seo-landing.module').then((m) => m.SeoLandingModule),
        data: {
          title: 'Local business listings | Global Business Pages',
          seoGeoDepth: 'city-subcategory',
        },
      },
      {
        matcher: matchUsaStateCityCategory,
        loadChildren: () =>
          import('./seo-landing/seo-landing.module').then((m) => m.SeoLandingModule),
        data: { title: 'Local business listings | Global Business Pages', seoGeoDepth: 'city' },
      },
      {
        matcher: matchUsaStateCategorySubcategory,
        loadChildren: () =>
          import('./seo-landing/seo-landing.module').then((m) => m.SeoLandingModule),
        data: {
          title: 'Local business listings | Global Business Pages',
          seoGeoDepth: 'state-subcategory',
        },
      },
      {
        matcher: matchUsaTwoSegments,
        loadChildren: () =>
          import('./seo-landing/seo-landing.module').then((m) => m.SeoLandingModule),
        data: {
          title: 'Local business listings | Global Business Pages',
          seoGeoDepth: 'state-or-country-subcategory',
        },
      },
      {
        matcher: matchUsaCountryCategory,
        loadChildren: () =>
          import('./seo-landing/seo-landing.module').then((m) => m.SeoLandingModule),
        data: { title: 'Local business listings | Global Business Pages', seoGeoDepth: 'country' },
      },
    ],
  },

  {
    path: 'account',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'myprofile', component: MyaccountComponent },
      { path: 'allbusiness', component: AllbusinessComponent },
      { path: 'businesslisting', component: BusinessListingComponent },
      { path: 'useraccess', component: UseraccessComponent },
      { path: 'feedback', component: FeedbackComponent },
      { path: 'allreviews', component: AllreviewsComponent },
      { path: 'bannermanagement', component: BannermanagementComponent },
      { path: 'changepassword', component: ChangePasswordComponent },
      { path: 'gallerymanagement', component: GallerymanagementComponent },
    ],
  },

  { path: ':categorySlug/:citySlug/:businessSlug', component: SlugRouterComponent },
  { path: ':category', component: AllListingsComponent },

  { path: '**', redirectTo: '', pathMatch: 'full' },
];
