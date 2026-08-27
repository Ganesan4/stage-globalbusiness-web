// STAGING / TEST only — never points at production API
export const environment = {
  production: false,
  isStaging: true,
  base_url: 'https://api.stage.globalbusinesspages.com/',
  api_url: 'https://api.stage.globalbusinesspages.com/',
  stripePublicKey: 'pk_test_51TLf500WonvsvQsHLc32u32x3SZVj9wHyYGlCzCRaQQx5MDD4lFYw3vtqUecGQDdLW2qp2UdcTnPYIdmnJm9q3hn00LDoMtfTS',
  paypalClientId: 'AQ_WLaUUYGpIZET5U09_Z8klQNqxNeELmY3nOtaaTz6I04k8TgJ9V2HeMer6VR5z0KKdkQdtQ8MKj8wL',
  firebaseConfig: {
    apiKey: "AIzaSyA3SVLjqXfh96pObbhCOtRd7erAGIG6e9I",
    authDomain: "global-business-pages.firebaseapp.com",
    projectId: "global-business-pages",
    storageBucket: "global-business-pages.firebasestorage.app",
    messagingSenderId: "384318191197",
    appId: "1:384318191197:web:a82a7e5402dd334a8dbfb4",
    measurementId: "G-X32PGW1XKM"
  }
};
