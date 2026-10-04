/**
 * Uploads Day 7 question bank to Firestore (question_banks/7) using firebase-admin + ADC.
 * Usage: node functions/scripts/upload-day7-questions.js
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

const day7Questions = require('../questions/day7');

const DAY7_BANK = {
  questionBankVersion: 2,
  title: 'Day 7 Assessment',
  topicLabel: 'Problems on Ages',
  durationMinutes: 25,
  questions: day7Questions,
};

async function main() {
  const projectId = getProjectId();
  if (!projectId) {
    throw new Error('Project ID could not be determined. Check .firebaserc.');
  }

  admin.initializeApp({ projectId });
  const db = admin.firestore();

  console.log(`Using Firebase project: ${projectId}`);
  console.log('Uploading Day 7 question bank to Firestore (question_banks/7)…');
  await db.collection('question_banks').doc('7').set(DAY7_BANK);
  console.log(`Successfully uploaded ${day7Questions.length} questions for Day 7.`);
}

main().catch((err) => {
  console.error('Failed to upload Day 7 questions:', err);
  process.exit(1);
});
