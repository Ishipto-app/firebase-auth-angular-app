import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {provideFirebaseApp, initializeApp} from '@angular/fire/app';
import {provideAuth, getAuth} from '@angular/fire/auth';
import {provideFirestore, getFirestore} from '@angular/fire/firestore';

import {routes} from './app.routes';

const firebaseConfig = {
  apiKey: typeof FIREBASE_API_KEY !== 'undefined' ? FIREBASE_API_KEY : '',
  authDomain: typeof FIREBASE_AUTH_DOMAIN !== 'undefined' ? FIREBASE_AUTH_DOMAIN : '',
  projectId: typeof FIREBASE_PROJECT_ID !== 'undefined' ? FIREBASE_PROJECT_ID : '',
  storageBucket: typeof FIREBASE_STORAGE_BUCKET !== 'undefined' ? FIREBASE_STORAGE_BUCKET : '',
  messagingSenderId: typeof FIREBASE_MESSAGING_SENDER_ID !== 'undefined' ? FIREBASE_MESSAGING_SENDER_ID : '',
  appId: typeof FIREBASE_APP_ID !== 'undefined' ? FIREBASE_APP_ID : '',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    ...(firebaseConfig.apiKey ? [
      provideFirebaseApp(() => initializeApp(firebaseConfig)),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore()),
    ] : []),
  ],
};
