import { db, isFirebaseReady } from '../utils/firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { DAY_TOPICS, filterExamResults, enrichExamResults, getTotalViolations, readLocalProgressCache, clearLocalProgressCache } from '../utils/adminData';
import { PROGRAM_DAY_KEYS } from '../data/testSchedule';
import { DEFAULT_ADMIN_EMAIL } from '../utils/adminAuth';
import { DAY1_QUESTION_BANK } from '../data/day1QuestionBank';
import { DAY2_QUESTION_BANK } from '../data/day2QuestionBank';
import { DAY3_QUESTION_BANK } from '../data/day3QuestionBank';
import { DAY4_QUESTION_BANK } from '../data/day4QuestionBank';

const RESULTS_COLLECTIONS = ['results', 'exam_results'];

function sortBySubmittedAt(rows) {
  return [...rows].sort((a, b) => String(b.submittedAt || '').localeCompare(String(a.submittedAt || '')));
}

function subscribeCollection(name, onRows) {
  if (!db) return () => {};

  let unsubFallback = null;

  const orderedQuery = query(collection(db, name), orderBy('submittedAt', 'desc'), limit(200));

  const unsubPrimary = onSnapshot(
    orderedQuery,
    (snapshot) => {
      const rows = [];
      snapshot.forEach((d) => rows.push({ id: d.id, ...d.data(), _collection: name }));
      onRows(rows);
    },
    (err) => {
      console.error(`Results listener (${name}) orderBy failed:`, err);
      if (unsubFallback) return;
      const plainQuery = query(collection(db, name), limit(200));
      unsubFallback = onSnapshot(
        plainQuery,
        (snapshot) => {
          const rows = [];
          snapshot.forEach((d) => rows.push({ id: d.id, ...d.data(), _collection: name }));
          onRows(sortBySubmittedAt(rows));
        },
        (err2) => console.error(`Results listener (${name}) fallback failed:`, err2)
      );
    }
  );

  return () => {
    unsubPrimary();
    unsubFallback?.();
  };
}

function subscribeResults(callback, onError) {
  if (!isFirebaseReady() || !db) {
    callback(readLocalResultsFallback());
    return () => {};
  }

  let primary = [];
  let secondary = [];
  const unsubs = [];

  const emit = () => {
    const merged = new Map();
    [...primary, ...secondary].forEach((r) => merged.set(r.id, r));
    callback(sortBySubmittedAt(Array.from(merged.values())));
  };

  RESULTS_COLLECTIONS.forEach((name) => {
    unsubs.push(
      subscribeCollection(name, (rows) => {
        if (name === 'results') primary = rows;
        else secondary = rows;
        emit();
      })
    );
  });

  return () => unsubs.forEach((u) => u());
}

function readLocalResultsFallback() {
  const cache = readLocalProgressCache();
  if (!cache?.attemptedTests) return [];
  return Object.entries(cache.attemptedTests).map(([testKey, data]) => ({
    id: `local_${testKey}`,
    testKey,
    ...data,
    submittedAt: data.submittedAt || new Date().toISOString(),
    isDemo: true,
  }));
}

export const listenToUsers = (callback) => {
  if (!isFirebaseReady() || !db) {
    callback([]);
    return () => {};
  }
  const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    usersQuery,
    (snapshot) => {
      const users = [];
      snapshot.forEach((d) => users.push({ id: d.id, ...d.data() }));
      callback(users);
    },
    (error) => {
      console.error('Error fetching users:', error);
      callback([]);
    }
  );
};

export const listenToResults = (callback) => subscribeResults(callback);

