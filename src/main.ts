import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
//import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from "firebase/messaging";
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './environments/firebase-config';

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
