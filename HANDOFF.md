# Aptitude Arcade — Implementation Handoff Document

> **Status:** WORK IN PROGRESS. This document tracks what has been completed and what remains.
> **Repo location:** `C:\Users\samee\Downloads\Aptitide_Arcade`
> **Cloned from:** https://github.com/Dharshan-2307/Aptitide_Arcade
> **Last updated:** 2026-06-22
> **Who should read this:** An AI or engineer picking up the implementation mid-stream. Read the whole document before writing any code — the architecture decisions are interdependent.

---

## 0. TL;DR — What you are picking up

This is an **Aptitude Arcade** — a React 19 + Vite + Tailwind v4 single-page app for a 7-day aptitude test series + Grand Finale, with exam proctoring (camera, fullscreen, tab-switch monitoring). The original code was a client-only SPA storing everything in `localStorage` with a split-brain Firebase fallback and plaintext passwords. It was NOT capable of supporting 200 concurrent users honestly.

The user (the project owner) approved an implementation plan with these four decisions — **all four are binding, do not change them without re-asking the owner**:

1. **Backend target:** Use Firebase properly (Firestore + Security Rules + Cloud Functions). No separate Node/Express server.
2. **Auth model:** Switch to **Firebase Authentication** (email/password). Firestore stores profile fields only (rollNumber, branch, etc.). No password field anywhere.
3. **Consistency goal (TOP PRIORITY):** When a student submits an exam, the admin dashboard must see it LIVE with correct cohort average, heatmap, and real rank. Today the admin dashboard reads the operator's own `localStorage` — that is the #1 bug to kill.
4. **Anti-cheat:** **Server-side scoring**. The answer key must live ONLY in Cloud Functions. The client sends selected answers; the server computes the score. The client must NEVER contain the answer key in its bundle.

**The work is organized into 5 phases. Phase 1 is complete. Phase 2 is partially complete (question banks for days 1–6 done). Phases 3, 4, 5 are not started.** Detailed status in Section 4.

---

## 1. Project context (read this to understand the domain)

### 1.1 What the app does

- Students register, log in, and follow a **7-day learning plan**, one aptitude topic per day:
  - Day 1: Number Systems
  - Day 2: Commercial Mathematics (Profit & Loss, Ratio, SI/CI)
  - Day 3: Time-Based Problems (Time & Work, Speed/Distance)
  - Day 4: Logical Reasoning Basics (Coding-Decoding, Blood Relations, Directions)
  - Day 5: Advanced Logical Reasoning (Series, Seating Arrangements)
  - Day 6: Advanced Quantitative (Permutations & Combinations, Probability)
  - Day 7: Data Analysis & Revision (Data Interpretation)
  - Finale: Grand Finale Assessment (50 questions, all topics)
- Each day has a **daily test** (20 questions, 20 minutes) that opens in a scheduled time window (default 9:00 AM–11:50 PM IST on the assigned calendar day).
- After completing all 7 daily tests, the **Grand Finale** unlocks (50 questions, 60 minutes).
- The exam experience is proctored: requires camera, fullscreen, monitors tab switches (3 violations = auto-submit) and face-turn warnings.
- Students see per-question review after submitting.
- Admins see a dashboard with: total registered students, live exam sessions, average system score, flagged sessions, performance heatmap, live activity feed, user list with overrides (reset attempt, suspend, etc.), system logs, and a (currently fake) content manager.

### 1.2 Tech stack (current, after Phase 1 changes)

- **Frontend:** React 19, Vite 8, React Router 7, Tailwind v4 (via `@tailwindcss/vite`), `lucide-react` icons.
- **Backend (target):** Firebase Auth + Cloud Firestore + Cloud Functions (2nd gen, callable) + Security Rules.
- **Secondary sink (optional, keep):** Google Apps Script Web App that appends exam results to a Google Sheet. File: `google-apps-script/exam-results.gs`. The env var `VITE_GOOGLE_SHEET_URL` points at the deployed Apps Script URL. This stays as a non-authoritative backup — Firestore is the system of record.
- **No test framework configured.** No CI. Lint via ESLint (`eslint.config.js`).

### 1.3 Environment & secrets

- `.env` (gitignored) holds `VITE_FIREBASE_*` keys and `VITE_GOOGLE_SHEET_URL`.
- `.env.example` currently only documents `VITE_GOOGLE_SHEET_URL` — **it needs to be updated** to list the Firebase keys (see Task 4.4).
- All `VITE_`-prefixed vars are **embedded in the client bundle** and therefore public. The Firebase web API key is intentionally public (it only identifies the project); real security comes from Security Rules + the Admin SDK in Cloud Functions. The Google Sheet URL is borderline sensitive — Phase 4 moves it server-side.
- Platform is Windows; shell is `cmd.exe`. Paths in this doc use backslashes for Windows but the code uses forward slashes (ESM imports).

### 1.4 How the app is wired together

```
src/
  App.jsx                      # Routes. Providers: ThemeProvider > AuthProvider > StudentProgressProvider
  main.jsx                     # ReactDOM root
  context/
    AuthContext.jsx            # ✅ DONE (Phase 1) — Firebase Auth + onAuthStateChanged
    StudentProgressContext.jsx # ⏳ PENDING (Phase 2) — currently localStorage-only, must sync to Firestore
    ThemeContext.jsx           # unchanged
  utils/
    firebase.js                # ✅ DONE (Phase 1) — exports { app, auth, db, isFirebaseReady }
    storage.js                 # ✅ DONE (Phase 1) — gutted to thin UID cache only
    validation.js              # ✅ DONE (Phase 1) — format-only (uniqueness is async now)
    googleSheets.js            # unchanged, stays as optional secondary sink
  services/
    adminService.js            # ⏳ PENDING (Phase 2) — must add listenToResults, rewrite listenToOverviewMetrics
  data/
    testSchedule.js            # unchanged — schedule/window/countdown logic (single source for test dates)
    dailyLearningPlan.js       # unchanged — learning content (tutorials, practice links)
    examQuestions.js           # ⏳ PENDING (Phase 2) — must strip answer keys from client bundle
  pages/
    LandingPage.jsx            # unchanged
    SignUp.jsx                 # ✅ DONE (Phase 1) — Firebase Auth createUser + Firestore profile w/ rollback
    Login.jsx                  # ✅ WORKS AS-IS with new AuthContext (login() signature unchanged)
    ForgotPassword.jsx         # ✅ DONE (Phase 1) — Firebase sendPasswordResetEmail
    Dashboard.jsx              # ⏳ PENDING (Phase 5) — has a hardcoded 2026-06-23 countdown to remove
    Learn.jsx                  # unchanged
    TakeTest.jsx               # unchanged (UI only; uses testSchedule)
    Exam.jsx                   # ⏳ PENDING (Phase 2) — must call startExam/submitExam Cloud Functions
    Results.jsx                # ⏳ PENDING (Phase 2) — must read rank/results from Firestore, not just location.state
    Profile.jsx                # ⏳ PENDING (Phase 5) — password change is a mock, wire to Firebase updatePassword
    HelpCenter.jsx             # unchanged
    AdminDashboard.jsx         # ⏳ PENDING (Phase 2) — must use live Firestore data, remove hardcoded master123
    PlaceholderPage.jsx        # unchanged
  components/
    ProtectedRoute.jsx         # ✅ WORKS AS-IS with new AuthContext (reads isAuthenticated/loading)
    layout/{Navbar,Sidebar,DashboardLayout}.jsx  # unchanged
    exam/ProctorCamera.jsx     # unchanged
    dashboard/TestVerificationModal.jsx           # unchanged
    TestCountdown.jsx          # unchanged
    RegistrationSuccessModal.jsx                  # unchanged
    AuthInput.jsx, AuthCardLayout.jsx,
    PasswordInput.jsx, DarkModeToggle.jsx         # unchanged
  hooks/
    useExamSecurity.js         # unchanged — camera/fullscreen/tab monitoring (KEEP)
    useFaceMonitoring.js       # unchanged — face-turn warnings (KEEP)

functions/                     # ⏳ PENDING (Phase 2) — NEW directory, partially scaffolded
  questions/
    day1.js ... day6.js        # ✅ DONE — 20 questions each, server-side answer keys
    day7.js                    # ⏳ PENDING — needs 20 Data Interpretation questions
    finale.js or builder       # ⏳ PENDING — finale = 50 Q drawn from all days (see Task 2.1.8)
  index.js                     # ⏳ PENDING — the actual callable functions
  package.json                 # ⏳ PENDING

google-apps-script/exam-results.gs  # unchanged (optional secondary sink)
firestore.rules                # ⏳ PENDING (Phase 4) — NEW file
firestore.indexes.json         # ⏳ PENDING (Phase 3) — NEW file
firebase.json                  # ⏳ PENDING (Phase 2) — NEW file
.firebaserc                    # ⏳ PENDING (Phase 2) — NEW file
```

