/**
 * Deletes all student/operational data from Firestore and Firebase Auth.
 * Keeps the default admin account (admin@aptitudearcade.com).
 *
 * Usage (from project root):
 *   node functions/scripts/purge-all-data.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const ADMIN_EMAIL = 'admin@aptitudearcade.com';

const COLLECTIONS = [
  'results',
  'exam_results',
  'exam_sessions',
  'student_progress',
  'help_requests',
  'system_logs',
  'metrics',
];

function getProjectId() {
  try {
    const firebasercPath = path.resolve(__dirname, '../../.firebaserc');
    const config = JSON.parse(fs.readFileSync(firebasercPath, 'utf8'));
    return config.projects?.default;
  } catch {
    return process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
  }
}

async function deleteCollection(db, collectionPath) {
  const colRef = db.collection(collectionPath);
  let deleted = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const snap = await colRef.limit(500).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deleted += snap.size;
  }

  return deleted;
}

function isProtectedUser(data = {}) {
  if (data.role === 'admin') return true;
  if (String(data.email || '').toLowerCase() === ADMIN_EMAIL) return true;
  return false;
}

async function main() {
  const projectId = getProjectId();
  if (!projectId) {
    throw new Error('Could not determine Firebase project ID.');
  }

  if (!admin.apps.length) {
    admin.initializeApp({ projectId });
  }

  const db = admin.firestore();
  const auth = admin.auth();

  console.log(`Purging data in project: ${projectId}`);
  console.log('');

  const stats = {};

  for (const name of COLLECTIONS) {
    process.stdout.write(`Deleting ${name}… `);
    stats[name] = await deleteCollection(db, name);
    console.log(`${stats[name]} docs`);
  }

  process.stdout.write('Deleting student user profiles… ');
  const usersSnap = await db.collection('users').get();
  let deletedUsers = 0;
  for (const doc of usersSnap.docs) {
    if (isProtectedUser(doc.data())) continue;
    await doc.ref.delete();
    deletedUsers += 1;
  }
  stats.users = deletedUsers;
  console.log(`${deletedUsers} docs`);

  process.stdout.write('Deleting Firebase Auth accounts (except admin)… ');
  let deletedAuth = 0;
  let pageToken;
  do {
    const list = await auth.listUsers(1000, pageToken);
    for (const user of list.users) {
      if (user.email?.toLowerCase() === ADMIN_EMAIL) continue;
      await auth.deleteUser(user.uid);
      deletedAuth += 1;
    }
    pageToken = list.pageToken;
  } while (pageToken);
  stats.authUsers = deletedAuth;
  console.log(`${deletedAuth} accounts`);

  console.log('');
  console.log('Purge complete. Admin account preserved.');
  console.log(JSON.stringify(stats, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Purge failed:', error.message);
    console.error('');
    console.error('Run: firebase login && gcloud auth application-default login');
    process.exit(1);
  });
