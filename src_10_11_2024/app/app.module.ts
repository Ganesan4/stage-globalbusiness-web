import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule here
import { AppComponent } from './app.component';
import { GooglePayButtonModule } from '@google-pay/button-angular';
import { ListingComponent } from './listing/listing.component';
@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    AppComponent,
    GooglePayButtonModule,
    ListingComponent
  ],
  providers: [],
})
export class AppModule { }