export const listenToOverviewMetrics = (callback) => {
  if (!isFirebaseReady() || !db) {
    const local = filterExamResults(readLocalResultsFallback());
    const averageScore =
      local.length > 0
        ? Math.round(local.reduce((s, r) => s + (r.percentage || 0), 0) / local.length)
        : 0;
    callback({
      heatmap: [],
      activity: local.slice(0, 10).map((r) => ({
        text: `${r.fullName || 'Student'} scored ${r.percentage || 0}% on ${r.testKey === 'finale' ? 'Grand Finale' : `Day ${r.testKey}`}`,
        time: r.submittedAt ? new Date(r.submittedAt).toLocaleTimeString() : '',
        warnings: getTotalViolations(r),
      })),
      liveSessions: 0,
      flaggedCount: local.filter((r) => getTotalViolations(r) > 0).length,
      averageScore,
      totalResults: local.length,
      isLive: false,
    });
    return () => {};
  }

  const unsubs = [];
  let metricsMap = {};
  let liveSessionCount = 0;
  let latestResults = [];
  let latestUsers = [];

  function emitUpdate() {
    const heatmap = Object.entries(metricsMap)
      .map(([testKey, m]) => ({
        day: testKey === 'finale' ? 'Finale' : testKey,
        topic: DAY_TOPICS[testKey] || `Day ${testKey}`,
        passRate: m.count > 0 ? Math.round((m.passCount / m.count) * 100) : 0,
        totalAttempts: m.count || 0,
      }))
      .sort((a, b) => (a.day === 'Finale' ? 99 : Number(a.day)) - (b.day === 'Finale' ? 99 : Number(b.day)));

    const filtered = filterExamResults(enrichExamResults(latestResults, latestUsers));
    const activity = filtered.slice(0, 10).map((r) => ({
      text: `${r.fullName || 'Student'} scored ${r.percentage}% on ${r.testKey === 'finale' ? 'Grand Finale' : `Day ${r.testKey}`}${getTotalViolations(r) > 0 ? ` · ${getTotalViolations(r)} warning(s)` : ''}`,
      time: r.submittedAt ? new Date(r.submittedAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) : '',
      warnings: getTotalViolations(r),
    }));

    const averageScore =
      filtered.length > 0
        ? Math.round(filtered.reduce((s, r) => s + (r.percentage || 0), 0) / filtered.length)
        : 0;

    callback({
      heatmap,
      activity,
      liveSessions: liveSessionCount,
      flaggedCount: filtered.filter((r) => getTotalViolations(r) > 0).length,
      averageScore,
      totalResults: filtered.length,
      isLive: true,
    });
  }

  unsubs.push(
    onSnapshot(collection(db, 'metrics'), (snapshot) => {
      metricsMap = {};
      snapshot.forEach((d) => {
        metricsMap[d.id] = d.data();
      });
      emitUpdate();
    })
  );

  unsubs.push(
    onSnapshot(query(collection(db, 'exam_sessions'), where('status', '==', 'open')), (snapshot) => {
      liveSessionCount = snapshot.size;
      emitUpdate();
    })
  );

  unsubs.push(
    subscribeResults((results) => {
      latestResults = results;
      emitUpdate();
    })
  );

  unsubs.push(
    listenToUsers((users) => {
      latestUsers = users;
      emitUpdate();
    })
  );

  return () => unsubs.forEach((u) => u());
};

export const listenToSystemLogs = (callback) => {
  if (!isFirebaseReady() || !db) {
    callback([]);
    return () => {};
  }
  const logsQuery = query(collection(db, 'system_logs'), orderBy('timestamp', 'desc'), limit(100));
  return onSnapshot(
    logsQuery,
    (snapshot) => {
      const logs = [];
      snapshot.forEach((d) => logs.push({ id: d.id, ...d.data() }));
      callback(logs);
    },
    (error) => {
      console.error('Error fetching logs:', error);
      callback([]);
    }
  );
};

