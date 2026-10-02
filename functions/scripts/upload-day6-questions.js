/**
 * Uploads Day 6 question bank to Firestore (question_banks/6) using firebase-admin + ADC.
 * Usage: node functions/scripts/upload-day6-questions.js
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

const day6Questions = require('../questions/day6');

const DAY6_BANK = {
  questionBankVersion: 2,
  title: 'Day 6 Assessment',
  topicLabel: 'Simple & Compound Interest',
  durationMinutes: 25,
  questions: day6Questions,
};

async function main() {
  const projectId = getProjectId();
  if (!projectId) {
    throw new Error('Project ID could not be determined. Check .firebaserc.');
  }

  admin.initializeApp({ projectId });
  const db = admin.firestore();

  console.log(`Using Firebase project: ${projectId}`);
  console.log('Uploading Day 6 question bank to Firestore (question_banks/6)…');
  await db.collection('question_banks').doc('6').set(DAY6_BANK);
  console.log(`Successfully uploaded ${day6Questions.length} questions for Day 6.`);
}

main().catch((err) => {
  console.error('Failed to upload Day 6 questions:', err);
  process.exit(1);
});
