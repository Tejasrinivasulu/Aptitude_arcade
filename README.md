# Aptitude Arcade

A **7-day aptitude test series + Grand Finale** web app with exam proctoring (camera, fullscreen, tab-switch monitoring), built with React 19 + Vite + Tailwind v4, powered by Firebase.

## Features

- **7-day structured learning plan** with daily tests (20 questions, 20 minutes each)
- **Grand Finale** assessment (50 questions, 60 minutes) after completing all daily tests
- **Exam proctoring**: camera monitoring, fullscreen enforcement, tab-switch detection (3 violations = auto-submit), face-turn warnings
- **Server-side scoring**: answer keys never leave the server; Cloud Functions compute scores
- **Real-time admin dashboard**: live exam sessions, performance heatmap, flagged sessions, user management
- **Firebase Authentication**: email/password login, supports login by email, roll number, or full name
- **Google Sheets backup**: optional secondary sink for exam results

## Tech Stack

- **Frontend**: React 19, Vite 8, React Router 7, Tailwind CSS v4, Lucide React
- **Backend**: Firebase Authentication, Cloud Firestore, Cloud Functions (2nd gen)
- **Icons**: Lucide React
- **Hosting**: Firebase Hosting (recommended)

## Prerequisites

- **Node.js 20** (LTS)
- **Firebase CLI**: `npm install -g firebase-tools`
- A Firebase project with:
  - Authentication (Email/Password provider enabled)
  - Cloud Firestore
  - Cloud Functions (Blaze plan required)

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/Dharshan-2307/Aptitide_Arcade.git
cd Aptitide_Arcade
npm install
cd functions && npm install && cd ..
```

### 2. Firebase Configuration

```bash
# Login to Firebase
firebase login

# Initialize (skip if firebase.json already exists)
# Update .firebaserc with your project ID
```

Edit `.firebaserc` and replace `YOUR_FIREBASE_PROJECT_ID` with your actual Firebase project ID.

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase web config:

```bash
cp .env.example .env
```

Get these values from your Firebase Console → Project Settings → General → Your apps → Web app.

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Optional
VITE_GOOGLE_SHEET_URL=your_apps_script_url
```

### 4. Deploy Firebase Resources

```bash
# Deploy security rules, indexes, and Cloud Functions
firebase deploy --only firestore:rules,firestore:indexes,functions
```

### 5. Seed the First Admin

The first admin must be set up manually. After creating a user account (register in the app), run this script:

```bash
# Create functions/scripts/seed-admin.js or use the Firebase CLI
node -e "
const admin = require('firebase-admin');
admin.initializeApp();
admin.auth().setCustomUserClaims('PASTE_THE_UID_HERE', { admin: true })
  .then(() => console.log('Admin claim set!'))
  .catch(console.error);
"
```

Or use the Firebase Admin SDK in a local script:

```js
// functions/scripts/seed-admin.js
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const UID = 'PASTE_THE_USER_UID_HERE';

admin.auth().setCustomUserClaims(UID, { admin: true })
  .then(() => {
    console.log(`✅ Admin claim set for UID: ${UID}`);
    console.log('The user must sign out and sign back in for the claim to take effect.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error setting admin claim:', err);
    process.exit(1);
  });
```

Find the user's UID in the Firebase Console → Authentication → Users.

### 6. Run Locally

```bash
npm run dev
```

### 7. Build for Production

```bash
npm run build
```

### 8. Deploy Frontend (Optional)

If using Firebase Hosting:

```bash
# Add hosting config to firebase.json first
firebase deploy --only hosting
```

## Architecture

```
Client (React SPA)              Server (Cloud Functions)
─────────────────              ─────────────────────────
startExam(testKey) ─────────►  Verify eligibility
                               Create exam_sessions/{uid}
                   ◄─────────  Return questions (NO answers)

submitExam(answers) ────────►  Score server-side
                               Write results/{testKey}_{uid}
                               Update user.attemptedTests
                               Increment metrics/{testKey}
                   ◄─────────  Return score + result

Admin Dashboard ◄───onSnapshot  Firestore (results, metrics,
                                exam_sessions, users)
```

## Firestore Collections

| Collection | Purpose |
|---|---|
| `users/{uid}` | User profiles (no passwords) |
| `results/{testKey}_{uid}` | Exam results with scores |
| `exam_sessions/{uid}` | Active exam sessions |
| `metrics/{testKey}` | Aggregate counters for heatmap |
| `system_logs/{auto}` | Audit/violation logs |

## Security

- **Answer keys** live only in Cloud Functions (`functions/questions/`), never in the client bundle
- **Scoring** happens server-side in the `submitExam` Cloud Function
- **Security Rules** enforce:
  - Students can only read their own data
  - No direct client writes to results, sessions, or metrics
  - Admin operations require the `admin` custom claim
- **Firebase API key is public** (by design) — security comes from Rules + Admin SDK

## Google Apps Script (Optional)

The `google-apps-script/exam-results.gs` file can be deployed as a Google Apps Script Web App to create a secondary backup of exam results in a Google Sheet. This is optional — Firestore is the system of record.

## Development

```bash
# Run frontend dev server
npm run dev

# Lint
npx eslint src/

# Build
npm run build
```

## License

Private project.
