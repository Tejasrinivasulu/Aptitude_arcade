/**
 * Uploads Day 8 question bank to Firestore (question_banks/8) using firebase-admin + ADC.
 * Usage: node functions/scripts/upload-day8-questions.js
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

const day8Questions = require('../questions/day8');

const DAY8_BANK = {
  questionBankVersion: 2,
  title: 'Day 8 Assessment',
  topicLabel: 'Time & Work',
  durationMinutes: 25,
  questions: day8Questions,
};

async function main() {
  const projectId = getProjectId();
  if (!projectId) {
    throw new Error('Project ID could not be determined. Check .firebaserc.');
  }

  admin.initializeApp({ projectId });
  const db = admin.firestore();

  console.log(`Using Firebase project: ${projectId}`);
  console.log('Uploading Day 8 question bank to Firestore (question_banks/8)…');
  await db.collection('question_banks').doc('8').set(DAY8_BANK);
  console.log(`Successfully uploaded ${day8Questions.length} questions for Day 8.`);
}

main().catch((err) => {
  console.error('Failed to upload Day 8 questions:', err);
  process.exit(1);
});
