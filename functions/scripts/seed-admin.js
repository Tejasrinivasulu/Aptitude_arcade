/**
 * Creates the default admin account in Firebase Auth and grants the admin claim.
 *
 * Usage (from project root, after `firebase login`):
 *   node functions/scripts/seed-admin.js
 *
 * Requires Application Default Credentials — run once:
 *   firebase login
 *   gcloud auth application-default login
 * Or set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON path.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const ADMIN_EMAIL = 'admin@aptitudearcade.com';
const ADMIN_PASSWORD = 'arcade@123';

function getProjectId() {
  try {
    const firebasercPath = path.resolve(__dirname, '../../.firebaserc');
    const config = JSON.parse(fs.readFileSync(firebasercPath, 'utf8'));
    return config.projects?.default;
  } catch {
    return process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
  }
}

async function main() {
  const projectId = getProjectId();
  if (!projectId) {
    throw new Error('Could not determine Firebase project ID. Run from the project root after configuring .firebaserc.');
  }

  if (!admin.apps.length) {
    admin.initializeApp({ projectId });
  }

  const auth = admin.auth();
  const db = admin.firestore();

  let user;
  try {
    user = await auth.getUserByEmail(ADMIN_EMAIL);
    await auth.updateUser(user.uid, { password: ADMIN_PASSWORD });
    console.log('Updated password for existing admin user.');
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }
    user = await auth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      emailVerified: true,
      displayName: 'System Admin',
    });
    console.log('Created new admin user.');
  }

  await auth.setCustomUserClaims(user.uid, { admin: true });

  await db.collection('users').doc(user.uid).set(
    {
      fullName: 'System Admin',
      email: ADMIN_EMAIL.toLowerCase(),
      rollNumber: 'ADMIN001',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    { merge: true }
  );

  console.log('');
  console.log('Admin account ready:');
  console.log('  URL:      /admin');
  console.log('  Email:    ', ADMIN_EMAIL);
  console.log('  Password: ', ADMIN_PASSWORD);
  console.log('  UID:      ', user.uid);
  console.log('');
  console.log('Sign in at /admin with the credentials above.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed admin:', error.message);
    console.error('');
    console.error('Run these commands first:');
    console.error('  firebase login');
    console.error('  gcloud auth application-default login');
    console.error('');
    console.error('Or deploy functions and call bootstrapDefaultAdmin from Firebase once.');
    process.exit(1);
  });
