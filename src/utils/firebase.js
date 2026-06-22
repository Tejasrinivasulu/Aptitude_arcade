import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const DEFAULT_PROJECT_ID = 'aptitudearcade';

const localConfigModules = import.meta.glob('./firebase.local.config.js', { eager: true });
const localConfig = Object.values(localConfigModules)[0]?.default ?? {};

function envOrLocal(envKey, localKey, fallback = '') {
  const fromEnv = import.meta.env[envKey];
  if (fromEnv && fromEnv !== 'YOUR_API_KEY') return fromEnv;
  const fromLocal = localConfig[localKey];
  if (fromLocal && fromLocal !== 'PASTE_YOUR_API_KEY_HERE') return fromLocal;
  return fallback;
}

const projectId = envOrLocal('VITE_FIREBASE_PROJECT_ID', 'projectId', DEFAULT_PROJECT_ID);

/**
 * Firebase configuration.
 * Values come from Vite env vars (.env / Vercel) or firebase.local.config.js for local dev.
 */
const firebaseConfig = {
  apiKey: envOrLocal('VITE_FIREBASE_API_KEY', 'apiKey'),
  authDomain: envOrLocal('VITE_FIREBASE_AUTH_DOMAIN', 'authDomain', `${projectId}.firebaseapp.com`),
  projectId,
  storageBucket: envOrLocal(
    'VITE_FIREBASE_STORAGE_BUCKET',
    'storageBucket',
    `${projectId}.firebasestorage.app`
  ),
  messagingSenderId: envOrLocal('VITE_FIREBASE_MESSAGING_SENDER_ID', 'messagingSenderId'),
  appId: envOrLocal('VITE_FIREBASE_APP_ID', 'appId'),
  measurementId: envOrLocal('VITE_FIREBASE_MEASUREMENT_ID', 'measurementId'),
};

/**
 * A project is considered "connected" when an API key AND a project id are
 * present. We treat the literal "YOUR_API_KEY" placeholder as "not configured"
 * so the demo build doesn't crash.
 */
export function isFirebaseReady() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
      firebaseConfig.apiKey !== 'PASTE_YOUR_API_KEY_HERE' &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

export function getFirebaseSetupHint() {
  return (
    'Add VITE_FIREBASE_* to .env (run npm run setup:firebase) or copy ' +
    'src/firebase.local.config.js.example to src/firebase.local.config.js. ' +
    'On Vercel, set the same vars under Project → Settings → Environment Variables, then redeploy.'
  );
}

let app = null;
let auth = null;
let db = null;

if (isFirebaseReady()) {
  // Use getApps() so HMR in Vite doesn't double-initialize.
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  // Analytics is intentionally deferred — it crashes on measurementId-less
  // projects and isn't needed for auth/data flow.
} else {
  // eslint-disable-next-line no-console
  console.warn(
    '⚠️ Firebase not configured (missing VITE_FIREBASE_*). ' +
      getFirebaseSetupHint()
  );
}

export { app, auth, db };
