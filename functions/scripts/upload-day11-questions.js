/**
 * Uploads Day 11 question bank to Firestore (question_banks/11) using firebase-admin + ADC.
 * Usage: node functions/scripts/upload-day11-questions.js
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

const day11Questions = require('../questions/day11');

const DAY11_BANK = {
  questionBankVersion: 1,
  title: 'Day 11 Assessment',
  topicLabel: 'Problems on Trains',
  durationMinutes: 25,
  questions: day11Questions,
};

async function main() {
  const projectId = getProjectId();
  if (!projectId) {
    throw new Error('Project ID could not be determined. Check .firebaserc.');
  }

  admin.initializeApp({ projectId });
  const db = admin.firestore();

  console.log(`Using Firebase project: ${projectId}`);
  console.log('Uploading Day 11 question bank to Firestore (question_banks/11)…');
  await db.collection('question_banks').doc('11').set(DAY11_BANK);
  console.log(`Successfully uploaded ${day11Questions.length} questions for Day 11.`);
}

main().catch((err) => {
  console.error('Failed to upload Day 11 questions:', err);
  process.exit(1);
});