---

## 2. The approved implementation plan (the full design)

This is the plan the owner signed off on. Do not deviate without asking. Each phase has explicit tasks in Section 4.

### Phase 1 — Establish a single source of truth (data consistency) ✅ DONE
- Rework `firebase.js` to initialize Auth + Firestore, clean `isFirebaseReady()`.
- Delete the fake-token/localStorage user store in `storage.js`.
- Rewrite `AuthContext` on Firebase Auth with `onAuthStateChanged`. Keep "login by email/roll/fullName" UX by resolving the identifier to an email via Firestore query, then calling `signInWithEmailAndPassword`.
- Rewrite `SignUp` to create the Auth user first, then the Firestore profile, rolling back the Auth user if the profile write fails (no orphans). No password in Firestore.
- Rewrite `ForgotPassword` to use Firebase `sendPasswordResetEmail`.
- Strip uniqueness checks from `validation.js` (now async against Firestore).

### Phase 2 — Server-side scoring & live results (TOP PRIORITY) ⏳ IN PROGRESS
- Add Cloud Functions at `functions/` with three HTTPS Callable functions:
  - `startExam({ testKey })` — inside a Firestore transaction, verify eligibility (correct day, not already attempted, window open, finale requires all 7 done), create `exam_sessions/{uid}` doc with `startedAt` + deadline, return questions **without answer keys**.
  - `submitExam({ testKey, answers, sessionId, violations })` — re-derive answer key server-side, compute score, and in one transaction write `results/{testKey}_{uid}` + update user's `attemptedTests` summary + atomically increment `metrics/{testKey}` counters. Idempotent on `sessionId`. Returns score.
  - `adminAction({ action, uid, ... })` — admin-only (custom `admin` claim) override endpoints: reset attempt, suspend/unsuspend, etc.
- Answer keys live ONLY in `functions/questions/dayN.js`. Each of the 7 days has a distinct question bank matching its topic. Finale = 50 questions sampled across all 7 banks.
- Strip the client `examQuestions.js` to display-only metadata (no `options`/`answer`). Live question data comes from the `startExam` response.
- Rewrite `Exam.jsx` to call `startExam` then `submitExam`; score comes from the server.
- Make the admin dashboard truly live via `onSnapshot` listeners on `results` + `metrics` + `exam_sessions`.
- Compute rank server-side (or via a sorted listener) — `currentRank: 15` is hardcoded today and must go.
- Google Sheet upload stays as an optional secondary sink.

### Phase 3 — Hardening for 200+ concurrent users ⏳ PENDING
- All scoring + progress + metrics writes happen inside Firestore transactions (idempotent on `sessionId`).
- Exam start/end recorded in `exam_sessions`; `startExam` refuses a second open session for the same uid (closes the "two tabs, attempt twice" hole).
- `firestore.indexes.json` with composite indexes for: results by testKey+percentage (rank), users by rollNumber, users by email, exam_sessions by status+startedAt, system_logs by timestamp.
- Add `limit()` + `where()` to every listener so no listener pulls an entire growing collection. Admin lists already paginate in the UI.
- Switch one-shot `getDocs` to memoized `onSnapshot` with proper cleanup in `AuthContext`/`StudentProgressContext` to avoid duplicate-listener leaks under load.
- `submitExam` is idempotent (keyed on `sessionId`) so a network-blip retry can't double-score.
- Best-effort auto-submit on tab close via the existing `beforeunload` path.

### Phase 4 — Security Rules & secrets ⏳ PENDING
- `firestore.rules`:
  - `users/{uid}`: create by the signed-in user themselves; read own profile; admins read all. No password field.
  - `results/*`, `exam_sessions/*`, `system_logs/*`, `metrics/*`: read = admin only (custom claim); write = via Cloud Functions only (rules reject direct student writes because functions use the Admin SDK which bypasses rules).
  - Students can read only their own `results` rows.
- Move the Google Sheet URL and any admin secrets to Functions config / `firebase functions:secrets`.
- Update `.env.example` to document all keys.

### Phase 5 — Cleanup & verification ⏳ PENDING
- Remove the duplicated `2026-06-23T09:00` countdown in `Dashboard.jsx`; use `computeTestCountdown` from `testSchedule.js`.
- `AdminDashboard` hardcoded `master123` → Firebase Auth admin login + `admin` custom claim (set via a one-time function).
- Wire `Profile.jsx` password change to Firebase `updatePassword` (currently a mock `alert`).
- Update `README.md` with deploy steps.
- Run `npm install && npm run build` to confirm the frontend compiles.

---

## 3. Critical architectural rules (DO NOT VIOLATE)

These are the invariants the implementation must preserve. If you're tempted to break one, re-read the owner's four decisions in Section 0.

1. **The answer key never ships to the client.** `functions/questions/*.js` is the only place answers live. The client `src/data/examQuestions.js` must not contain `answer` (or `options` if you want to be strict). `startExam` returns `{ id, question, options }` per question — never `answer`.
2. **Scoring happens only in `submitExam` (Cloud Function).** The current `Exam.jsx` does `answers.reduce(...)` client-side — that must be deleted. The score in the UI must come from the function's return value (and/or a Firestore read of the written `results` doc).
3. **One user store.** Firebase Auth owns credentials. Firestore `users/{uid}` owns profile fields. There is no user list in `localStorage` anymore. `storage.js` only caches a UID for optimistic UI.
4. **No plaintext passwords anywhere.** Not in Firestore, not in localStorage, not in the Apps Script payload. The Apps Script `exam-results.gs` `doPost` does not receive a password field — keep it that way.
5. **The admin dashboard's numbers come from Firestore collections (`users`, `results`, `exam_sessions`, `metrics`), never from the operator's `localStorage`.** This is the owner's #1 priority. The current `AdminDashboard` reads `localStorage.getItem('aptitude_student_progress')` for the average — that line must be deleted.
6. **Transactions for any multi-document write.** `submitExam` writes to `results` + `users.attemptedTests` + `metrics` — all inside one `db.runTransaction()`. 200 students submitting simultaneously must not corrupt counts.
7. **Idempotency on `sessionId`.** `submitExam` keyed on the `exam_sessions/{uid}` sessionId so a retry can't double-score or double-count.
8. **Firebase web API key being public is fine.** Don't try to "hide" it. Security is Rules + Admin SDK. If you find yourself wanting to put it server-side, you're misunderstanding Firebase.
9. **Keep the proctoring hooks (`useExamSecurity`, `useFaceMonitoring`) and the camera/fullscreen UI.** They're not broken. Violation counts get passed into `submitExam` as `violations` and persisted.
10. **Don't delete `google-apps-script/exam-results.gs`.** It's an optional secondary sink the owner may still want.

