/**
 * Uploads Day 10 question bank to Firestore (question_banks/10) using firebase-admin + ADC.
 * Usage: node functions/scripts/upload-day10-questions.js
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

const day10Questions = require('../questions/day10');

const DAY10_BANK = {
  questionBankVersion: 1,
  title: 'Day 10 Assessment',
  topicLabel: 'Time, Speed & Distance',
  durationMinutes: 25,
  questions: day10Questions,
};

async function main() {
  const projectId = getProjectId();
  if (!projectId) {
    throw new Error('Project ID could not be determined. Check .firebaserc.');
  }

  admin.initializeApp({ projectId });
  const db = admin.firestore();

  console.log(`Using Firebase project: ${projectId}`);
  console.log('Uploading Day 10 question bank to Firestore (question_banks/10)…');
  await db.collection('question_banks').doc('10').set(DAY10_BANK);
  console.log(`Successfully uploaded ${day10Questions.length} questions for Day 10.`);
}

main().catch((err) => {
  console.error('Failed to upload Day 10 questions:', err);
  process.exit(1);
});
