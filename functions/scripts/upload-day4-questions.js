/**
 * Uploads Day 4 question bank to Firestore (question_banks/4) using firebase-admin + ADC.
 * Usage: node functions/scripts/upload-day4-questions.js
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

const day4Questions = require('../questions/day4');

const DAY4_BANK = {
  questionBankVersion: 2,
  title: 'Day 4 Assessment',
  topicLabel: 'Averages',
  durationMinutes: 25,
  questions: day4Questions,
};

async function main() {
  const projectId = getProjectId();
  if (!projectId) {
    throw new Error('Project ID could not be determined. Check .firebaserc.');
  }

  admin.initializeApp({ projectId });
  const db = admin.firestore();

  console.log(`Using Firebase project: ${projectId}`);
  console.log('Uploading Day 4 question bank to Firestore (question_banks/4)…');

  await db.collection('question_banks').doc('4').set(DAY4_BANK, { merge: true });
  console.log(`✅ Upload complete! Uploaded ${DAY4_BANK.questions.length} questions (${DAY4_BANK.durationMinutes} min).`);
}

main().catch((err) => {
  console.error('❌ Upload failed:', err.message);
  process.exit(1);
});
