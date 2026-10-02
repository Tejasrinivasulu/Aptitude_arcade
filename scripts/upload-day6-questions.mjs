/**
 * Uploads Day 6 question bank to Firestore (question_banks/6).
 * Usage: node scripts/upload-day6-questions.mjs
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

// ── Day 6 Questions (Simple & Compound Interest · 20 MCQ + 5 Fill · 25 min) ───────
const DAY6_BANK = {
  questionBankVersion: 2,
  title: 'Day 6 Assessment',
  topicLabel: 'Simple & Compound Interest',
  durationMinutes: 25,
  questions: [
    {
      id: 1,
      type: 'mcq',
      question: "A loan has simple interest. If the borrower pays only the interest and does not reduce the principal, the principal used for calculating the next period's interest will:",
      options: ['Automatically increase', 'Automatically decrease', 'Remain the same', 'Become zero'],
      answer: 2,
    },
    {
      id: 2,
      type: 'mcq',
      question: 'A person invests ₹5,000 at a certain rate of simple interest. After some time, he receives ₹6,000 as the total amount. What does ₹5,000 represent?',
      options: ['Interest', 'Rate', 'Principal', 'Amount'],
      answer: 2,
    },
    {
      id: 3,
      type: 'mcq',
      question: 'A sum earns simple interest equal to half of its principal. If the rate is 10% per annum, for how many years was the money invested?',
      options: ['2 years', '3 years', '5 years', '10 years'],
      answer: 2,
    },
    {
      id: 4,
      type: 'mcq',
      question: 'A sum of money becomes 1.24 times itself after 4 years under simple interest. At what annual rate was it invested?',
      options: ['5%', '6%', '7%', '8%'],
      answer: 1,
    },
    {
      id: 5,
      type: 'mcq',
      question: 'A sum of money is invested at simple interest. If the rate is increased from 8% to 11%, the interest earned in 5 years increases by ₹1,500. Find the principal.',
      options: ['₹8,000', '₹9,000', '₹10,000', '₹12,000'],
      answer: 2,
    },
    {
      id: 6,
      type: 'mcq',
      question: 'A certain amount of money is invested at simple interest. The simple interest earned in 5 years is equal to 3/8 of the original amount invested. What is the rate of interest per annum?',
      options: ['6%', '7.5%', '8%', '9%'],
      answer: 1,
    },
    {
      id: 7,
      type: 'mcq',
      question: 'A sum becomes ₹9,600 after 4 years and ₹10,800 after 7 years at simple interest. Find the rate of interest.',
      options: ['4%', '5%', '6%', '8%'],
      answer: 1,
    },
    {
      id: 8,
      type: 'mcq',
      question: 'A person invested a certain amount at simple interest. After 4 years, the amount became ₹13,600. If the simple interest earned during the period was ₹3,600, what was the annual rate of interest?',
      options: ['7.5%', '8%', '9%', '10%'],
      answer: 2,
    },
    {
      id: 9,
      type: 'mcq',
      question: 'A sum of money is invested at simple interest. If the rate of interest is increased by 3%, the interest earned in 4 years increases by ₹1,080. What is the original sum invested?',
      options: ['₹8,000', '₹9,000', '₹10,000', '₹12,000'],
      answer: 1,
    },
    {
      id: 10,
      type: 'mcq',
      question: 'A person invests a certain principal amount at 8% per annum simple interest for 2 years. If he had invested ₹5,000 more at the same rate and for the same time, his total interest would have been ₹800 more. If the total interest earned on his original investment was ₹720, what was the original amount invested?',
      options: ['₹4,500', '₹5,000', '₹6,000', '₹7,500'],
      answer: 0,
    },
    {
      id: 11,
      type: 'mcq',
      question: 'A sum of ₹8,000 is invested at an annual interest rate of 10% per annum compounded annually. What is the total compound interest earned after 2 years?',
      options: ['₹1,600', '₹1,680', '₹1,720', '₹1,800'],
      answer: 1,
    },
    {
      id: 12,
      type: 'mcq',
      question: 'A certain sum of money invested at compound interest triples itself in 3 years. In how many years will it become 27 times itself at the same rate of interest?',
      options: ['3 years', '9 years', '27 years', '81 years'],
      answer: 1,
    },
    {
      id: 13,
      type: 'mcq',
      question: 'What is the compound interest on a sum of ₹10,000 for 1 year at 8% per annum, compounded semi-annually?',
      options: ['₹800', '₹816', '₹832', '₹840'],
      answer: 1,
    },
    {
      id: 14,
      type: 'mcq',
      question: 'A student invests ₹6,400 at 25% per annum compounded quarterly for 6 months. What is the total compound interest earned?',
      options: ['₹735.50', '₹815.00', '₹825.00', '₹855.50'],
      answer: 2,
    },
    {
      id: 15,
      type: 'mcq',
      question: 'Radhika wants to invest an amount for 3 years where the interest rates for the 1st, 2nd, and 3rd years are 5%, 12%, and 8% respectively, compounded annually. How much should she invest to get a maturity amount of ₹6,350.40?',
      options: ['₹5,000', '₹5,200', '₹5,500', '₹5,800'],
      answer: 0,
    },
    {
      id: 16,
      type: 'mcq',
      question: 'A sum of money invested at compound interest amounts to ₹4,800 after 2 years and ₹5,280 after 3 years. What is the principal sum?',
      options: ['₹3,600', '₹3,966.94', '₹4,000', '₹4,200'],
      answer: 1,
    },
    {
      id: 17,
      type: 'mcq',
      question: 'A sum becomes 4 times in 6 years at compound interest. In how many years will the same sum become 64 times itself at the same rate?',
      options: ['12 years', '16 years', '18 years', '24 years'],
      answer: 2,
    },
    {
      id: 18,
      type: 'mcq',
      question: 'For the same principal amount, the compound interest for 2 years at 5% per annum exceeds the simple interest for 3 years at 3% per annum by ₹1,125. What is the principal amount in rupees?',
      options: ['₹80,000', '₹85,000', '₹90,000', '₹95,000'],
      answer: 2,
    },
    {
      id: 19,
      type: 'mcq',
      question: 'A sum of ₹5,000 is borrowed at 30% per annum compound interest for 3 years and 10 months. Calculate the total compound interest earned if compounded annually.',
      options: ['₹8,730.00', '₹8,731.25', '₹8,732.50', '₹9,674.00'],
      answer: 1,
    },
    {
      id: 20,
      type: 'mcq',
      question: 'If the simple interest on a sum of money for 2 years at 5% per annum is ₹200, what will be the compound interest on the same sum at the same rate and for the same time?',
      options: ['₹202', '₹205', '₹210', '₹220'],
      answer: 1,
    },
    {
      id: 21,
      type: 'fill',
      question: 'A sum of ₹8,000 is invested at 7.5% per annum simple interest for 2 years. The simple interest earned is ₹______.',
      answer: '1200',
      acceptableAnswers: ['1200', '1,200', '₹1200', '₹1,200', '1200.00', '1200/-'],
    },
    {
      id: 22,
      type: 'fill',
      question: 'A sum amounts to ₹13,000 in 3 years at 10% per annum simple interest. The principal amount invested was ₹______.',
      answer: '10000',
      acceptableAnswers: ['10000', '10,000', '₹10000', '₹10,000', '10000.00', '10000/-'],
    },
    {
      id: 23,
      type: 'fill',
      question: 'A sum of ₹10,000 is invested at 10% per annum compound interest, compounded annually, for 2 years. The total compound interest earned is ₹______.',
      answer: '2100',
      acceptableAnswers: ['2100', '2,100', '₹2100', '₹2,100', '2100.00', '2100/-'],
    },
    {
      id: 24,
      type: 'fill',
      question: 'A sum of ₹15,000 is invested at 10% per annum compound interest, compounded annually, for 2 years. The total amount received at the end of 2 years is ₹______.',
      answer: '18150',
      acceptableAnswers: ['18150', '18,150', '₹18150', '₹18,150', '18150.00', '18150/-'],
    },
    {
      id: 25,
      type: 'fill',
      question: 'The difference between the compound interest and simple interest on a certain sum for 2 years at 10% per annum is ₹500. The principal amount is ₹______.',
      answer: '50000',
      acceptableAnswers: ['50000', '50,000', '₹50000', '₹50,000', '50000.00', '50000/-'],
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

  console.log('Uploading Day 6 question bank to Firestore (question_banks/6)…');
  await setDoc(doc(db, 'question_banks', '6'), DAY6_BANK);
  console.log(`✅ Done! Uploaded ${DAY6_BANK.questions.length} questions (${DAY6_BANK.durationMinutes} min).`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Upload failed:', err.message);
  process.exit(1);
});
