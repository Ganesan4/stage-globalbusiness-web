import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { TermsandconditionsComponent } from './termsandconditions/termsandconditions.component'
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

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'termsandconditions', component: TermsandconditionsComponent },
    // { 
    //   path: 'listing/:id/:country/:state/:city/:zip/:category/:businessName', 
    //   component: ListingComponent 
    // },
    // { 
    //   path: 'listing/:id/:country/:state/:city/:zip/:businessName', 
    //   component: ListingComponent 
    // },
    // { 
    //   path: 'listing/:id/:country/:state/:city/:businessName', 
    //   component: ListingComponent 
    // },
    // { 
    //   path: 'listing/:id/:country/:state/:businessName', 
    //   component: ListingComponent 
    // },
    // { 
    //   path: 'listing/:id/:country/:businessName', 
    //   component: ListingComponent 
    // },
    // { 
    //   path: 'listing/:id', 
    //   component: ListingComponent 
    // },
    
    { path: 'business-directory/:country', component: AllListingsComponent},
    { path: 'business-directory/:country/:state', component: AllListingsComponent},
    { path: 'business-directory/:country/:state/:city', component: AllListingsComponent},
    { path: 'business-directory/:country/:state/:city/:zip', component: AllListingsComponent},
    { path: 'business-directory/:country', component: ListingdetailsComponent},
    { path: 'business-directory/:country/:state/:companyName', component: ListingdetailsComponent},
    { path: 'business-directory/:country/:state/:city/:companyName', component: ListingdetailsComponent},
    { path: 'business-directory/:country/:state/:city/:zip/:companyName', component: ListingdetailsComponent},

    { path: 'business-directory-registered/:country', component: ListingComponent},
    { path: 'business-directory-registered/:country/:state/:companyName', component: ListingComponent},
    { path: 'business-directory-registered/:country/:state/:city/:companyName', component: ListingComponent},
    { path: 'business-directory-registered/:country/:state/:city/:zip/:companyName', component: ListingComponent},

    { 
      path: 'account',
      component: DashboardLayoutComponent,
      canActivate: [AuthGuard], 
      children: [
        { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
        { path: 'myprofile', component: MyaccountComponent, canActivate: [AuthGuard] },
        { path: 'allbusiness', component: AllbusinessComponent, canActivate: [AuthGuard] },
        { path: 'businesslisting', component: BusinessListingComponent, canActivate: [AuthGuard] },
        { path: 'useraccess', component: UseraccessComponent, canActivate: [AuthGuard] },
        { path: 'feedback', component: FeedbackComponent, canActivate: [AuthGuard] },
        { path: 'allreviews', component: AllreviewsComponent, canActivate: [AuthGuard] },
        { path: 'bannermanagement', component: BannermanagementComponent, canActivate: [AuthGuard] },
        { path: 'changepassword', component: ChangePasswordComponent, canActivate: [AuthGuard] },
      ]
    },
    { path: ':category', component: AllListingsComponent },
    // { path: ':country', component: HomeComponent },
    // { path: ':country/:state', component: HomeComponent },
    // { path: ':country/:state/:city', component: HomeComponent },
    // { path: ':country/:state/:city/:zip', component: HomeComponent },
    { path: ':category', component: AllListingsComponent },
  ];
