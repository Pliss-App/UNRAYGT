// src/app/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { environment } from 'src/environments/environment';

const app = initializeApp(environment.firebase);
const auth = getAuth(app);

export { auth };