export const listenToUserResults = (uid, callback) => {
  if (!isFirebaseReady() || !db || !uid) {
    callback([]);
    return () => {};
  }
  const merged = new Map();
  const emit = () => {
    callback(sortBySubmittedAt(Array.from(merged.values())));
  };

  const attach = (name) => {
    const ordered = query(collection(db, name), where('uid', '==', uid), orderBy('submittedAt', 'desc'));
    let fallbackUnsub = null;
    const primaryUnsub = onSnapshot(
      ordered,
      (snapshot) => {
        snapshot.forEach((d) => merged.set(`${name}_${d.id}`, { id: d.id, ...d.data() }));
        emit();
      },
      () => {
        if (fallbackUnsub) return;
        const plain = query(collection(db, name), where('uid', '==', uid));
        fallbackUnsub = onSnapshot(plain, (snapshot) => {
          snapshot.forEach((d) => merged.set(`${name}_${d.id}`, { id: d.id, ...d.data() }));
          emit();
        });
      }
    );
    return () => {
      primaryUnsub();
      fallbackUnsub?.();
    };
  };

  const unsubs = RESULTS_COLLECTIONS.map(attach);
  return () => unsubs.forEach((u) => u());
};

export const listenToHelpRequests = (callback) => {
  if (!isFirebaseReady() || !db) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, 'help_requests'), orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(
    q,
    (snapshot) => {
      const rows = [];
      snapshot.forEach((d) => rows.push({ id: d.id, ...d.data() }));
      callback(rows);
    },
    (err) => {
      console.error('help_requests listener error:', err);
      callback([]);
    }
  );
};

export const listenToStudentProgress = (uid, callback) => {
  if (!isFirebaseReady() || !db || !uid) {
    callback(null);
    return () => {};
  }
  return onSnapshot(
    doc(db, 'student_progress', uid),
    (snap) => callback(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    () => callback(null)
  );
};

const DAY1_SEED = { ...DAY1_QUESTION_BANK };
const DAY2_SEED = { ...DAY2_QUESTION_BANK };
const DAY3_SEED = { ...DAY3_QUESTION_BANK };
const DAY4_SEED = { ...DAY4_QUESTION_BANK };

const OFFLINE_BANKS = {
  '1': DAY1_SEED,
  '2': DAY2_SEED,
  '3': DAY3_SEED,
  '4': DAY4_SEED,
};

export const listenToQuestionBank = (dayKey, callback) => {
  if (!isFirebaseReady() || !db) {
    callback(OFFLINE_BANKS[dayKey] ? { ...OFFLINE_BANKS[dayKey], lastPublishedAt: null } : null);
    return () => {};
  }
  return onSnapshot(
    doc(db, 'question_banks', String(dayKey)),
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() });
        return;
      }
      callback(
        OFFLINE_BANKS[dayKey]
          ? { ...OFFLINE_BANKS[dayKey], lastPublishedAt: null }
          : {
              title: `Day ${dayKey} Assessment`,
              topicLabel: DAY_TOPICS[dayKey] || `Day ${dayKey}`,
              durationMinutes: ['1', '2', '3', '4'].includes(dayKey) ? 30 : 20,
              questions: [],
              lastPublishedAt: null,
            }
      );
    },
    () => callback(null)
  );
};

export async function publishQuestionBank(dayKey, bank) {
  if (!isFirebaseReady() || !db) throw new Error('Firebase not configured');
  const payload = {
    ...bank,
    dayKey: String(dayKey),
    lastPublishedAt: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db, 'question_banks', String(dayKey)), payload, { merge: true });
  return payload;
}

/** Clear prior attempt directly in Firestore (no Cloud Functions required). */
export async function resetStudentAttempt(uid, testKey) {
  if (!isFirebaseReady() || !db) throw new Error('Firebase not configured');
  const key = String(testKey);
  const resultId = `${key}_${uid}`;

  await Promise.all([
    deleteDoc(doc(db, 'results', resultId)).catch(() => {}),
    deleteDoc(doc(db, 'exam_results', resultId)).catch(() => {}),
    deleteDoc(doc(db, 'exam_sessions', uid)).catch(() => {}),
  ]);

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const attemptedTests = { ...(userSnap.data().attemptedTests || {}) };
    if (attemptedTests[key]) {
      delete attemptedTests[key];
      await updateDoc(userRef, { attemptedTests });
    }
  }

  return { success: true };
}

