import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const lines = readFileSync(resolve(__dirname, '../.env'), 'utf8').split('\n');
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

  await signInWithEmailAndPassword(auth, 'admin@aptitudearcade.com', 'arcade@123');
  const snap = await getDocs(query(collection(db, 'results'), where('rollNumber', '==', '24102A040430')));
  console.log(`Jinka results found: ${snap.size}`);
  const results = [];
  snap.forEach((d) => {
    results.push(d.data());
  });
  results.sort((a, b) => Number(a.testKey) - Number(b.testKey));
  results.forEach((r) => {
    console.log(`Day ${r.testKey}: ${r.score}/${r.total} (${r.percentage}%) | Submitted: ${r.submittedAt} | submitReason: ${r.submitReason || 'manual'}`);
  });
}

run().catch(console.error);
