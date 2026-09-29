/**
 * Uploads Day 2 question bank to Firestore (question_banks/2).
 * Usage: node scripts/upload-day2-questions.mjs
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

// ── Day 2 Questions (Percentages · 20 MCQ + 5 Fill · 25 min) ─────────────────
const DAY2_BANK = {
  questionBankVersion: 2,
  title: 'Day 2 Assessment',
  topicLabel: 'Percentages',
  durationMinutes: 25,
  questions: [
    { id: 1, type: 'mcq', question: 'If 40% of (A+B) = 60% of (A−B), then what is (2A−3B)/(A+B)?', options: ['7/2', '7/6', '8/6', '7/8'], answer: 1 },
    { id: 2, type: 'mcq', question: "If A's height is 10% more than B's height, by how much percent is B's height less than A's height?", options: ['9 1/12%', '12 2/13%', '9 1/11%', '11 1/14%'], answer: 2 },
    { id: 3, type: 'mcq', question: 'If 20% of a number is equal to 35% of 160, what is the number?', options: ['280', '320', '240', '300'], answer: 0 },
    { id: 4, type: 'mcq', question: 'The price of sugar increases by 20%. By what percentage should a household reduce its sugar consumption so that the total expenditure remains unchanged?', options: ['16.67%', '20%', '25%', '15%'], answer: 0 },
    { id: 5, type: 'mcq', question: 'The student who tops will get a refund of 20% of 25% of his tuition fees. If the tuition fee is ₹3000, what is the refund amount?', options: ['₹150', '₹60', '₹45', '₹15'], answer: 0 },
    { id: 6, type: 'mcq', question: 'Three candidates contested an election and received 1136, 7636 and 11628 votes respectively. What percentage of the total votes did the winning candidate get?', options: ['57%', '60%', '65%', '90%'], answer: 0 },
    { id: 7, type: 'mcq', question: 'Gauri bought things worth ₹25, out of which 30 paise went on sales tax on taxable purchases. If the tax rate was 6%, what was the cost of the tax-free items?', options: ['₹15', '₹15.70', '₹19.70', '₹20'], answer: 3 },
    { id: 8, type: 'mcq', question: 'An apartment complex purchased 60 toilets and 20 shower heads. If the price of a toilet is three times the price of a shower head, what percent of the total cost was the cost of all the shower heads?', options: ['10%', '30%', '60%', '12%'], answer: 0 },
    { id: 9, type: 'mcq', question: 'A student scores 55% marks in 8 papers of 100 marks each. He scores 15% of his total marks in English. How much does he score in English?', options: ['55', '66', '77', '44'], answer: 1 },
    { id: 10, type: 'mcq', question: 'My total income of 2017, 2018 and 2019 is ₹364. Every year the salary increases by 20%. What is my income in 2017?', options: ['₹96', '₹100', '₹104', '₹108'], answer: 1 },
    { id: 11, type: 'mcq', question: 'Fresh fruit contains 68% water while dry fruit contains 20% water. How much dry fruit can be obtained from 100 kg of fresh fruit?', options: ['32 kg', '40 kg', '52 kg', '60 kg'], answer: 1 },
    { id: 12, type: 'mcq', question: 'A number is first decreased by 15% and then increased by 20%. The resulting number is 78 more than the original number. Find the original number.', options: ['3900', '2600', '4500', '5200'], answer: 0 },
    { id: 13, type: 'mcq', question: 'Varun spends 30% of his monthly income on food and 10% of the remaining amount on transport. If the difference between the amount spent on food and transport is ₹9,200, find his monthly income.', options: ['₹60,000', '₹40,000', '₹30,000', '₹36,000'], answer: 1 },
    { id: 14, type: 'mcq', question: 'What percentage of numbers from 1 to 70 have squares ending in the digit 1?', options: ['1%', '14%', '20%', '21%'], answer: 2 },
    { id: 15, type: 'mcq', question: 'A fruit seller sold 40% of his apples and still had 840 apples left. How many apples did he originally have?', options: ['1800', '1260', '2100', '1400'], answer: 3 },
    { id: 16, type: 'mcq', question: 'In an election, 80% of registered voters cast their votes. Of the votes cast, 60% were for Candidate A. If Candidate A received 9,600 votes, how many voters were registered?', options: ['18,000', '19,000', '20,000', '22,000'], answer: 2 },
    { id: 17, type: 'mcq', question: 'In a class, 60% are boys. If there are 24 girls, what is the total number of students?', options: ['50', '60', '64', '72'], answer: 1 },
    { id: 18, type: 'mcq', question: "A student's marks increase from 240 to 300. What is the percentage increase?", options: ['20%', '25%', '30%', '35%'], answer: 1 },
    { id: 19, type: 'mcq', question: 'A student scored 360 marks and failed by 40 marks. If the pass percentage is 40%, what is the total maximum mark?', options: ['900', '950', '1000', '1100'], answer: 2 },
    { id: 20, type: 'mcq', question: 'The price of an electronic machine decreased by 5%, 10%, and 15% during the first three years respectively. If its value at the beginning was ₹8,000, what will be its value after three years?', options: ['₹5,814', '₹5,000', '₹6,721', '₹7,000'], answer: 0 },
    { id: 21, type: 'fill', question: '25% of 240 = ______', answer: '60' },
    { id: 22, type: 'fill', question: 'A number is increased from 400 to 460. The percentage increase is ______ %', answer: '15' },
    { id: 23, type: 'fill', question: 'A shirt marked at ₹1,500 is sold at a 20% discount. The selling price is ₹______', answer: '1200' },
    { id: 24, type: 'fill', question: 'A number is increased by 20% and then decreased by 20%. The overall percentage change is a ______ % decrease', answer: '4' },
    { id: 25, type: 'fill', question: "A person's income increases by 25%, while his expenditure increases by 10%. If initially he saved 20% of his income, his savings increase by ______ %", answer: '85' },
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

  console.log('Uploading Day 2 question bank to Firestore (question_banks/2)…');
  await setDoc(doc(db, 'question_banks', '2'), DAY2_BANK);
  console.log(`✅ Done! Uploaded ${DAY2_BANK.questions.length} questions (${DAY2_BANK.durationMinutes} min).`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Upload failed:', err.message);
  process.exit(1);
});
