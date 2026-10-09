import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

const SERIES_START_DATE = '2026-09-28';
function getScheduledDate(offsetDays) {
  const d = new Date(`${SERIES_START_DATE}T00:00:00`);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

// Window bounds: opens day X 10:00 AM, closes day X+1 12:00 PM IST
function getWindowBounds(offsetDays) {
  const day = getScheduledDate(offsetDays);
  const start = new Date(day);
  start.setHours(10, 0, 0, 0); // 10 AM IST (assuming system/local or UTC comparison)
  const end = new Date(day);
  end.setDate(end.getDate() + 1);
  end.setHours(12, 0, 0, 0); // next day 12 PM IST
  return { start, end };
}

async function run() {
  const config = loadEnv();
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('Logging in as admin...');
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('Logged in successfully!');

  console.log('Fetching users and progress...');
  const usersSnap = await getDocs(collection(db, 'users'));
  const progressSnap = await getDocs(collection(db, 'student_progress'));

  const rescheduledMap = {};
  progressSnap.forEach((doc) => {
    const data = doc.data();
    if (data.rescheduledTests) {
      rescheduledMap[doc.id] = data.rescheduledTests;
    }
  });

  const students = [];

  usersSnap.forEach((doc) => {
    const u = doc.data();
    if (u.role === 'admin' || u.email === ADMIN_EMAIL) return;
    if (u.isDemo || u.email?.includes('demo') || u.email?.includes('test')) return;

    const attempted = u.attemptedTests || {};
    const testKeys = Object.keys(attempted).filter((k) => k !== 'finale');
    const totalAttempted = testKeys.length;

    if (totalAttempted === 0) return;

    let totalScore = 0;
    let totalPossible = 0;
    let onTimeCount = 0;
    let advScore = 0;
    let advPossible = 0;

    const testsDetail = {};

    testKeys.forEach((key) => {
      const att = attempted[key];
      const score = Number(att.score) || 0;
      const total = Number(att.total) || 30;
      totalScore += score;
      totalPossible += total;

      const dayNum = Number(key);
      if ([8, 10, 11, 12].includes(dayNum)) {
        advScore += score;
        advPossible += total;
      }

      // Check on-time submission
      if (att.submittedAt) {
        const subTime = new Date(att.submittedAt);
        const { start, end } = getWindowBounds(dayNum - 1);
        // generous margin: within 36 hours of day's start
        const generousEnd = new Date(start.getTime() + 36 * 60 * 60 * 1000);
        if (subTime >= new Date(start.getTime() - 2 * 60 * 60 * 1000) && subTime <= generousEnd) {
          onTimeCount++;
        }
      }

      testsDetail[key] = {
        score,
        total,
        percentage: att.percentage,
        submittedAt: att.submittedAt,
      };
    });

    const reschedules = rescheduledMap[doc.id] || {};
    const rescheduleCount = Object.keys(reschedules).length;

    const avgPercentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    const advPercentage = advPossible > 0 ? Math.round((advScore / advPossible) * 100) : 0;

    students.push({
      id: doc.id,
      name: u.fullName || u.displayName || 'Unknown',
      rollNumber: u.rollNumber || 'N/A',
      email: u.email,
      branch: u.branch || 'N/A',
      totalAttempted,
      onTimeCount,
      totalScore,
      totalPossible,
      avgPercentage,
      advScore,
      advPossible,
      advPercentage,
      rescheduleCount,
      testsDetail,
    });
  });

  // Sort primarily by totalAttempted (desc), then onTimeCount (desc), then avgPercentage (desc)
  students.sort((a, b) => {
    if (b.totalAttempted !== a.totalAttempted) return b.totalAttempted - a.totalAttempted;
    if (b.onTimeCount !== a.onTimeCount) return b.onTimeCount - a.onTimeCount;
    return b.avgPercentage - a.avgPercentage;
  });

  console.log(`\nFound ${students.length} active students with attempts.`);
  writeFileSync(resolve(__dirname, 'consistent-students-output.json'), JSON.stringify(students, null, 2));
  console.log('Saved to scripts/consistent-students-output.json');
}

run().catch((err) => {
  console.error('Error running script:', err);
  process.exit(1);
});
