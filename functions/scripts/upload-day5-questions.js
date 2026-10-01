/**
 * Uploads Day 5 question bank to Firestore (question_banks/5) using firebase-admin + ADC.
 * Usage: node functions/scripts/upload-day5-questions.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

function getProjectId() {
  try {
    const firebasercPath = path.resolve(__dirname, '../../.firebaserc');
    const config = JSON.parse(fs.readFileSync(firebasercPath, 'utf8'));
    return config.projects?.default;
  } catch {
    return process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
  }
}

const day5Questions = require('../questions/day5');

const DAY5_BANK = {
  questionBankVersion: 2,
  title: 'Day 5 Assessment',
  topicLabel: 'Profit, Loss & Discount',
  durationMinutes: 25,
  questions: day5Questions,
};

async function main() {
  const projectId = getProjectId();
  if (!projectId) {
    throw new Error('Project ID could not be determined. Check .firebaserc.');
  }

  admin.initializeApp({ projectId });
  const db = admin.firestore();

  console.log(`Using Firebase project: ${projectId}`);
  console.log('Uploading Day 5 question bank to Firestore (question_banks/5)…');

  await db.collection('question_banks').doc('5').set(DAY5_BANK, { merge: true });
  console.log(`✅ Upload complete! Uploaded ${DAY5_BANK.questions.length} questions (${DAY5_BANK.durationMinutes} min).`);
}

main().catch((err) => {
  console.error('❌ Upload failed:', err.message);
  process.exit(1);
});
