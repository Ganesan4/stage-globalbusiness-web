import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideNgxStripe } from 'ngx-stripe';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

bootstrapApplication(AppComponent, {
  ...appConfig, 
  providers: [
    ...appConfig.providers, 
    provideNgxStripe('pk_live_51IGzLJFzZPG6EEhhAIP83eLjT6SAtAY12ysHn7ZxcCpKAG6FfZzSqYrB9N3wCHOWsBXY0W4FDy1GUDeHZZWIw7Q00MGZDpHUG'), provideAnimationsAsync()
  ]
}).catch((err) => console.error(err));