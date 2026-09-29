/**
 * Uploads Day 3 question bank to Firestore (question_banks/3) using firebase-admin + ADC.
 * Usage: node functions/scripts/upload-day3-questions.js
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

const day3Questions = require('../questions/day3');

const DAY3_BANK = {
  questionBankVersion: 2,
  title: 'Day 3 Assessment',
  topicLabel: 'Ratio and Proportion',
  durationMinutes: 25,
  questions: day3Questions,
};

async function main() {
  const projectId = getProjectId();
  if (!projectId) {
    throw new Error('Project ID could not be determined. Check .firebaserc.');
  }

  admin.initializeApp({ projectId });
  const db = admin.firestore();

  console.log(`Using Firebase project: ${projectId}`);
  console.log('Uploading Day 3 question bank to Firestore (question_banks/3)…');

  await db.collection('question_banks').doc('3').set(DAY3_BANK, { merge: true });
  console.log(`✅ Upload complete! Uploaded ${DAY3_BANK.questions.length} questions (${DAY3_BANK.durationMinutes} min).`);
}

main().catch((err) => {
  console.error('❌ Upload failed:', err.message);
  process.exit(1);
});
