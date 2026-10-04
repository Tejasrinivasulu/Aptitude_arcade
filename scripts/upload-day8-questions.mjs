/**
 * Uploads Day 8 question bank to Firestore (question_banks/8).
 * Usage: node scripts/upload-day8-questions.mjs
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

// ── Day 8 Questions (Time & Work · 20 MCQ + 5 Fill · 25 min) ───────
const DAY8_BANK = {
  questionBankVersion: 2,
  title: 'Day 8 Assessment',
  topicLabel: 'Time & Work',
  durationMinutes: 25,
  questions: [
    {
      id: 1,
      type: 'mcq',
      question: 'A can complete a work in 12 days and B in 18 days. They work together for 4 days, after which A leaves. The remaining work is completed by B alone. In how many more days will B finish the work?',
      options: ['6 days', '8 days', '10 days', '12 days'],
      answer: 1,
    },
    {
      id: 2,
      type: 'mcq',
      question: 'A can complete a work in 16 days. He works for 4 days and then B completes the remaining work in 9 days. In how many days can B alone complete the entire work?',
      options: ['12 days', '15 days', '18 days', '20 days'],
      answer: 0,
    },
    {
      id: 3,
      type: 'mcq',
      question: 'A can do a piece of work in 10 days and B in 15 days. If they work together, in how many days will the work be completed?',
      options: ['4 days', '5 days', '6 days', '8 days'],
      answer: 2,
    },
    {
      id: 4,
      type: 'mcq',
      question: 'A does twice as much work as B in the same time. Together they finish a work in 18 days. In how many days can B alone complete the work?',
      options: ['36 days', '45 days', '54 days', '60 days'],
      answer: 2,
    },
    {
      id: 5,
      type: 'mcq',
      question: '20 workers can complete a work in 15 days. After working for 6 days, 5 workers leave. How many extra days are needed to finish the remaining work?',
      options: ['2 days', '3 days', '4 days', '5 days'],
      answer: 1,
    },
    {
      id: 6,
      type: 'mcq',
      question: 'A can complete a work in 20 days. B is 25% more efficient than A. If both work together, in how many days can the work be completed?',
      options: ['8 days', '8.89 days', '10 days', '12 days'],
      answer: 1,
    },
    {
      id: 7,
      type: 'mcq',
      question: '12 men or 18 women can complete a work in 20 days. In how many days will 8 men and 12 women complete the same work?',
      options: ['12 days', '15 days', '18 days', '20 days'],
      answer: 1,
    },
    {
      id: 8,
      type: 'mcq',
      question: 'A and B can complete a work in 30 days and 45 days respectively. They work on alternate days starting with A. In how many days will the work be completed?',
      options: ['30 days', '35 days', '36 days', '38 days'],
      answer: 2,
    },
    {
      id: 9,
      type: 'mcq',
      question: 'A can do a work in 25 days and B in 20 days. They work together for 5 days. The remaining work is completed by C in 8 days. In how many days can C alone complete the entire work?',
      options: ['35 days', '14.0 days', '14.5 days', '50 days'],
      answer: 2,
    },
    {
      id: 10,
      type: 'mcq',
      question: 'A and B together can complete a work in 8 days, while B and C together can complete it in 12 days. If C alone takes 30 days, find the time taken by A alone.',
      options: ['10 days', '12 days', '13⅓ days', '15 days'],
      answer: 2,
    },
    {
      id: 11,
      type: 'mcq',
      question: 'A contractor undertakes to finish a road in 40 days with 60 workers. After 24 days, only 60% of the work is completed. How many additional workers are required to complete the work on time?',
      options: ['0', '10', '20', '30'],
      answer: 0,
    },
    {
      id: 12,
      type: 'mcq',
      question: 'A, B, and C can complete a work in 10, 15, and 30 days respectively. They start together. A leaves after 2 days and B leaves after 4 days. Find the total time taken to complete the work.',
      options: ['6 days', '7 days', '8 days', '10 days'],
      answer: 2,
    },
    {
      id: 13,
      type: 'mcq',
      question: 'A and B can complete a work in 12 days. B and C can complete it in 15 days. C and A can complete it in 20 days. Find the time taken by A, B, and C together.',
      options: ['6 days', '8 days', '16 days', '12 days'],
      answer: 2,
    },
    {
      id: 14,
      type: 'mcq',
      question: 'A and B can complete a work in 18 days. B and C in 24 days. A and C in 36 days. Find the time taken by A, B, and C together.',
      options: ['12 days', '14.4 days', '16 days', '18 days'],
      answer: 2,
    },
    {
      id: 15,
      type: 'mcq',
      question: 'A and B can do a piece of work in 15 days, B and C in 20 days, and A and C in 12 days. In how many days can A, B, and C together complete the work?',
      options: ['8 days', '9 days', '10 days', '12 days'],
      answer: 2,
    },
    {
      id: 16,
      type: 'mcq',
      question: 'A can complete a work in 30 days. B is 50% more efficient than A, and C is 20% less efficient than B. Find the time taken by A, B, and C together.',
      options: ['8 days', '8.82 days', '9.5 days', '10 days'],
      answer: 1,
    },
    {
      id: 17,
      type: 'mcq',
      question: 'A group of 24 workers can complete a work in 36 days. After 12 days, 8 more workers join. In how many total days will the work be completed?',
      options: ['24 days', '27 days', '30 days', '32 days'],
      answer: 2,
    },
    {
      id: 18,
      type: 'mcq',
      question: 'A can do a work in 24 days, B in 36 days, and C in 72 days. They start together, but A leaves after 8 days and B leaves 4 days before completion. Find the total time taken.',
      options: ['18 days', '17⅔ days', '20 days', '21⅓ days'],
      answer: 1,
    },
    {
      id: 19,
      type: 'mcq',
      question: 'Three workers A, B, and C can finish a job in 12, 15, and 20 hours respectively. If all three work together, but C leaves after 4 hours, how long will it take in total to finish the job?',
      options: ['5 hours', '5 hours 20 minutes', '6 hours', '7 hours 30 minutes'],
      answer: 1,
    },
    {
      id: 20,
      type: 'mcq',
      question: 'A and B can complete a work in 6 days, B and C in 8 days, and C and A in 12 days. Find the number of days required by A, B, and C working together.',
      options: ['4 days', '5 days', '4.8 days', '6 days'],
      answer: 1,
    },
    {
      id: 21,
      type: 'fill',
      question: '15 women can complete a piece of work in 24 days. The number of women required to complete the same work in 10 days is ______ women.',
      answer: '36',
      acceptableAnswers: ['36', '36 women', '36women'],
    },
    {
      id: 22,
      type: 'fill',
      question: 'A can complete a piece of work in 6 days by working 7 hours a day, while B can complete the same work in 8 days by working 7 hours a day. If they work together for 8 hours a day, the work will be completed in ______ days.',
      answer: '3',
      acceptableAnswers: ['3', '3 days', '3days'],
    },
    {
      id: 23,
      type: 'fill',
      question: 'A is three times as efficient as B. If B alone can complete a work in 36 days, A and B working together can complete the work in ______ days.',
      answer: '9',
      acceptableAnswers: ['9', '9 days', '9days'],
    },
    {
      id: 24,
      type: 'fill',
      question: 'A can complete 2/5 of a work in 8 days, while B can complete 3/7 of the same work in 9 days. If they work together, the complete work will be finished in ______ days.',
      answer: '10',
      acceptableAnswers: ['10', '10 days', '10days', '10.24', '10.2'],
    },
    {
      id: 25,
      type: 'fill',
      question: 'A, B and C undertake a work for Rs. 7,200. A works for 6 days, B for 8 days and C for 12 days. Their individual daily efficiencies are in the ratio 3:2:1. The amount received by B is Rs. ______.',
      answer: '2504.35',
      acceptableAnswers: ['2504.35', '2504', '2,504.35', '2,504', 'Rs. 2504.35', 'Rs. 2504', 'Rs 2504.35', 'Rs 2504'],
    },
  ],
};

async function main() {
  const firebaseConfig = loadEnv();
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('Signing in as admin…');
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('Authenticated.\n');

  console.log('Uploading Day 8 question bank to Firestore (question_banks/8)…');
  await setDoc(doc(db, 'question_banks', '8'), DAY8_BANK);
  console.log(`✅ Done! Uploaded ${DAY8_BANK.questions.length} questions (${DAY8_BANK.durationMinutes} min).`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Upload failed:', err.message);
  process.exit(1);
});
