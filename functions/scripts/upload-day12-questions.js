/**
 * Uploads Day 12 question bank to Firestore (question_banks/12) using firebase-admin + ADC.
 * Usage: node functions/scripts/upload-day12-questions.js
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

const day12Questions = require('../questions/day12');

const DAY12_BANK = {
  questionBankVersion: 1,
  title: 'Day 12 Assessment',
  topicLabel: 'Permutations & Combinations',
  durationMinutes: 25,
  questions: day12Questions,
};

async function main() {
  const projectId = getProjectId();
  if (!projectId) {
    throw new Error('Project ID could not be determined. Check .firebaserc.');
  }

  admin.initializeApp({ projectId });
  const db = admin.firestore();

  console.log(`Using Firebase project: ${projectId}`);
  console.log('Uploading Day 12 question bank to Firestore (question_banks/12)…');
  await db.collection('question_banks').doc('12').set(DAY12_BANK);
  console.log(`Successfully uploaded ${day12Questions.length} questions for Day 12.`);
}

main().catch((err) => {
  console.error('Failed to upload Day 12 questions:', err);
  process.exit(1);
});
