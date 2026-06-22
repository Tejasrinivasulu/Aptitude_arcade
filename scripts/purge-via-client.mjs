/**
 * Purge all student/operational Firestore data using admin login (no service account).
 * Usage: node scripts/purge-via-client.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADMIN_EMAIL = 'admin@aptitudearcade.com';
const ADMIN_PASSWORD = 'arcade@123';

const COLLECTIONS = [
  'results',
  'exam_results',
  'exam_sessions',
  'student_progress',
  'help_requests',
  'system_logs',
  'metrics',
];

function loadEnv() {
  const envPath = resolve(__dirname, '../.env');
  const lines = readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
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

function isProtectedUser(data = {}) {
  if (data.role === 'admin') return true;
  if (String(data.email || '').toLowerCase() === ADMIN_EMAIL) return true;
  return false;
}

async function deleteCollection(db, name) {
  const snap = await getDocs(collection(db, name));
  const refs = snap.docs.map((d) => d.ref);
  for (let i = 0; i < refs.length; i += 500) {
    const batch = writeBatch(db);
    refs.slice(i, i + 500).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
  return refs.length;
}

async function main() {
  const firebaseConfig = loadEnv();
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('Signing in as admin…');
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('Authenticated.\n');

  const stats = {};

  for (const name of COLLECTIONS) {
    process.stdout.write(`Deleting ${name}… `);
    try {
      stats[name] = await deleteCollection(db, name);
      console.log(`${stats[name]} docs`);
    } catch (err) {
      console.log(`FAILED (${err.message})`);
      stats[name] = `error: ${err.message}`;
    }
  }

  process.stdout.write('Deleting student profiles… ');
  const usersSnap = await getDocs(collection(db, 'users'));
  const studentRefs = usersSnap.docs
    .filter((d) => !isProtectedUser(d.data()))
    .map((d) => d.ref);

  for (let i = 0; i < studentRefs.length; i += 500) {
    const batch = writeBatch(db);
    studentRefs.slice(i, i + 500).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
  stats.users = studentRefs.length;
  console.log(`${studentRefs.length} docs`);

  console.log('\nPurge complete (Firestore). Admin account kept.');
  console.log('Note: Firebase Auth student accounts still exist — they cannot log in without a profile.');
  console.log(JSON.stringify(stats, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error('Purge failed:', err.message);
  if (err.code === 'permission-denied') {
    console.error('Deploy updated firestore.rules first, then retry.');
  }
  process.exit(1);
});
