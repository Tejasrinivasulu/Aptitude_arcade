/**
 * Uploads Day 10 question bank to Firestore (question_banks/10).
 * Usage: node scripts/upload-day10-questions.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

// ── Day 10 Questions (Time, Speed & Distance · 20 MCQ + 5 Fill · 25 min) ───────
const DAY10_BANK = {
  questionBankVersion: 1,
  title: 'Day 10 Assessment',
  topicLabel: 'Time, Speed & Distance',
  durationMinutes: 25,
  questions: [
    {
      id: 1,
      type: 'mcq',
      question: "Jake and Paul each walk 10 km. Jake's speed is 1.5 km/h faster than Paul's speed. Jake reaches the destination 1.5 hours before Paul. What is Jake's speed?",
      options: ['4 km/h', '6 km/h', '8 km/h', '2 km/h'],
      answer: 0,
    },
    {
      id: 2,
      type: 'mcq',
      question: 'A car covers 180 km in 3 hours. What is its speed in m/s?',
      options: ['15 m/s', '16.67 m/s', '18 m/s', '20 m/s'],
      answer: 1,
    },
    {
      id: 3,
      type: 'mcq',
      question: 'In a 500 m race, P and Q have speeds in the ratio 3:4. Q starts the race when P has already covered 140 m. What is the distance between P and Q when P wins the race?',
      options: ['20 m', '40 m', '60 m', '140 m'],
      answer: 0,
    },
    {
      id: 4,
      type: 'mcq',
      question: 'Two trains leave Kanpur for Palwal at 10:00 AM and 10:30 AM. Their speeds are 60 km/h and 75 km/h respectively. After how many kilometres from Kanpur will the two trains meet?',
      options: ['140 km', '145 km', '150 km', '155 km'],
      answer: 2,
    },
    {
      id: 5,
      type: 'mcq',
      question: 'A man covers a certain distance in 6 hours at 40 km/h. What is the distance?',
      options: ['200 km', '220 km', '240 km', '260 km'],
      answer: 2,
    },
    {
      id: 6,
      type: 'mcq',
      question: 'A bus leaves Mumbai at 3 PM. It travels for 1.5 hours at 60 km/h, halts for 30 minutes, and then travels at 50 km/h for the remaining time. It reaches Pune at 6 PM. Find the distance between Mumbai and Pune.',
      options: ['100 km', '110 km', '120 km', '140 km'],
      answer: 3,
    },
    {
      id: 7,
      type: 'mcq',
      question: 'A train 200 m long travels at 72 km/h. It passes another train 300 m long travelling in the same direction in 50 seconds. Find the speed of the second train.',
      options: ['30 km/h', '36 km/h', '40 km/h', '45 km/h'],
      answer: 1,
    },
    {
      id: 8,
      type: 'mcq',
      question: 'A man travels half of a journey at 60 km/h and the other half at 40 km/h. Find his average speed.',
      options: ['45 km/h', '48 km/h', '50 km/h', '52 km/h'],
      answer: 1,
    },
    {
      id: 9,
      type: 'mcq',
      question: 'A tourist covers half of his journey by train at 60 km/h, half of the remainder by bus at 30 km/h and the rest by cycle at 10 km/h. What is his average speed for the entire journey?',
      options: ['36 km/h', '30 km/h', '24 km/h', '18 km/h'],
      answer: 2,
    },
    {
      id: 10,
      type: 'mcq',
      question: 'A vehicle travels from city A to city B at 60 km/h and returns from B to A at 90 km/h. What is the average speed for the entire journey?',
      options: ['72 km/h', '73 km/h', '74 km/h', '75 km/h'],
      answer: 0,
    },
    {
      id: 11,
      type: 'mcq',
      question: 'A person travels 80 km in 6 hours. He travels the first part at 10 km/h and the remaining part at 18 km/h. What percentage of the total distance is travelled at 10 km/h?',
      options: ['28.25%', '37.25%', '43.75%', '50%'],
      answer: 2,
    },
    {
      id: 12,
      type: 'mcq',
      question: 'A train 120 m long runs at 54 km/h. How long will it take to pass a pole?',
      options: ['6 s', '8 s', '10 s', '12 s'],
      answer: 1,
    },
    {
      id: 13,
      type: 'mcq',
      question: 'Train A leaves a station at 11 AM at 60 km/h. Train B leaves the same station at 2 PM at 72 km/h. At what time will B catch A?',
      options: ['4 PM', '5 PM', '6 PM', '7 PM'],
      answer: 1,
    },
    {
      id: 14,
      type: 'mcq',
      question: 'A car covers the first 120 km at 60 km/h and the next 180 km at 90 km/h. What is the average speed?',
      options: ['70 km/h', '72 km/h', '75 km/h', '80 km/h'],
      answer: 1,
      acceptedAnswers: [1, 2],
    },
    {
      id: 15,
      type: 'mcq',
      question: 'A man increases his speed from 10 km/h to 15 km/h and takes 20 minutes less to cover a certain distance. Find the distance.',
      options: ['8 km', '10 km', '12 km', '15 km'],
      answer: 1,
      acceptedAnswers: [1, 2],
    },
    {
      id: 16,
      type: 'mcq',
      question: 'A bus travels at 54 km/h without stoppages and at 45 km/h including stoppages. For how many minutes does it stop in one hour?',
      options: ['9 min', '10 min', '12 min', '15 min'],
      answer: 1,
      acceptedAnswers: [1, 2],
    },
    {
      id: 17,
      type: 'mcq',
      question: 'A train crosses a pole in 10 seconds and a 150 m platform in 25 seconds. Find the length of the train.',
      options: ['75 m', '100 m', '125 m', '150 m'],
      answer: 1,
    },
    {
      id: 18,
      type: 'mcq',
      question: 'Two persons start from places 180 km apart and travel towards each other at 25 km/h and 35 km/h. After how much time will they meet?',
      options: ['2 hours', '3 hours', '4 hours', '5 hours'],
      answer: 1,
    },
    {
      id: 19,
      type: 'mcq',
      question: 'A train 280 m long, travelling at uniform speed, crosses a platform in 60 seconds and passes a man standing on the platform in 20 seconds. What is the length of the platform?',
      options: ['420 m', '560 m', '840 m', '1120 m'],
      answer: 1,
      acceptedAnswers: [0, 1],
    },
    {
      id: 20,
      type: 'mcq',
      question: 'A boat covers a certain distance downstream in 1 hour and returns upstream in 1.5 hours. If the speed of the stream is 3 km/h, what is the speed of the boat in still water?',
      options: ['12 km/h', '13 km/h', '15 km/h', 'None of these'],
      answer: 2,
    },
    {
      id: 21,
      type: 'fill',
      question: 'A car travels at a speed of 72 km/h. Its speed in metres per second is ______ m/s.',
      answer: '20',
      acceptableAnswers: ['20', '20 m/s', '20m/s', '20 m / s', '20mps'],
    },
    {
      id: 22,
      type: 'fill',
      question: 'A person walks at 5 km/h and reaches his destination 12 minutes late. If he walks at 6 km/h, he reaches 10 minutes early. The distance to the destination is ______ km.',
      answer: '11',
      acceptableAnswers: ['11', '11 km', '11km', '11 kms', '11 kilometers', '11 kilometres'],
    },
    {
      id: 23,
      type: 'fill',
      question: 'A train takes 18 seconds to cross a pole and 30 seconds to cross a platform 180 m long. The length of the train is ______ m.',
      answer: '270',
      acceptableAnswers: ['270', '270 m', '270m', '270 metres', '270 meters'],
    },
    {
      id: 24,
      type: 'fill',
      question: 'A boat travels 24 km downstream in 2 hours and the same distance upstream in 3 hours. The speed of the stream is ______ km/h.',
      answer: '2',
      acceptableAnswers: ['2', '2 km/h', '2km/h', '2 kmph', '2kmph', '2 km/hr', '2km/hr'],
    },
    {
      id: 25,
      type: 'fill',
      question: 'Two trains of lengths 240 m and 360 m are moving in opposite directions. They cross each other completely in 12 seconds. If the speed of the first train is 54 km/h, the speed of the second train is ______ km/h.',
      answer: '126',
      acceptableAnswers: ['126', '126 km/h', '126km/h', '126 kmph', '126kmph', '126 km/hr', '126km/hr'],
    },
  ],
};

async function main() {
  const firebaseConfig = loadEnv();
  if (!firebaseConfig.apiKey) {
    throw new Error('Firebase config missing in .env');
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log(`Authenticating as ${ADMIN_EMAIL}…`);
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('Authenticated successfully.');

  console.log('Uploading Day 10 question bank to Firestore (question_banks/10)…');
  await setDoc(doc(db, 'question_banks', '10'), DAY10_BANK);
  console.log(`Successfully uploaded ${DAY10_BANK.questions.length} questions for Day 10.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to upload Day 10 questions:', err);
  process.exit(1);
});
