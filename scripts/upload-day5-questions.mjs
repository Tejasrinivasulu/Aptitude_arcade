/**
 * Uploads Day 5 question bank to Firestore (question_banks/5).
 * Usage: node scripts/upload-day5-questions.mjs
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

// ── Day 5 Questions (Profit, Loss & Discount · 20 MCQ + 5 Fill · 25 min) ───────
const DAY5_BANK = {
  questionBankVersion: 2,
  title: 'Day 5 Assessment',
  topicLabel: 'Profit, Loss & Discount',
  durationMinutes: 25,
  questions: [
    {
      id: 1,
      type: 'mcq',
      question: 'A man buys a book for ₹200 and sells it at a profit of 25%. Find the selling price.',
      options: ['₹220', '₹225', '₹240', '₹250'],
      answer: 3,
    },
    {
      id: 2,
      type: 'mcq',
      question: 'The cost price of 20 articles is the same as the selling price of x articles. If the profit is 25%, then the value of x is:',
      options: ['15', '16', '18', '25'],
      answer: 1,
    },
    {
      id: 3,
      type: 'mcq',
      question: 'A trader spends ₹12,000 on purchasing goods and ₹2,000 on transportation. He sells all the goods for ₹17,500. Find his profit percentage on the total expenditure.',
      options: ['20%', '25%', '27.5%', '30%'],
      answer: 1,
    },
    {
      id: 4,
      type: 'mcq',
      question: 'An article is sold at a loss of 12%. If it were sold for ₹264 more, there would be no profit or loss. Find its cost price.',
      options: ['₹1,800', '₹2,000', '₹2,200', '₹2,400'],
      answer: 2,
    },
    {
      id: 5,
      type: 'mcq',
      question: "A supermarket offers 5 soaps for the price of 4. If the shopkeeper's cost price per soap is ₹24 and the selling price of 4 soaps is ₹150, what is the profit percentage on the offer?",
      options: ['20%', '25%', '30%', '35%'],
      answer: 1,
    },
    {
      id: 6,
      type: 'mcq',
      question: 'After a bad weather condition, the price of tea in India decreases by 10%. As a result, monthly sales increase by 10%. Find the percentage change in monthly expenditure.',
      options: ['2% loss', '1% profit', '2% profit', '1% loss'],
      answer: 3,
    },
    {
      id: 7,
      type: 'mcq',
      question: 'What will be the selling price of a good marked at ₹800, if the good is sold at two successive discounts of 5%?',
      options: ['₹722', '₹712', '₹720', '₹700'],
      answer: 0,
    },
    {
      id: 8,
      type: 'mcq',
      question: 'A dealer wants to mark the price of an article such that by offering a 5% discount, he is able to get 33% profit. Find the percentage above CP at which the article should be marked.',
      options: ['23%', '20%', '55%', '40%'],
      answer: 3,
    },
    {
      id: 9,
      type: 'mcq',
      question: 'A person sold two different items at the same price. He made 10% profit on one item and 10% loss on the other. On selling the two items, the person made:',
      options: ['1% profit', '2% profit', '1% loss', '2% loss'],
      answer: 2,
    },
    {
      id: 10,
      type: 'mcq',
      question: 'A shopkeeper sells 30% of his stock at a profit of 40%, 40% of the stock at a profit of 20%, and the rest at a loss of 10%. If the cost per item is the same, find his overall profit percentage.',
      options: ['15%', '16%', '17%', '18%'],
      answer: 2,
    },
    {
      id: 11,
      type: 'mcq',
      question: 'In a certain store, the profit is 320% of the cost. If the cost increases by 25% but the selling price remains constant, approximately what percentage of the selling price is the profit?',
      options: ['30%', '70%', '100%', '250%'],
      answer: 1,
    },
    {
      id: 12,
      type: 'mcq',
      question: 'A store marks an item 40% above its cost price and offers a discount of 10%. It then gives an additional discount of 5% on the discounted price. What is the final profit percentage?',
      options: ['18%', '19.7%', '20%', '22%'],
      answer: 1,
    },
    {
      id: 13,
      type: 'mcq',
      question: "After two successive increments, Gopal's salary became 187.5% of his initial salary. If the percentage of salary increase in the second increment was twice that in the first increment, the percentage increase in the first increment was:",
      options: ['27.5%', '30%', '25%', '20%'],
      answer: 2,
    },
    {
      id: 14,
      type: 'mcq',
      question: 'A manufacturer produces 500 items at a total cost of ₹25,000. Ten percent of the items are defective and cannot be sold. At what price should each remaining item be sold to make a profit of 20% on the total cost?',
      options: ['₹60', '₹62.50', '₹66.67', '₹70'],
      answer: 2,
    },
    {
      id: 15,
      type: 'mcq',
      question: "The salaries of Sita, Gita and Mita are initially in the ratio 5:6:7. First-year hikes are respectively 20%, 25%, 20%. In the second year, Sita and Mita receive hikes of 40% and 25%, respectively. Gita's salary becomes equal to the mean salary of the three. The second-year hike received by Gita is:",
      options: ['26%', '28%', '25%', '30%'],
      answer: 0,
    },
    {
      id: 16,
      type: 'mcq',
      question: "The salaries of Ramesh, Ganesh and Rajesh were in the ratio 6:5:7 in 2010 and 3:4:3 in 2015. Ramesh's salary increased by 25% during this period. The percentage increase in Rajesh's salary is closest to:",
      options: ['7%', '8%', '9%', '10%'],
      answer: 0,
    },
    {
      id: 17,
      type: 'mcq',
      question: 'In a village, food-grain production increased by 40%, while per-capita production increased by 27% during a certain period. The percentage by which the village population increased is nearest to:',
      options: ['16%', '13%', '10%', '7%'],
      answer: 2,
    },
    {
      id: 18,
      type: 'mcq',
      question: 'Prasad buys a book for ₹800 and sells it at ₹1,000. If the cost price increases by 25% but the selling price remains unchanged, what is his new profit or loss percentage?',
      options: ['0%', '5% loss', '10% loss', '12.5% loss'],
      answer: 0,
    },
    {
      id: 19,
      type: 'mcq',
      question: 'Ashok sells 80 articles at ₹150 each. If he reduces the selling price by ₹15 per article, his total profit decreases by ₹1,200. What is the number of articles he must sell at the reduced price to make the same total revenue as before?',
      options: ['80', '85', '88', '90'],
      answer: 2,
    },
    {
      id: 20,
      type: 'mcq',
      question: 'The ratio of the cost of item P to the cost of item Q is 3:4. If the cost of item P is ₹5,400, item Q is sold at a 25% profit, and its marked price is ₹10,000, find the discount on item Q as a percentage of its marked price:',
      options: ['25%', '12.5%', '10%', '5%'],
      answer: 2,
    },
    {
      id: 21,
      type: 'fill',
      question: 'A shopkeeper buys an article for ₹800 and sells it for ₹920. The profit percentage is _____ %.',
      answer: '15',
      acceptableAnswers: ['15', '15%'],
    },
    {
      id: 22,
      type: 'fill',
      question: 'A shirt is marked at ₹2,000 and sold after a 15% discount. If the shopkeeper still makes a 20% profit, the cost price of the shirt is ₹_____ (Round off to 2 decimal places).',
      answer: '1416.67',
      acceptableAnswers: ['1416.67', '1416.66', '1416.7', '1417', '1416'],
    },
    {
      id: 23,
      type: 'fill',
      question: 'An article is sold at a 10% loss. If its selling price were increased by ₹180, there would be a 5% profit. The cost price of the article is ₹_____.',
      answer: '1200',
      acceptableAnswers: ['1200', '1,200', '₹1200', '₹1,200'],
    },
    {
      id: 24,
      type: 'fill',
      question: "A trader marks an article 40% above its cost price and offers two successive discounts of 10% and 20%. The trader's overall profit/loss percentage is _____ % (Enter up to 1 decimal place).",
      answer: '0.8',
      acceptableAnswers: ['0.8', '0.80', '0.8%', '0.80%'],
    },
    {
      id: 25,
      type: 'fill',
      question: 'A shopkeeper gives a 20% discount on the marked price and still earns a 25% profit. If the cost price of the article is ₹1,600, then the marked price is ₹_____.',
      answer: '2500',
      acceptableAnswers: ['2500', '2,500', '₹2500', '₹2,500'],
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

  console.log('Uploading Day 5 question bank to Firestore (question_banks/5)…');
  await setDoc(doc(db, 'question_banks', '5'), DAY5_BANK);
  console.log(`✅ Done! Uploaded ${DAY5_BANK.questions.length} questions (${DAY5_BANK.durationMinutes} min).`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Upload failed:', err.message);
  process.exit(1);
});
