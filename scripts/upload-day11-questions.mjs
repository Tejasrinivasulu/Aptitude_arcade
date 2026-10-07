/**
 * Uploads Day 11 question bank to Firestore (question_banks/11).
 * Usage: node scripts/upload-day11-questions.mjs
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

// ── Day 11 Questions (Problems on Trains · 20 MCQ + 5 Fill · 25 min) ───────
export const DAY11_BANK = {
  questionBankVersion: 1,
  title: 'Day 11 Assessment',
  topicLabel: 'Problems on Trains',
  durationMinutes: 25,
  questions: [
    {
      id: 1,
      type: 'mcq',
      question: 'A train 120 m long is running at a speed of 54 km/h. How much time will it take to cross a pole?',
      options: ['6 seconds', '8 seconds', '10 seconds', '12 seconds'],
      answer: 1,
    },
    {
      id: 2,
      type: 'mcq',
      question: 'A train 100 m long crosses a platform 200 m long in 15 seconds. What is the speed of the train?',
      options: ['60 km/h', '72 km/h', '80 km/h', '90 km/h'],
      answer: 1,
    },
    {
      id: 3,
      type: 'mcq',
      question: 'A train 250 m long is moving at 45 km/h. How much time will it take to cross a pole?',
      options: ['15 seconds', '18 seconds', '20 seconds', '25 seconds'],
      answer: 2,
    },
    {
      id: 4,
      type: 'mcq',
      question: 'A train 250 m long crosses a platform 150 m long in 20 seconds. Find the speed of the train.',
      options: ['54 km/h', '60 km/h', '72 km/h', '90 km/h'],
      answer: 2,
    },
    {
      id: 5,
      type: 'mcq',
      question: 'Two trains of lengths 150 m and 250 m are moving in opposite directions at 54 km/h and 72 km/h respectively. How long will they take to completely cross each other?',
      options: ['10 seconds', '11.43 seconds', '12 seconds', '14 seconds'],
      answer: 1,
    },
    {
      id: 6,
      type: 'mcq',
      question: 'Two trains of lengths 180 m and 220 m are moving in the same direction at 72 km/h and 54 km/h respectively. How long will the faster train take to completely overtake the slower train?',
      options: ['60 seconds', '70 seconds', '80 seconds', '90 seconds'],
      answer: 2,
    },
    {
      id: 7,
      type: 'mcq',
      question: 'A train 240 m long crosses a platform in 24 seconds at 72 km/h. Find the length of the platform.',
      options: ['200 m', '220 m', '240 m', '260 m'],
      answer: 2,
    },
    {
      id: 8,
      type: 'mcq',
      question: 'A train running at 60 km/h crosses a bridge in 30 seconds. If the length of the train is 200 m, find the length of the bridge.',
      options: ['250 m', '300 m', '350 m', '400 m'],
      answer: 1,
    },
    {
      id: 9,
      type: 'mcq',
      question: 'Two trains start simultaneously from stations 420 km apart and move towards each other. Their speeds are 60 km/h and 80 km/h. After how much time will they meet?',
      options: ['2 hours', '2.5 hours', '3 hours', '3.5 hours'],
      answer: 2,
    },
    {
      id: 10,
      type: 'mcq',
      question: 'Two trains of lengths 120 m and 180 m are moving in opposite directions at 45 km/h and 63 km/h respectively. How long will they take to cross each other?',
      options: ['8 seconds', '9 seconds', '10 seconds', '12 seconds'],
      answer: 2,
    },
    {
      id: 11,
      type: 'mcq',
      question: 'A train crosses a platform 100 m long in 60 seconds at a speed of 45 km/h. The time taken by the train to cross an electric pole is:',
      options: ['8 seconds', '1 minute', '52 seconds', 'Data inadequate'],
      answer: 2,
    },
    {
      id: 12,
      type: 'mcq',
      question: 'A train is running at 60 km/h and crosses a pole in 9 seconds. What is the length of the train?',
      options: ['120 m', '180 m', '324 m', '150 m'],
      answer: 3,
    },
    {
      id: 13,
      type: 'mcq',
      question: 'Two trains cross each other in 14 seconds while moving in opposite directions. The faster train is 160 m long and crosses a lamp post in 12 seconds. The speed of the other train is 6 km/h less than the faster train. Find the length of the other train.',
      options: ['190 m', '192 m', '184 m', '180 m'],
      answer: 0,
    },
    {
      id: 14,
      type: 'mcq',
      question: 'A train 200 m long crosses a pole in 10 seconds. What is its speed?',
      options: ['60 km/h', '72 km/h', '80 km/h', '90 km/h'],
      answer: 1,
    },
    {
      id: 15,
      type: 'mcq',
      question: 'A train travels at 54 km/h. From the time its front enters a platform, it takes 25 seconds for the back of the train to leave the platform. At the same speed, it takes 14 seconds to pass a man running at 9 km/h in the same direction. Find the length of the train and platform respectively.',
      options: ['210 m, 140 m', '162.5 m, 187.5 m', '245 m, 130 m', '175 m, 200 m'],
      answer: 3,
    },
    {
      id: 16,
      type: 'mcq',
      question: 'Two trains A and B are moving in opposite directions. Their speeds are in the ratio 5 : 3. The front end of A crosses the rear end of B 46 seconds after their front ends cross each other. It takes another 69 seconds for their rear ends to cross each other. The ratio of the length of train A to train B is:',
      options: ['2 : 3', '2 : 1', '5 : 3', '3 : 2'],
      answer: 3,
    },
    {
      id: 17,
      type: 'mcq',
      question: 'Trains A and B start at the same time from stations X and Y towards each other. Train A reaches Y in 10 minutes after meeting train B. Train B reaches X in 9 minutes after meeting train A. The total time taken by train B to travel from Y to X is:',
      options: ['15 minutes', '12 minutes', '6 minutes', '10 minutes'],
      answer: 0,
    },
    {
      id: 18,
      type: 'mcq',
      question: 'A train travels a certain distance at a uniform speed. If its speed were 6 km/h more, it would take 4 hours less. If its speed were 6 km/h less, it would take 6 hours more. What is the distance travelled?',
      options: ['780 km', '720 km', '640 km', '800 km'],
      answer: 1,
    },
    {
      id: 19,
      type: 'mcq',
      question: 'Train X leaves station A at 11:00 AM for station B, which is 180 km away, at an average speed of 70 km/h. Train Y leaves B at the same time for A at 50 km/h, but stops for 15 minutes at station C, which is 60 km from B. Ignoring train lengths, approximately how far from A do the trains meet?',
      options: ['112 km', '118 km', '120 km', 'None of these'],
      answer: 1,
    },
    {
      id: 20,
      type: 'mcq',
      question: 'Two trains of lengths 180 m and 220 m are moving in the same direction. Their speeds are 54 km/h and 72 km/h, respectively. How much time will the faster train take to completely overtake the slower train?',
      options: ['60 seconds', '70 seconds', '80 seconds', '90 seconds'],
      answer: 2,
    },
    {
      id: 21,
      type: 'fill',
      question: 'A train 180 m long is travelling at 54 km/h. It will take ______ seconds to cross a stationary pole.',
      answer: '12',
      acceptableAnswers: ['12', '12 seconds', '12s', '12 sec', '12 secs'],
    },
    {
      id: 22,
      type: 'fill',
      question: 'A train 240 m long crosses a platform 360 m long in 30 seconds. The speed of the train is ______ km/h.',
      answer: '72',
      acceptableAnswers: ['72', '72 km/h', '72km/h', '72 kmph', '72kmph', '72 km/hr', '72km/hr'],
    },
    {
      id: 23,
      type: 'fill',
      question: 'A train crosses a pole in 12 seconds and a platform 180 m long in 21 seconds. The length of the train is ______ m.',
      answer: '240',
      acceptableAnswers: ['240', '240 m', '240m', '240 metres', '240 meters'],
    },
    {
      id: 24,
      type: 'fill',
      question: 'Two trains of lengths 180 m and 220 m are moving in opposite directions at 54 km/h and 72 km/h respectively. They will completely cross each other in ______ seconds.',
      answer: '11.43',
      acceptableAnswers: ['11.43', '11.43 seconds', '11.43s', '11.4', '11.42', '11.43 sec'],
    },
    {
      id: 25,
      type: 'fill',
      question: "A train crosses a man walking in the same direction at 6 km/h in 15 seconds. If the train's speed is 54 km/h, the length of the train is ______ m.",
      answer: '200',
      acceptableAnswers: ['200', '200 m', '200m', '200 metres', '200 meters'],
    },
  ],
};

async function main() {
  const firebaseConfig = loadEnv();
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log(`Authenticating as ${ADMIN_EMAIL}…`);
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('Signed in successfully.');

  console.log('Uploading Day 11 question bank to Firestore (question_banks/11)…');
  await setDoc(doc(db, 'question_banks', '11'), DAY11_BANK);
  console.log(`Successfully uploaded ${DAY11_BANK.questions.length} questions for Day 11.`);
  process.exit(0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('Failed to upload Day 11 questions:', err);
    process.exit(1);
  });
}
