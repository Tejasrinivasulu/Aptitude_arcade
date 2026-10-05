/**
 * Uploads Day 9 question bank to Firestore (question_banks/9) using firebase-admin + ADC.
 * Usage: node functions/scripts/upload-day9-questions.js
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

const day9Questions = require('../questions/day9');

const DAY9_BANK = {
  questionBankVersion: 1,
  title: 'Day 9 Assessment',
  topicLabel: 'Pipes & Cisterns',
  durationMinutes: 25,
  questions: day9Questions,
};

async function main() {
  const projectId = getProjectId();
  if (!projectId) {
    throw new Error('Project ID could not be determined. Check .firebaserc.');
  }

  admin.initializeApp({ projectId });
  const db = admin.firestore();

  console.log(`Using Firebase project: ${projectId}`);
  console.log('Uploading Day 9 question bank to Firestore (question_banks/9)…');
  await db.collection('question_banks').doc('9').set(DAY9_BANK);
  console.log(`Successfully uploaded ${day9Questions.length} questions for Day 9.`);
}

main().catch((err) => {
  console.error('Failed to upload Day 9 questions:', err);
  process.exit(1);
});
