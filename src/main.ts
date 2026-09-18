import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideNgxStripe } from 'ngx-stripe';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideToastr } from 'ngx-toastr';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from './environments/environment';

async function resolveStripePublicKey(): Promise<string> {
  const fallback = environment.stripePublicKey;
  try {
    const res = await fetch(`${environment.api_url}stripe-config`);
    if (!res.ok) {
      return fallback;
    }
    const data = await res.json();
    const key = data?.publishable_key;
    if (typeof key === 'string' && key.startsWith('pk_test_')) {
      return key;
    }
  } catch {
    // Use build-time fallback when staging API is unreachable during local dev.
  }
  return fallback;
}

resolveStripePublicKey().then((stripePublicKey) => {
  bootstrapApplication(AppComponent, {
    ...appConfig,
    providers: [
      ...appConfig.providers,
      provideNgxStripe(stripePublicKey),
      provideAnimationsAsync(),
      provideToastr({
        timeOut: 3000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
      }),
      provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore()),
    ]
  }).catch((err) => console.error(err));
});