/** Delete a student and all related Firestore records (profile, results, progress, help). */
export async function deleteStudentCompletely(uid) {
  if (!isFirebaseReady() || !db) throw new Error('Firebase not configured');
  if (!uid) throw new Error('Student id required');

  const userSnap = await getDoc(doc(db, 'users', uid));
  if (!userSnap.exists()) throw new Error('Student not found');
  if (isProtectedUser(userSnap.data())) throw new Error('Cannot delete admin account');

  for (const coll of ['results', 'exam_results']) {
    const snap = await getDocs(query(collection(db, coll), where('uid', '==', uid)));
    for (let i = 0; i < snap.docs.length; i += 500) {
      const batch = writeBatch(db);
      snap.docs.slice(i, i + 500).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }

  for (const key of [...PROGRAM_DAY_KEYS, 'finale']) {
    await deleteDoc(doc(db, 'results', `${key}_${uid}`)).catch(() => {});
    await deleteDoc(doc(db, 'exam_results', `${key}_${uid}`)).catch(() => {});
  }

  const helpSnap = await getDocs(query(collection(db, 'help_requests'), where('uid', '==', uid)));
  for (let i = 0; i < helpSnap.docs.length; i += 500) {
    const batch = writeBatch(db);
    helpSnap.docs.slice(i, i + 500).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  await deleteDoc(doc(db, 'users', uid));
  await deleteDoc(doc(db, 'student_progress', uid)).catch(() => {});
  await deleteDoc(doc(db, 'exam_sessions', uid)).catch(() => {});

  return { success: true, uid };
}

export async function grantStudentRetake({ uid, testKey, helpRequestId }) {
  await resetStudentAttempt(uid, testKey);
  await rescheduleStudentTest({ uid, testKey, helpRequestId });
  return { success: true };
}

export async function rescheduleStudentTest({ uid, testKey, helpRequestId }) {
  if (!isFirebaseReady() || !db) throw new Error('Firebase not configured');
  const progressRef = doc(db, 'student_progress', uid);
  const snap = await getDoc(progressRef);
  const existing = snap.exists() ? snap.data() : {};
  const rescheduledTests = { ...(existing.rescheduledTests || {}), [String(testKey)]: true };
  await setDoc(
    progressRef,
    {
      uid,
      rescheduledTests,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  if (helpRequestId) {
    await updateDoc(doc(db, 'help_requests', helpRequestId), {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolvedTestKey: String(testKey),
    });
  }
}

export async function submitHelpRequest(data) {
  if (!isFirebaseReady() || !db) throw new Error('Firebase not configured');
  const now = new Date();
  const submittedAt = now.toISOString();
  const submittedAtIST = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const id = `hr_${Date.now()}`;
  const payload = {
    uid: data.uid || '',
    fullName: data.fullName || '',
    rollNumber: data.rollNumber || '',
    email: data.email || '',
    branch: data.branch || '',
    issueType: data.issueType || '',
    description: data.description || '',
    query: data.description || '',
    status: 'pending',
    createdAt: submittedAt,
    submittedAt,
    submittedAtIST,
  };
  await setDoc(doc(db, 'help_requests', id), payload);
  return { id, ...payload };
}

export async function updateHelpRequestStatus(id, status, extra = {}) {
  if (!isFirebaseReady() || !db) throw new Error('Firebase not configured');
  await updateDoc(doc(db, 'help_requests', id), {
    status,
    updatedAt: new Date().toISOString(),
    ...extra,
  });
}

const PURGE_COLLECTIONS = [
  'results',
  'exam_results',
  'exam_sessions',
  'student_progress',
  'help_requests',
  'system_logs',
  'metrics',
];

async function deleteAllDocsInCollection(collectionName) {
  const snap = await getDocs(collection(db, collectionName));
  const refs = snap.docs.map((d) => d.ref);
  for (let i = 0; i < refs.length; i += 500) {
    const batch = writeBatch(db);
    refs.slice(i, i + 500).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
  return refs.length;
}

function isProtectedUser(data = {}) {
  if (data.role === 'admin') return true;
  if (data.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL) return true;
  return false;
}

/** Wipe all student/operational data from Firestore. Admin account is kept. */
export async function purgeAllPlatformData(onProgress) {
  if (!isFirebaseReady() || !db) throw new Error('Firebase not configured');

  const stats = {};

  for (const name of PURGE_COLLECTIONS) {
    onProgress?.(`Deleting ${name}…`);
    stats[name] = await deleteAllDocsInCollection(name);
  }

  onProgress?.('Deleting student profiles…');
  const usersSnap = await getDocs(collection(db, 'users'));
  const studentRefs = usersSnap.docs
    .filter((d) => !isProtectedUser(d.data()))
    .map((d) => d.ref);

  for (let i = 0; i < studentRefs.length; i += 500) {
    const batch = writeBatch(db);
    studentRefs.slice(i, i + 500).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
  stats.users = studentRefs.length;

  clearLocalProgressCache();
  onProgress?.('Done.');
  return stats;
}

const SAMPLE_RESULTS = [
  {
    id: 'sample_1',
    uid: 'sample_uid_1',
    testKey: '1',
    fullName: 'Sample Student A',
    rollNumber: 'SAMPLE001',
    email: 'sample.a@college.edu',
    branch: 'CSE',
    score: 24,
    total: 30,
    percentage: 80,
    performance: 'Good',
    emoji: '👍',
    tabViolations: 1,
    faceWarnings: 0,
    totalViolations: 1,
    submitReason: 'manual',
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
    isSample: true,
  },
  {
    id: 'sample_2',
    uid: 'sample_uid_2',
    testKey: '1',
    fullName: 'Sample Student B',
    rollNumber: 'SAMPLE002',
    email: 'sample.b@college.edu',
    branch: 'ECE',
    score: 18,
    total: 30,
    percentage: 60,
    performance: 'Improve',
    emoji: '📚',
    tabViolations: 2,
    faceWarnings: 1,
    totalViolations: 3,
    submitReason: 'tab_limit',
    submittedAt: new Date(Date.now() - 7200000).toISOString(),
    isSample: true,
  },
  {
    id: 'sample_3',
    uid: 'sample_uid_3',
    testKey: '1',
    fullName: 'Sample Student C',
    rollNumber: 'SAMPLE003',
    email: 'sample.c@college.edu',
    branch: 'IT',
    score: 27,
    total: 30,
    percentage: 90,
    performance: 'Excellent',
    emoji: '🌟',
    tabViolations: 0,
    faceWarnings: 0,
    totalViolations: 0,
    submitReason: 'manual',
    submittedAt: new Date(Date.now() - 10800000).toISOString(),
    isSample: true,
  },
];

export async function seedSampleResultsIfEmpty() {
  if (!isFirebaseReady() || !db) return false;
  const resultsSnap = await getDoc(doc(db, 'system_logs', 'sample_results_seeded'));
  if (resultsSnap.exists()) return false;

  const existing = await getDoc(doc(db, 'exam_results', 'sample_1'));
  if (existing.exists()) {
    await setDoc(doc(db, 'system_logs', 'sample_results_seeded'), { seededAt: new Date().toISOString() });
    return false;
  }

  const allResultsQuery = collection(db, 'exam_results');
  const snap = await getDocs(query(allResultsQuery, limit(1)));
  if (!snap.empty) return false;

  for (const sample of SAMPLE_RESULTS) {
    const { id, ...data } = sample;
    await setDoc(doc(db, 'exam_results', id), data);
    await setDoc(doc(db, 'results', id), data);
  }
  await setDoc(doc(db, 'system_logs', 'sample_results_seeded'), { seededAt: new Date().toISOString() });
  return true;
}
