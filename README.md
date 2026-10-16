# ⚡ Aptitude Arcade

An interactive, enterprise-grade **12-Day Aptitude Preparation Series + Grand Finale** web portal featuring full AI-assisted exam proctoring, server-side anti-cheat scoring, real-time analytics, and an administrative command center.

Built with **React 19**, **Vite 8**, **Tailwind CSS v4**, and backed by **Firebase (Firestore, Authentication, and Cloud Functions Gen 2)**.

---

## 🌟 Key Features

### 🎓 Student Experience & Learning Track
- **12-Day Progressive Syllabus**: Daily curated question sets covering Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Data Interpretation.
- **Grand Finale Assessment**: A comprehensive finale test unlocking for qualified candidates with extended question pools and strict time limits.
- **Immediate Feedback & Analytics**: Post-test review displaying performance scorecards, percentage benchmarks, and solution breakdowns.
- **Modern UI & Micro-Interactions**: Dark mode, glassmorphism design, and fluid transitions powered by Tailwind CSS v4 and Framer Motion.

### 🛡️ Exam Proctoring & Integrity Guard
- **Webcam Monitoring**: Active camera feed verification before and during assessments.
- **Full-Screen Enforcement**: Automatic detection when exiting full-screen mode.
- **Tab-Switch & Blur Detection**: Real-time tracking of browser window unfocus/tab switching (strict violation threshold triggers automatic exam submission).
- **Face-Turn & Motion Warnings**: Visual proctor alerts if a candidate leaves the frame.

### 🔒 Zero-Trust Architecture & Server-Side Scoring
- **Secret Answer Keys**: Question answer keys **never touch the client bundle**. They reside solely within Cloud Functions.
- **Server-Graded Submissions**: The frontend only receives sanitized questions without answers; upon submission, the `submitExam` Cloud Function scores the exam in an isolated runtime and records verifiable results.
- **Granular Security Rules**: Firestore security rules restrict users to reading their own profiles and results, completely blocking direct client tampering with scores or metrics.

### 📊 Real-Time Admin Command Center
- **Live Candidate Monitor**: Real-time Firestore snapshot listeners showing active test-takers and current question indices.
- **Flagged Session Inspector**: Immediate flags for proctoring violations (excessive tab changes, warnings).
- **Cohort Heatmaps & Aggregated Metrics**: Automated calculation of average scores, pass counts, and participation rates.
- **User Management & Rescheduling**: Granular administrative controls to grant re-test attempts, reset progress, or suspend users.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, React Router v7 |
| **Build Tool & Bundler** | Vite 8 |
| **Styling & Design** | Tailwind CSS v4 (`@tailwindcss/vite`), Vanilla CSS |
| **Animations & Icons** | Framer Motion, Lucide React |
| **Authentication** | Firebase Authentication (Email/Password, Roll Number / Identifier login) |
| **Database** | Google Cloud Firestore |
| **Backend & APIs** | Cloud Functions for Firebase (2nd Gen, Node.js runtime) |
| **Secondary Backup (Optional)** | Google Apps Script Web App (syncs results to Google Sheets) |

---

## 📁 Project Structure

```text
Aptitude_arcade/
├── functions/                     # Firebase Cloud Functions (2nd Gen)
│   ├── index.js                   # Callable endpoints (startExam, submitExam, etc.)
│   ├── questions/                 # Authoritative question banks & answer keys (Day 1-12, Finale)
│   └── scripts/                   # Backend seed scripts & data purgers
├── src/
│   ├── components/                # Modular UI components (Admin, Layout, Proctoring)
│   ├── context/                   # React Contexts (AuthContext, StudentProgress, Theme)
│   ├── data/                      # Client-side syllabus, tutorials, schedule configs
│   ├── pages/                     # Routed views (Dashboard, Exam, Results, Admin, Login)
│   ├── services/                  # Firestore & admin real-time listener services
│   └── utils/                     # Firebase initialization & client helpers
├── firebase.json                  # Firebase configuration
├── firestore.rules                # Production security access control rules
└── firestore.indexes.json         # Query optimization indexes
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 20 LTS or higher
- **Firebase CLI**:
  ```bash
  npm install -g firebase-tools
  ```

### 1. Installation
Clone the repository and install dependencies for both the frontend and Cloud Functions:

```bash
git clone https://github.com/Dharshan-2307/Aptitide_Arcade.git
cd Aptitide_Arcade

# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions && npm install && cd ..
```

### 2. Environment Configuration
Create a `.env` file in the root directory based on your Firebase project web app configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Optional secondary sheet sync
VITE_GOOGLE_SHEET_URL=your_apps_script_url
```

### 3. Run Locally

```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚙️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Launches the local Vite development server with HMR. |
| `npm run build` | Compiles and bundles production frontend assets into `/dist`. |
| `npm run preview` | Locally preview the built production bundle. |
| `npm run lint` | Runs ESLint across the codebase. |
| `npm run seed:admin` | Assigns the `admin: true` custom claim to a target user UID. |
| `npm run purge:all` | Admin utility to purge test data and wipe collections (use with caution). |

---

## 🛡️ Security Architecture

```
Client (React App)                 Backend (Cloud Functions & Firestore)
──────────────────                 ─────────────────────────────────────
1. startExam(testKey)      ───►   Verifies user eligibility & reschedule flags
                                  Creates session in exam_sessions/{uid}
                           ◄───   Returns questions (ANSWERS STRIPPED)

2. submitExam(answers)     ───►   Fetches official answer key server-side
                                  Grades score, computes percentile & violations
                                  Atomic transaction writes to results/{testKey}_{uid}
                                  Updates aggregate metrics/{testKey}
                           ◄───   Returns grade summary & score

3. Admin Real-Time View    ◄───   Protected by Custom Claims (`admin: true`)
                                  Subscribed to live Firestore snapshots
```

---

## 🚢 Deployment

### 1. Deploy Cloud Functions & Security Rules
```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# Deploy 2nd Gen Cloud Functions
firebase deploy --only functions
```

### 2. Deploy Frontend to Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

---

## 📄 License
Private and confidential. Built for institutional aptitude assessments and training series.
