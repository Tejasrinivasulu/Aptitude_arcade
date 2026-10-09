import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADMIN_EMAIL = 'admin@aptitudearcade.com';
const ADMIN_PASSWORD = 'arcade@123';

function loadEnv() {
  const envPath = resolve(__dirname, '../.env');
  const lines = readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
}

async function run() {
  const config = loadEnv();
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);

  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('Admin logged in.');

  console.log('\n--- Checking results collection ---');
  const resSnap = await getDocs(query(collection(db, 'results'), limit(5)));
  resSnap.forEach((d) => {
    const data = d.data();
    console.log(`Doc ID: ${d.id}`);
    console.log('  Keys present:', Object.keys(data));
    console.log('  startedAt:', data.startedAt);
    console.log('  submittedAt:', data.submittedAt);
    console.log('  timeTaken:', data.timeTaken || data.timeTakenSeconds || data.durationSeconds);
  });

  console.log('\n--- Checking exam_sessions collection ---');
  const sessSnap = await getDocs(query(collection(db, 'exam_sessions'), limit(5)));
  console.log(`Found ${sessSnap.size} sessions.`);
  sessSnap.forEach((d) => {
    const data = d.data();
    console.log(`Session for ${d.id}:`, Object.keys(data));
    console.log('  startedAt:', data.startedAt, 'status:', data.status, 'testKey:', data.testKey);
  });
}

run().catch((e) => console.error('Error:', e));
