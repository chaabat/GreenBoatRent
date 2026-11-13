import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getFirestore as getFirestoreLite } from 'firebase/firestore/lite';
import { getAuth } from 'firebase/auth';
import { environment } from '../../environments/environment';

export const firebaseApp = initializeApp(environment.firebase);

/** Full SDK – only for live lists (admin reservations) */
export const db = initializeFirestore(firebaseApp, {
  ignoreUndefinedProperties: true,
  experimentalAutoDetectLongPolling: true
});

/** Lite SDK – simple HTTPS requests for reads/writes (more robust, clear errors) */
export const dbLite = getFirestoreLite(firebaseApp);

export const auth = getAuth(firebaseApp);
