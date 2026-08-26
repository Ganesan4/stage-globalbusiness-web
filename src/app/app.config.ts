import { ApplicationConfig } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideToastr } from 'ngx-toastr';
import { provideHttpClient } from '@angular/common/http';

import { GbpTitleStrategy } from './gbp-title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: TitleStrategy, useClass: GbpTitleStrategy },
    provideRouter(routes),
    provideClientHydration(),
    provideToastr(),
    provideHttpClient(),
  ]
};