---

## 4. Detailed task list with exact status

Legend: ✅ DONE · ⏳ PENDING · 🔧 PARTIAL

### Phase 1 — Single source of truth ✅ ALL DONE

#### Task 1.1 ✅ `src/utils/firebase.js` — DONE
Rewritten to initialize Auth + Firestore with `getApps()` guard (prevents Vite HMR double-init). Exports `{ app, auth, db, isFirebaseReady }`. `isFirebaseReady()` requires both an apiKey (not the `YOUR_API_KEY` placeholder) AND a projectId. Analytics intentionally NOT initialized (it crashes on projects without measurementId and isn't needed). When not configured, logs a warning and exports nulls — downstream code must null-check `auth`/`db`.

**Full current content of the file:**
```js
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export function isFirebaseReady() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
      firebaseConfig.projectId
  );
}

let app = null, auth = null, db = null;
if (isFirebaseReady()) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  console.warn('⚠️ Firebase not configured ...');
}
export { app, auth, db };
```

#### Task 1.2 ✅ `src/utils/storage.js` — DONE
Gutted. No more `getUsers`/`saveUser`/`findUserByLogin`/`generateToken`/`parseToken`/`setAuthSession`/`getAuthSession`. Replaced with: `setRememberChoice`, `getRememberChoice`, `cacheUid`, `getCachedUid`, `clearAuthCache`. The UID cache lives in localStorage (if "remember me") or sessionStorage (otherwise) and is explicitly non-authoritative — only for optimistic UI on reload before `onAuthStateChanged` fires.

#### Task 1.3 ✅ `src/context/AuthContext.jsx` — DONE
- Subscribes to `onAuthStateChanged` once in a `useEffect` (single source of truth for login state across tabs/reloads).
- On auth user, reads `users/{uid}` profile from Firestore, fetches a JWT via `getIdToken()`.
- `login(loginId, password, remember)`: calls `resolveLogin` to map email/roll/fullName → email via Firestore queries (`where('email'=='...')`, then `where('rollNumber'=='...')`, then `where('fullName'=='...')`), then `signInWithEmailAndPassword`. Maps Firebase error codes to friendly messages (`auth/invalid-credential` → "Invalid password.", `auth/user-disabled` → "This account has been suspended.", etc.).
- `logout()`: `signOut` + clearAuthCache.
- Context value: `{ user, token, loading, login, logout, isAuthenticated, optimisticUid }`.
- Removed the artificial 800ms `setTimeout`.

**Important:** The `login()` signature is unchanged from the original, so `Login.jsx` works without modification. The `Login.jsx` page currently labels the input "Full Name" but it actually accepts email/roll/fullName — that's intentional and preserved.

#### Task 1.4 ✅ `src/pages/SignUp.jsx` — DONE
- Imports `createUserWithEmailAndPassword`, `signInWithEmailAndPassword` from `firebase/auth`; `collection/doc/getDocs/query/where/limit/setDoc` from `firebase/firestore`; `auth, db` from `../utils/firebase`.
- Removed the `getUsers, saveUser` import from storage.
- `validateForm()` does **format-only** checks (no localStorage uniqueness — that's async now).
- `checkUniqueness()` is a new async method that queries Firestore for existing email/rollNumber before creating the Auth user.
- `handleSubmit()` flow:
  1. `validateForm()` (format).
  2. Null-check `auth`/`db` → if missing, show "Firebase is not configured" error.
  3. `checkUniqueness()` → if email/roll exists, set field errors and bail.
  4. `createUserWithEmailAndPassword(auth, email, password)` → map error codes (`auth/email-already-in-use`, `auth/weak-password`).
  5. `setDoc(doc(db, 'users', uid), profile)` where profile has NO password field.
  6. **If the profile write fails, delete the Auth user** (`firebaseUser.user.delete()`) to avoid an orphan, then surface an error. This is the key fix for the split-brain.
  7. Auto sign-in so the student doesn't re-type credentials.
  8. Show `RegistrationSuccessModal` → on proceed, navigate to `/student/dashboard` (was `/login`; changed because we auto-sign-in).
- Added a `errors._general` display block above the form for top-level errors.

#### Task 1.5 ✅ `src/utils/validation.js` — DONE
All validators are now format-only. The `existingUsers` parameter has been removed from signatures (it was previously used for uniqueness; that's async against Firestore now). `validateRollNumber` gained a minimum-length check (≥3 chars). `validatePassword`, `validatePhone`, `validateConfirmPassword`, `validateRequired`, `getPasswordStrength` unchanged in behavior.

#### Task 1.6 ✅ `src/pages/ForgotPassword.jsx` — DONE
Rewired to `sendPasswordResetEmail` from `firebase/auth`. Form now has state (`email`, `loading`, `sent`, `error`), a loading spinner, and a success state ("Reset link sent! Check your inbox at …"). Kept the glassmorphism layout and mouse spotlight. The copy was updated from "OTP" to "reset link" because Firebase sends a link, not an OTP.

#### Task 1.7 ✅ `src/pages/Login.jsx` — NO CHANGES NEEDED
Works as-is with the new `AuthContext`. The `login(loginId, password, remember)` signature is preserved. The page still says "Full Name" as the placeholder but accepts email/roll/fullName (intentional).

#### Task 1.8 ✅ `src/components/ProtectedRoute.jsx` — NO CHANGES NEEDED
Reads `isAuthenticated` and `loading` from `useAuth()` — both still provided by the new context.

---

### Phase 2 — Server-side scoring & live results ⏳ IN PROGRESS (~25% done)

#### Task 2.1.1 ✅ `functions/questions/day1.js` — DONE
20 Number Systems questions (HCF/LCM, primes, divisibility, unit digits, remainders, factors). Each item: `{ id, question, options: [4 strings], answer: <0-3 index> }`.

#### Task 2.1.2 ✅ `functions/questions/day2.js` — DONE
20 Commercial Math questions (the original percentage/profit/loss bank, augmented with SI/CI and ratio).

#### Task 2.1.3 ✅ `functions/questions/day3.js` — DONE
20 Time & Work / Speed-Distance questions.

#### Task 2.1.4 ✅ `functions/questions/day4.js` — DONE
20 Coding-Decoding / Blood Relations / Directions questions.

#### Task 2.1.5 ✅ `functions/questions/day5.js` — DONE
20 Series / Seating Arrangement questions.

#### Task 2.1.6 ✅ `functions/questions/day6.js` — DONE
20 Permutations/Combinations/Probability questions.

#### Task 2.1.7 ⏳ `functions/questions/day7.js` — PENDING
Needs 20 Data Interpretation questions. Day 7 topic is "Data Interpretation & Complete Revision". Since DI typically needs charts/tables, write questions that describe a small table inline in the question text (e.g., "A table shows sales of 5 products: A=100, B=150, C=200, D=250, E=300. What is the average?"). Mix in some revision questions from prior topics. Match the exact schema: `{ id, question, options: [4], answer: <index> }`. Export via `module.exports = questions;` (CommonJS — see Task 2.2 note).

#### Task 2.1.8 ⏳ Finale question builder — PENDING
Two options (pick one, document in code):
- **Option A (simpler):** A `functions/questions/finale.js` that imports all 7 day banks and returns 50 questions by concatenating + slicing. Roughly: take ~7 from each of days 1–7 (7×7=49) + 1 extra = 50. Re-id 1..50.
- **Option B (better):** Hand-author a distinct 50-question finale bank.
Recommend Option A for time; the original code did exactly this (`buildFinaleQuestions` tripled the single bank and sliced to 50).

#### Task 2.2 ⏳ `functions/index.js` — PENDING (THE BIG ONE)
This is the core of Phase 2. Create a 2nd-gen Cloud Functions entrypoint. Use the Firebase Admin SDK (bypasses Security Rules — that's how functions write to `results`/`metrics`/`exam_sessions` while students can't). Required exports:

```js
// Pseudocode for functions/index.js — fill in fully
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const logger = require('firebase-functions/logger');

initializeApp();  // Admin SDK auto-detects project from functions config
const db = getFirestore();

// Load question banks
const dayBanks = {
  1: require('./questions/day1'),
  2: require('./questions/day2'),
  // ... through 7
};
const finaleBank = require('./questions/finale'); // or build inline

const TEST_DURATIONS = { 1: 20*60, 2: 20*60, /* ... */ 7: 20*60, finale: 60*60 };
const TEST_QUESTION_COUNTS = { 1: 20, /* ... */ 7: 20, finale: 50 };

// --- Helper: return questions WITHOUT answer keys ---
function publicQuestions(questions) {
  return questions.map(({ id, question, options }) => ({ id, question, options }));
}

// --- startExam ---
exports.startExam = onCall(async (request) => {
  // request.auth.uid is the caller; null if not signed in
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');
  const uid = request.auth.uid;
  const { testKey } = request.data;
  const isFinale = testKey === 'finale';

  return db.runTransaction(async (tx) => {
    // 1. Read user profile + existing attempts + existing open session
    const userRef = db.collection('users').doc(uid);
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists) throw new HttpsError('not-found', 'Profile missing.');
    const user = userSnap.data();
    if (user.suspended) throw new HttpsError('permission-denied', 'Account suspended.');

    const attempted = user.attemptedTests || {};
    if (attempted[testKey] !== undefined) {
      throw new HttpsError('failed-precondition', 'Test already attempted.');
    }

    // 2. Eligibility
    if (isFinale) {
      for (let d = 1; d <= 7; d++) {
        if (attempted[String(d)] === undefined) {
          throw new HttpsError('failed-precondition', 'Complete all 7 daily tests first.');
        }
      }
    } else {
      const day = Number(testKey);
      // Optional: enforce currentDay schedule. The original has DEMO_SCHEDULE_BYPASS=true,
      // so you may skip strict day enforcement. Document your choice.
    }

    // 3. One open session per uid — refuse a second
    const sessionRef = db.collection('exam_sessions').doc(uid);
    const sessionSnap = await tx.get(sessionRef);
    if (sessionSnap.exists && sessionSnap.data().status === 'open') {
      // Allow resuming the SAME test; refuse a different one.
      const existing = sessionSnap.data();
      if (existing.testKey !== testKey) {
        throw new HttpsError('failed-precondition', 'Finish your current exam first.');
      }
      // Resume: return remaining time + same question set
      const remaining = Math.max(0, Math.floor((existing.deadline - Date.now()) / 1000));
      return {
        sessionId: existing.sessionId,
        testKey,
        questions: publicQuestions(existing.questions),
        totalQuestions: existing.questions.length,
        durationSeconds: remaining, // remaining, not full
        startedAt: existing.startedAt,
      };
    }

    // 4. New session
    const questions = isFinale ? finaleBank : dayBanks[Number(testKey)];
    const durationSeconds = TEST_DURATIONS[testKey] || (20 * 60);
    const sessionId = `${uid}_${testKey}_${Date.now()}`;
    tx.set(sessionRef, {
      uid,
      testKey,
      sessionId,
      questions,            // store full questions WITH answers here (server-only doc)
      startedAt: Date.now(),
      deadline: Date.now() + durationSeconds * 1000,
      status: 'open',
    });
    return {
      sessionId,
      testKey,
      questions: publicQuestions(questions),
      totalQuestions: questions.length,
      durationSeconds,
      startedAt: Date.now(),
    };
  });
});

// --- submitExam (idempotent on sessionId) ---
exports.submitExam = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');
  const uid = request.auth.uid;
  const { testKey, answers, sessionId, violations } = request.data;
  // answers = array of selected option indexes (or null), length = totalQuestions
  // violations = { tabViolations, faceWarnings, autoSubmit, submitReason }

  const sessionRef = db.collection('exam_sessions').doc(uid);
  const resultRef = db.collection('results').doc(`${testKey}_${uid}`);

  return db.runTransaction(async (tx) => {
    const [sessionSnap, existingResultSnap, userSnap] = await Promise.all([
      tx.get(sessionRef),
      tx.get(resultRef),
      tx.get(db.collection('users').doc(uid)),
    ]);

    // IDEMPOTENCY: if a result already exists for this session, return it.
    if (existingResultSnap.exists && existingResultSnap.data().sessionId === sessionId) {
      return existingResultSnap.data();
    }

    if (!sessionSnap.exists || sessionSnap.data().status !== 'open') {
      throw new HttpsError('failed-precondition', 'No active exam session.');
    }
    const session = sessionSnap.data();
    if (session.sessionId !== sessionId) {
      throw new HttpsError('failed-precondition', 'Session mismatch.');
    }

    // SERVER-SIDE SCORING
    const questions = session.questions; // has answer keys
    let score = 0;
    (answers || []).forEach((ans, idx) => {
      if (ans !== null && ans !== undefined && questions[idx] && ans === questions[idx].answer) {
        score++;
      }
    });
    const total = questions.length;
    const percentage = Math.round((score / total) * 100);

    // Read profile for denormalized fields
    const user = userSnap.exists ? userSnap.data() : {};

    const submittedAt = new Date().toISOString();
    const resultDoc = {
      uid,
      testKey,
      sessionId,
      fullName: user.fullName || '',
      email: user.email || '',
      rollNumber: user.rollNumber || '',
      branch: user.branch || '',
      score,
      total,
      percentage,
      performance: percentage >= 85 ? 'Excellent' : percentage >= 70 ? 'Good' : 'Improve',
      submittedAt,
      durationSeconds: session.durationSeconds || TEST_DURATIONS[testKey],
      tabViolations: violations?.tabViolations || 0,
      faceWarnings: violations?.faceWarnings || 0,
      autoSubmit: Boolean(violations?.autoSubmit),
      submitReason: violations?.submitReason || 'manual',
    };

    tx.set(resultRef, resultDoc);

    // Update user.attemptedTests summary (for quick reads)
    tx.update(db.collection('users').doc(uid), {
      [`attemptedTests.${testKey}`]: {
        score, total, percentage,
        performance: resultDoc.performance,
        submittedAt,
      },
    });

    // Atomic metrics counters for the heatmap
    const metricsRef = db.collection('metrics').doc(testKey);
    tx.set(metricsRef, {
      testKey,
      count: FieldValue.increment(1),
      totalScore: FieldValue.increment(score),
      totalPercentage: FieldValue.increment(percentage),
      passCount: FieldValue.increment(percentage >= 40 ? 1 : 0), // adjust pass threshold
      lastUpdated: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Close the session
    tx.update(sessionRef, { status: 'submitted', submittedAt, score, percentage });

    return resultDoc;
  });
});

// --- adminAction (admin claim required) ---
exports.adminAction = onCall(async (request) => {
  if (!request.auth?.token?.admin) {
    throw new HttpsError('permission-denied', 'Admin only.');
  }
  const { action, uid, testKey } = request.data;
  // Implement: resetAttempt, suspendUser, unsuspendUser, grantTimeExtension, etc.
  // resetAttempt: delete results/{testKey}_{uid}, remove users/{uid}.attemptedTests[testKey]
  // ...
});

// --- setAdminClaim (one-time, run from CLI or as a special function) ---
// Used to grant the admin custom claim to a specific uid.
```

**Notes for the implementer:**
- Use **CommonJS** (`require`/`module.exports`) in `functions/` — it's the simplest path for the Admin SDK and avoids ESM/CJS interop headaches in Cloud Functions runtime. The client app stays ESM.
- `onCall` from `firebase-functions/v2/https` automatically verifies the Firebase Auth user and exposes `request.auth.uid` / `request.auth.token`. Use this — do NOT roll your own token checking.
- The Admin SDK `getFirestore()` bypasses Security Rules. That's how the function can write to `results`/`metrics`/`exam_sessions` even though the rules forbid direct student writes.
- The `exam_sessions/{uid}` doc stores the FULL questions (with answers) so a resume works and so `submitExam` can re-derive the key. This doc is server-only (rules: read = admin, write = function-only).
- Decide & document the **pass threshold** (40% is a placeholder above; the existing `getPerformanceLevel` uses 85/70 for Excellent/Good but has no explicit "pass").
- Decide & document **schedule enforcement**. The original `testSchedule.js` has `DEMO_SCHEDULE_BYPASS = true`, so for now it's safe to NOT enforce the calendar window in `startExam` (the client already gates via `getTestAvailability`). If you want server-side enforcement too, port `getTestAvailability` logic into the function.

#### Task 2.3 ⏳ `functions/package.json` — PENDING
Minimal 2nd-gen functions package.json:
```json
{
  "name": "aptitude-arcade-functions",
  "main": "index.js",
  "engines": { "node": "20" },
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0"
  },
  "private": true
}
```
Use Node 20 (current LTS supported by Cloud Functions 2nd gen). After writing, the owner runs `cd functions && npm install`.

#### Task 2.4 ⏳ `firebase.json` + `.firebaserc` — PENDING
`firebase.json`:
```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs20"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```
`.firebaserc` (the owner fills in the real project id; use a placeholder):
```json
{
  "projects": {
    "default": "YOUR_FIREBASE_PROJECT_ID"
  }
}
```

#### Task 2.5 ⏳ `src/services/examService.js` — PENDING (NEW FILE)
Client-side callable wrappers. Use the modular SDK:
```js
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApps, getApp } from 'firebase/app';
import { app } from '../utils/firebase';

let functionsInstance = null;
function getFns() {
  if (!app) return null;
  if (!functionsInstance) {
    const { getFunctions } = require('firebase/functions'); // NOTE: use ESM import at top instead
    functionsInstance = getFunctions(app);
  }
  return functionsInstance;
}

export async function startExam(testKey) { /* httpsCallable(getFns(), 'startExam')({ testKey }) */ }
export async function submitExam(payload) { /* httpsCallable(getFns(), 'submitExam')(payload) */ }
```
Use proper ESM imports at the top of the file (the `require` above is illustrative only — the client is ESM). The functions region defaults to `us-central1`; if the owner deploys elsewhere, set the region in `onCall({ region: '...' })` and in `getFunctions(app, 'region')`.

#### Task 2.6 ⏳ `src/data/examQuestions.js` — PENDING
Strip the `examQuestions` array (with its `answer` keys) from the client bundle entirely. Keep only the metadata the UI needs for the schedule/countdown screens:
```js
export const EXAM_DURATION_SECONDS = 20 * 60;
export const EXAM_TOTAL_QUESTIONS = 20;
export const FINALE_DURATION_SECONDS = 60 * 60;
export const FINALE_TOTAL_QUESTIONS = 50;

export function getExamMeta(testKey) {
  if (testKey === 'finale') {
    return { testKey, title: 'Grand Finale Assessment', topicLabel: 'All Topics · Comprehensive Assessment', totalQuestions: 50, durationSeconds: 60*60, durationMinutes: 60 };
  }
  const day = Number(testKey);
  return { testKey: String(day), title: `Day ${day} Assessment`, topicLabel: `Day ${day} Aptitude Test`, totalQuestions: 20, durationSeconds: 20*60, durationMinutes: 20 };
}
```
Delete `buildFinaleQuestions` (it referenced the now-removed answer bank). `Exam.jsx` and `Results.jsx` import `getExamForTest` today — both must switch to `getExamMeta` and receive live question data from `startExam`.

#### Task 2.7 ⏳ `src/pages/Exam.jsx` — PENDING (BIG REWRITE)
Currently this file does client-side scoring (`answers.reduce`) and reads questions from `getExamForTest`. The rewrite:
1. On mount (after the existing `exam_verified` check), call `startExam(testKey)`. Show a loading state.
2. Store the returned `{ sessionId, questions, totalQuestions, durationSeconds }`. The questions here have NO answer key.
3. Replace `examConfig = useMemo(() => getExamForTest(testKey), ...)` with `getExamMeta(testKey)` for title/topic only; questions come from the function.
4. The countdown timer initializes from the returned `durationSeconds` (the function returns REMAINING seconds if resuming).
5. On submit / auto-submit / time-up / tab-limit, call `submitExam({ testKey, answers, sessionId, violations: { tabViolations, faceWarnings, autoSubmit, submitReason } })`. The SCORE comes from the response.
6. `markTestSubmitted` (StudentProgressContext) still gets called for the local cache, but the source of truth is the Firestore `results` doc written by the function.
7. Google Sheet upload stays — call `uploadExamResultToGoogleSheet` after a successful `submitExam` (best-effort, fire-and-forget).
8. The "HoldToSubmitButton", security hooks, camera/fullscreen UI — all stay. The submit flow just becomes async with a loading state.
9. `stopCameraRef` ordering must be preserved (the current code references `stopCameraRef.current?.()` inside `submitExam` before the ref is defined — it works because of hoisting via the ref object, but be careful in the rewrite).

**Gotcha:** the current `submitExam` in `Exam.jsx` references `stopCameraRef` before its declaration line. It works today because refs are objects, but a careless rewrite can break it. Keep the same ordering or hoist the ref.

#### Task 2.8 ⏳ `src/context/StudentProgressContext.jsx` — PENDING
Today this reads/writes ONLY `localStorage` (`aptitude_student_progress`). For data consistency it must ALSO subscribe to the user's Firestore `results` and reflect server-side scores. Plan:
1. Keep the local cache as an offline fallback / optimistic UI.
2. Add a `useEffect` that, when authenticated, subscribes via `onSnapshot(collection(db, 'results'), where('uid','==',user.id))` and rebuilds `attemptedTests` from the server docs. The server doc is authoritative; localStorage becomes a mirror.
3. `markTestSubmitted` still updates local state immediately (optimistic), but the function response is what confirms it. If they diverge, server wins.
4. **Real rank:** add a `useEffect` that, on each result, queries `results` for the same `testKey` sorted by percentage desc, finds the user's position, sets `currentRank`. (Or compute via a Cloud Function to avoid N reads.) Remove the hardcoded `currentRank: 15`.
5. Bump `PROGRESS_VERSION` (currently 3 → 4) so old caches invalidate cleanly.

**Note:** This context currently has NO access to the auth user (it's a sibling provider to AuthProvider). Either move it inside AuthProvider in `App.jsx`, or have it read `useAuth()` directly (it's already nested under AuthProvider in the tree, so `useAuth()` works).

#### Task 2.9 ⏳ `src/services/adminService.js` — PENDING
Add real listeners. Keep the existing three exports' signatures so `AdminDashboard` doesn't need a huge rewrite:
- `listenToUsers(cb)` — already real (`onSnapshot(collection('users'))`). Keep. Maybe add `where('suspended','==',false)` toggle later.
- `listenToResults(cb)` — **NEW**. `onSnapshot(query(collection('results'), orderBy('submittedAt','desc'), limit(200)))`.
- `listenToOverviewMetrics(cb)` — **REWRITE**. Currently returns empty arrays. New version:
  - Subscribe to `collection('metrics')` (one doc per testKey with count/totalScore/totalPercentage/passCount).
  - Subscribe to `collection('exam_sessions')` where status=='open' for live session count.
  - Subscribe to `collection('results')` where `autoSubmit == true || tabViolations >= 3` for flagged count.
  - Aggregate into `{ heatmap: [{day, topic, passRate}], liveSessions, flaggedCount, averageScore, totalResults, isLive: true }`.
- `listenToSystemLogs(cb)` — already real (`onSnapshot(collection('system_logs'))`). Keep. Add log writes from `submitExam` if you want violations to appear here (optional).

#### Task 2.10 ⏳ `src/pages/AdminDashboard.jsx` — PENDING
Critical fixes:
1. **DELETE the line `const savedProgress = localStorage.getItem('aptitude_student_progress')`** and the `totalAverage` computation from it. That's the bug — the admin sees the operator's own progress. Replace with `metricsData.averageScore` from the real listener.
2. **DELETE `if (password === 'master123')`** auth. Replace with Firebase Auth admin login: the admin signs in via a separate Firebase Auth account that has the `admin` custom claim. The login form calls `signInWithEmailAndPassword`; on success, verify the claim via `getIdTokenResult()` and refuse if `admin !== true`.
3. The "Average System Score" card → `metricsData.averageScore`.
4. The "Live Exam Sessions" card → `metricsData.liveSessions` (currently hardcoded `0`).
5. The "Flagged Sessions" card → `metricsData.flaggedCount`.
6. The heatmap → `metricsData.heatmap`.
7. The "Rescue Desk" reset/clear buttons → call `adminAction({ action: 'resetAttempt', uid, testKey })` instead of mutating localStorage.
8. The user list "Test Attempts" section should pull from `results` for the selected user, not the operator's localStorage. Either add a per-user results listener or read on selection.
9. Keep the skeleton loading, pagination, tabs, and visual design intact.

#### Task 2.11 ⏳ `src/pages/Results.jsx` — PENDING
Currently reads `location.state` (from the Exam submit navigation) and `progress.attemptedTests`. After the rewrite:
- Still accept `location.state` for the immediate post-submit view.
- But the authoritative source is Firestore. Add a listener for the user's `results` docs and reconcile. If `location.state` is absent (e.g., user navigated here directly), render from Firestore.
- The per-question review (`getExamForTest(selectedReviewKey)`) is a problem: the client no longer has the question bank. **Two options:**
  - **Option A:** Store the questions (without answers) and the user's answers in the `results` doc at submit time (the function already has them). Then review reads from Firestore.
  - **Option B:** Add a `getReview(testKey)` callable that returns the questions + the user's selected answers + correct answers (now that the exam is over, revealing answers is fine).
  - Recommend Option A — denormalize into the result doc. Update `submitExam` to store `{ questions: publicQuestions(...), userAnswers: answers, correctAnswers: questions.map(q=>q.answer) }`. Slightly larger docs but no extra function call.

#### Task 2.12 ⏳ `src/pages/TakeTest.jsx` — LIKELY NO CHANGES
It's pure UI reading from `testSchedule` and `StudentProgressContext`. As long as the context reflects server state (Task 2.8), this page works. Verify after.

---

### Phase 3 — Hardening for 200+ concurrent users ⏳ PENDING

#### Task 3.1 ⏳ `firestore.indexes.json` — PENDING
Composite indexes needed (Firestore auto-creates single-field indexes; composites must be declared):
```json
{
  "indexes": [
    { "collectionGroup": "results", "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "testKey", "order": "ASCENDING"},
        {"fieldPath": "percentage", "order": "DESCENDING"}
      ] },
    { "collectionGroup": "results", "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "uid", "order": "ASCENDING"},
        {"fieldPath": "submittedAt", "order": "DESCENDING"}
      ] },
    { "collectionGroup": "users", "queryScope": "COLLECTION",
      "fields": [{"fieldPath": "rollNumber", "order": "ASCENDING"}] },
    { "collectionGroup": "users", "queryScope": "COLLECTION",
      "fields": [{"fieldPath": "email", "order": "ASCENDING"}] },
    { "collectionGroup": "exam_sessions", "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "startedAt", "order": "DESCENDING"}
      ] },
    { "collectionGroup": "system_logs", "queryScope": "COLLECTION",
      "fields": [{"fieldPath": "timestamp", "order": "DESCENDING"}] }
  ]
}
```
Note: composite indexes can take a few minutes to build. The CLI will create them on `firebase deploy --only firestore:indexes`.

#### Task 3.2 ⏳ Listener hygiene
Audit every `onSnapshot`/`getDocs`:
- Each `useEffect` that subscribes MUST return the unsubscribe function. (AuthContext and adminService already do; verify StudentProgressContext's new listeners do too.)
- Use `query(..., limit(N))` on every collection listener so a growing `results` collection doesn't pull everything. The admin UI already paginates client-side; pair that with a server limit.
- Avoid `onSnapshot(collection(db, 'X'))` without a `limit` or `where`.

#### Task 3.3 ⏳ Idempotency & transactions
Already designed into `submitExam` (Task 2.2). Double-check:
- The `sessionId` is included in the stored result doc.
- The idempotency check (`existingResultSnap.data().sessionId === sessionId`) returns the existing doc instead of re-scoring.
- The `metrics` increments use `FieldValue.increment` (atomic).

#### Task 3.4 ⏳ Two-tab prevention
`startExam` refuses a second open session for the same uid unless it's the same testKey (resume). This is in the transaction (Task 2.2). Verify it survives a quick double-click on "Begin Examination" (the client should also disable the button during the call — already does via `security.loading`).

#### Task 3.5 ⏳ Best-effort submit on tab close
The current `useExamSecurity` has a `beforeunload` handler that prompts. Consider adding a `navigator.sendBeacon`-style call to a plain HTTPS function (not callable — callables can't use sendBeacon) that forces a submit if the session is still open. This is optional polish; the existing time-up auto-submit + the closed session status is the main safeguard. If skipped, document that an abandoned session stays "open" until the deadline passes (a cleanup function could sweep stale sessions).

---

### Phase 4 — Security Rules & secrets ⏳ PENDING

#### Task 4.1 ⏳ `firestore.rules` — PENDING
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth != null; }
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }
    function isAdmin() { return isSignedIn() && request.auth.token.admin == true; }

    // Users own their profile. No password field ever exists here.
    match /users/{uid} {
      allow read: if isOwner(uid) || isAdmin();
      allow create: if isOwner(uid);               // signup writes own doc
      allow update: if isOwner(uid) || isAdmin();   // profile edits + admin overrides
      allow delete: if isAdmin();
      // Deny any doc that contains a 'password' field
      // (defense in depth — the client never writes one, but enforce)
    }

    // Results: students read their own; only functions (Admin SDK) write.
    match /results/{id} {
      allow read: if isAdmin() || (isSignedIn() && resource.data.uid == request.auth.uid);
      allow write: if false;   // functions bypass rules via Admin SDK
    }

    // Exam sessions: server-only. Students interact via the startExam/submitExam functions.
    match /exam_sessions/{uid} {
      allow read: if isAdmin() || isOwner(uid);     // owner can read own session for resume
      allow write: if false;   // functions only
    }

    // Metrics: admin read, function write.
    match /metrics/{testKey} {
      allow read: if isAdmin();
      allow write: if false;
    }

    // System logs: admin read, function write (and optionally students create flag reports).
    match /system_logs/{id} {
      allow read: if isAdmin();
      allow create: if isSignedIn();   // students can write their own violation logs
      allow update, delete: if isAdmin();
    }
  }
}
```
**Important nuance:** Cloud Functions using the Admin SDK **bypass** Security Rules entirely. So `allow write: if false` on `results`/`exam_sessions`/`metrics` blocks direct client writes (good) but does NOT block the functions (they use Admin SDK). That's the intended pattern.

To enforce "no password field in users" at the rules level is hard in v2 (you can't easily inspect a write payload's keys). The real defense is: the client never writes one, and SignUp is the only create path. Document this; don't over-engineer rules.

#### Task 4.2 ⏳ Move Google Sheet URL server-side
Currently `VITE_GOOGLE_SHEET_URL` is in the client bundle. Move the Sheet upload into a Cloud Function (`exportResultsToSheet`) triggered on each new `results` doc write (via `onCreate`), OR keep the client-side upload but accept the URL is public. The owner can decide; recommend moving it server-side with `firebase functions:secrets:set GOOGLE_SHEET_URL`.

#### Task 4.3 ⏳ Admin custom claim
Create a one-time mechanism to grant the `admin` claim:
```js
// In functions/index.js or a separate admin script
exports.setAdminClaim = onCall(async (request) => {
  // Self-service: only an existing admin can grant admin.
  if (!request.auth?.token?.admin) {
    throw new HttpsError('permission-denied', 'Admin only.');
  }
  const { uid } = request.data;
  await getAuth().setCustomUserClaims(uid, { admin: true });
  return { ok: true };
});
```
For the FIRST admin, the owner runs this once via the Firebase CLI / console using the Admin SDK directly (documented in README). See Task 5.4.

#### Task 4.4 ⏳ `.env.example` — PENDING
Update to document all keys:
```
# Firebase web config (public — safe to expose; security is via Rules + Admin SDK)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Optional: Google Sheet secondary sink (consider moving server-side in Phase 4)
VITE_GOOGLE_SHEET_URL=
```

---

### Phase 5 — Cleanup & verification ⏳ PENDING

#### Task 5.1 ⏳ `src/pages/Dashboard.jsx` — remove hardcoded countdown
Lines 17–45 have a `useEffect` with `const targetDate = new Date('2026-06-23T09:00:00')` and a hand-rolled countdown. Replace with the existing `computeTestCountdown`/`useTestCountdown` from `testSchedule.js`/`TestCountdown.jsx` so all date logic has one source. The hardcoded date WILL drift from the schedule in `testSchedule.js` (which uses `getRelativeDateStr` offsets from 2026-06-23).

#### Task 5.2 ⏳ `src/pages/Profile.jsx` — wire password change
Currently `handleUpdatePassword` is `alert('Password updated successfully! (Mock Action)')`. Wire to Firebase `updatePassword(user, newPassword)` from `firebase/auth`. Note: `updatePassword` requires the user to have signed in recently; if it fails with `auth/requires-recent-login`, call `reauthenticateWithCredential` first (the "current password" field is already in the form for this purpose). Also wire `handleUpdateProfile` to actually `updateDoc(doc(db,'users',uid), {...})`.

#### Task 5.3 ⏳ Remove dead code
- Any remaining references to the old `storage.js` functions (`getUsers`, `saveUser`, `findUserByLogin`, `generateToken`, `parseToken`, `setAuthSession`, `getAuthSession`) — search the codebase; there shouldn't be any after Phase 1 but verify.
- The `btoa`/`atob` token logic is already gone.
- In `AdminDashboard.jsx`, the `progress`/`setProgress`/`resetTest`/`resetAllProgress` functions all mutate the operator's localStorage and must be removed or rewritten to call `adminAction`.

#### Task 5.4 ⏳ `README.md` — PENDING
Replace the default Vite README with real deploy docs:
1. Prereqs: Node 20, Firebase CLI (`npm i -g firebase-tools`).
2. Create a Firebase project, enable Auth (Email/Password), Firestore, Functions.
3. Fill `.env` with the Firebase web config.
4. `npm install` (root) and `cd functions && npm install`.
5. `firebase deploy --only firestore:rules,firestore:indexes,functions`.
6. Seed the first admin: a one-time Node script using Admin SDK to set the custom claim on a chosen uid (provide the script in `functions/scripts/seed-admin.js` or document the CLI one-liner).
7. Set `VITE_GOOGLE_SHEET_URL` (optional) and deploy the Apps Script (already documented in `google-apps-script/exam-results.gs`).
8. `npm run dev` / `npm run build`.

#### Task 5.5 ⏳ Build verification
Run `npm install && npm run build` from the repo root. Fix any import errors (the most likely breakage: something still importing a removed `storage.js` export, or `examQuestions.js`'s old `examQuestions`/`buildFinaleQuestions` exports). Do NOT run `firebase deploy` — that's the owner's job with their Google account.

---

## 5. Firestore data model (target schema)

Reference this when writing functions and listeners.

```
users/{uid}                    # profile, owned by the user
  fullName: string
  rollNumber: string           # stored lowercase for case-insensitive matching
  email: string                # lowercase
  phone: string
  gender: string
  collegeName: string
  branch: string
  yearOfStudy: string
  createdAt: timestamp
  suspended: boolean           # admin toggle
  attemptedTests: map          # denormalized for quick reads; authoritative source is results/
    "1": { score, total, percentage, performance, submittedAt }
    "2": { ... }
    "finale": { ... }

results/{testKey}_{uid}        # one doc per attempt. testKey is "1".."7" or "finale"
  uid, testKey, sessionId
  fullName, email, rollNumber, branch    # denormalized for admin views
  score, total, percentage, performance
  submittedAt: timestamp
  durationSeconds
  tabViolations, faceWarnings
  autoSubmit, submitReason
  # Phase 2 Task 2.11 Option A additions for review:
  questions: array             # [{id, question, options}] WITHOUT answer
  userAnswers: array           # of option indexes (or null)
  correctAnswers: array        # of option indexes  (revealed post-exam)

exam_sessions/{uid}            # one active session per user (doc id = uid)
  uid, testKey, sessionId
  questions: array             # FULL questions WITH answer (server-only)
  startedAt, deadline          # epoch ms
  status: "open" | "submitted" | "expired"
  submittedAt?, score?, percentage?

metrics/{testKey}              # aggregate counters for heatmap
  testKey
  count                        # total attempts
  totalScore                   # sum of scores
  totalPercentage              # sum of percentages (for averaging)
  passCount                    # count where percentage >= pass threshold
  lastUpdated

system_logs/{auto}             # audit/violation log
  timestamp, uid, event, severity, context
```

---

## 6. How to run / verify each phase

### Phase 1 verification (DONE — but verify after pull)
1. `npm install` in repo root.
2. Create `.env` from `.env.example` (fill Firebase keys).
3. `npm run dev`. Register a user → check Firebase Auth has the user AND Firestore `users/{uid}` has the profile (with NO password field).
4. Log out, log in by email, by roll number, by full name. All three should work.
5. Reload the page while logged in — state persists via `onAuthStateChanged`.
6. "Forgot Password" sends a real reset email.

### Phase 2 verification (after the pending tasks are done)
1. `cd functions && npm install`.
2. `firebase deploy --only functions`.
3. As a student, register, then from TakeTest click Start → `startExam` runs → questions render (inspect network: the response must NOT contain `answer` fields).
4. Submit → `submitExam` returns the score → `results/{testKey}_{uid}` appears in Firestore → `users/{uid}.attemptedTests[testKey]` updated → `metrics/{testKey}` incremented.
5. Open the admin dashboard in another tab → the result appears LIVE (no refresh) in the heatmap/activity; average score updates.
6. Open the exam in two tabs → second `startExam` for a different test is refused.
7. Submit twice with the same `sessionId` (e.g., kill network, retry) → score is counted once.

### Phase 3–5 verification
- `firebase deploy --only firestore:indexes` succeeds; queries don't log "requires an index" errors.
- Load test (optional): 200 concurrent `submitExam` calls should not corrupt `metrics` counters (transaction guarantees).
- `npm run build` succeeds with no errors.

---

## 7. Known gotchas & footguns

1. **`Exam.jsx` references `stopCameraRef` before its declaration.** It works because refs are objects (hoisted), but a rewrite can easily break it. Preserve the order or hoist the ref to the top.
2. **Vite HMR double-inits Firebase.** The new `firebase.js` uses `getApps().length ? getApp() : initializeApp(...)` to prevent this. Don't "simplify" it back to a bare `initializeApp`.
3. **`PROGRESS_VERSION` in StudentProgressContext.** Bump it (3 → 4) when you change the schema so old localStorage caches invalidate.
4. **`DEMO_SCHEDULE_BYPASS = true` in testSchedule.js.** The schedule isn't strictly enforced client-side and currently isn't enforced server-side either. Decide whether `startExam` should enforce the calendar window and document the choice.
5. **`storage.js` is imported by anything?** After Phase 1, only AuthContext imports it (for the UID cache). Search for other importers before assuming — `grep -r "from '../utils/storage'" src/`. If something else imported the old `getUsers`/`saveUser`, it's now broken and needs fixing.
6. **The Admin "Content Manager" tab is entirely fake** (hardcoded question UI). It's out of scope for this pass — leave it as-is or hide it. Don't try to wire it to the function question banks.
7. **`request.auth.token.admin`** in 2nd-gen `onCall` is the way to check the custom claim. Don't confuse with 1st-gen API.
8. **Cloud Functions cold start** is ~1–3s. The exam "Begin Examination" button already shows a loading state; the `startExam` call will add to that latency. Acceptable for 200 users; if the owner wants lower, configure `minInstances: 1` (costs money).
9. **The `answers` array sent to `submitExam`** must be the same length as `totalQuestions`, with `null` for unanswered. Validate this in the function (defensive).
10. **Windows line endings:** the repo was cloned on Windows. If you create files, the editor may insert CRLF. ESLint/Prettier isn't configured to enforce LF. Not a functional issue but worth knowing if diffs look noisy.

---

## 8. Quick reference — file-by-file status

| File | Status | Notes |
|---|---|---|
| `src/utils/firebase.js` | ✅ DONE | Auth + Firestore init |
| `src/utils/storage.js` | ✅ DONE | Thin UID cache only |
| `src/utils/validation.js` | ✅ DONE | Format-only |
| `src/utils/googleSheets.js` | unchanged | Optional secondary sink |
| `src/context/AuthContext.jsx` | ✅ DONE | Firebase Auth + onAuthStateChanged |
| `src/context/StudentProgressContext.jsx` | ⏳ PENDING | Must sync to Firestore results |
| `src/context/ThemeContext.jsx` | unchanged | |
| `src/services/adminService.js` | ⏳ PENDING | Add listenToResults, rewrite metrics |
| `src/services/examService.js` | ⏳ PENDING | NEW — callable wrappers |
| `src/data/testSchedule.js` | unchanged | |
| `src/data/dailyLearningPlan.js` | unchanged | |
| `src/data/examQuestions.js` | ⏳ PENDING | Strip answer keys |
| `src/pages/SignUp.jsx` | ✅ DONE | Firebase Auth + Firestore profile |
| `src/pages/Login.jsx` | ✅ NO CHANGE | Works with new AuthContext |
| `src/pages/ForgotPassword.jsx` | ✅ DONE | sendPasswordResetEmail |
| `src/pages/LandingPage.jsx` | unchanged | |
| `src/pages/Dashboard.jsx` | ⏳ PENDING | Remove hardcoded countdown |
| `src/pages/Learn.jsx` | unchanged | |
| `src/pages/TakeTest.jsx` | likely no change | Verify after context rewrite |
| `src/pages/Exam.jsx` | ⏳ PENDING | Call startExam/submitExam |
| `src/pages/Results.jsx` | ⏳ PENDING | Read from Firestore; review via stored Qs |
| `src/pages/Profile.jsx` | ⏳ PENDING | Wire updatePassword |
| `src/pages/HelpCenter.jsx` | unchanged | |
| `src/pages/AdminDashboard.jsx` | ⏳ PENDING | Live data; remove master123 |
| `src/components/ProtectedRoute.jsx` | ✅ NO CHANGE | |
| `src/components/*` (other) | unchanged | |
| `src/hooks/*` | unchanged | Keep proctoring |
| `functions/questions/day1.js`–`day6.js` | ✅ DONE | 20 Q each |
| `functions/questions/day7.js` | ⏳ PENDING | 20 Data Interpretation Q |
| `functions/questions/finale.js` | ⏳ PENDING | 50 Q from all days |
| `functions/index.js` | ⏳ PENDING | startExam, submitExam, adminAction |
| `functions/package.json` | ⏳ PENDING | admin + functions v2 |
| `firebase.json` | ⏳ PENDING | |
| `.firebaserc` | ⏳ PENDING | |
| `firestore.rules` | ⏳ PENDING | Phase 4 |
| `firestore.indexes.json` | ⏳ PENDING | Phase 3 |
| `.env.example` | ⏳ PENDING | Document Firebase keys |
| `README.md` | ⏳ PENDING | Deploy docs |
| `google-apps-script/exam-results.gs` | unchanged | Optional sink |

---

## 9. The four owner decisions (binding — do not change without re-asking)

Re-stating these because they're the most important thing in this doc:

1. **Backend:** Firebase properly (Firestore + Security Rules + Cloud Functions). No separate Node/Express server.
2. **Auth:** Firebase Authentication (email/password). Profile fields in Firestore. No password field anywhere.
3. **Top priority:** Exam results reach the admin dashboard LIVE (cohort average, heatmap, rank) — not the operator's localStorage.
4. **Anti-cheat:** Server-side scoring. Answer key lives only in Cloud Functions. Client sends answers, server computes score.

---

## 10. Suggested order for the next session

If picking up cold, do in this order (each unblocks the next):

1. **`functions/questions/day7.js` + `finale.js`** (Task 2.1.7, 2.1.8) — quick, unblocks the function.
2. **`functions/index.js` + `functions/package.json`** (Task 2.2, 2.3) — the core. Reference the pseudocode in Task 2.2 closely.
3. **`firebase.json` + `.firebaserc`** (Task 2.4) — needed before deploy.
4. **`src/services/examService.js`** (Task 2.5) — client callable wrappers.
5. **`src/data/examQuestions.js`** (Task 2.6) — strip answer keys.
6. **`src/pages/Exam.jsx`** (Task 2.7) — wire to the functions.
7. **`src/context/StudentProgressContext.jsx`** (Task 2.8) — sync to Firestore.
8. **`src/services/adminService.js` + `src/pages/AdminDashboard.jsx`** (Task 2.9, 2.10) — **the owner's top priority**. After this, results reach admin live.
9. **`src/pages/Results.jsx`** (Task 2.11) — read from Firestore.
10. **Phase 3** (indexes, listener hygiene, idempotency audit).
11. **Phase 4** (rules, secrets, admin claim).
12. **Phase 5** (cleanup, README, `npm run build`).

Steps 1–9 are the meat. Steps 10–12 are polish + hardening. The owner's #1 priority (live admin results) lands at step 8.

---

**End of handoff.** Read Sections 0, 3, and 9 before writing any code. Then start at Section 10.
