import { DEFAULT_ADMIN_EMAIL } from './adminAuth';

const DEMO_ROLLS = new Set(['ADMIN001', 'DEMO', 'TEST']);

export function isDemoUser(user) {
  if (!user) return true;
  if (user.role === 'admin') return true;
  if (user.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL) return true;
  if (String(user.fullName || '').trim().toLowerCase() === 'system admin') return true;
  if (DEMO_ROLLS.has(String(user.rollNumber || '').toUpperCase())) return true;
  if (user.isDemo === true) return true;
  return false;
}

export function isDemoResult(result) {
  if (!result) return true;
  if (result.isDemo === true || result.isSample === true) return true;
  if (result.rollNumber && DEMO_ROLLS.has(String(result.rollNumber).toUpperCase())) return true;
  if (String(result.fullName || '').trim().toLowerCase() === 'system admin') return true;
  if (result.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL) return true;
  return false;
}

/** Attach registered name / roll no from users collection (source of truth). */
export function enrichWithUserProfile(rows = [], users = []) {
  const byUid = new Map(users.map((u) => [u.id, u]));
  return rows.map((row) => {
    const profile = byUid.get(row.uid);
    if (!profile) return row;
    return {
      ...row,
      fullName: profile.fullName || row.fullName,
      rollNumber: profile.rollNumber || row.rollNumber,
      email: profile.email || row.email,
      branch: profile.branch || row.branch,
    };
  });
}

export function enrichExamResults(results, users) {
  return enrichWithUserProfile(results, users);
}

export function enrichHelpRequests(requests, users) {
  return enrichWithUserProfile(requests, users);
}

export function filterStudents(users = []) {
  return users.filter((u) => !isDemoUser(u));
}

export function filterExamResults(results = []) {
  return results.filter((r) => !isDemoResult(r));
}

export function getTotalViolations(result = {}) {
  return (result.tabViolations || 0) + (result.faceWarnings || 0);
}

export function formatDuration(seconds) {
  const safe = Number(seconds);
  if (!safe || safe <= 0) return '—';
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function formatIST(dateValue) {
  if (!dateValue) return '—';
  try {
    return new Date(dateValue).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  } catch {
    return String(dateValue);
  }
}

export function getTestTitle(testKey) {
  if (testKey === 'finale') return 'Grand Finale';
  return `Day ${testKey}`;
}

export const DAY_TOPICS = {
  '1': 'Number System',
  '2': 'Percentages',
  '3': 'Ratio & Proportion',
  '4': 'Averages',
  '5': 'Profit, Loss & Discount',
  '6': 'Simple & Compound Interest',
  '7': 'Problems on Ages',
  '8': 'Time & Work',
  '9': 'Pipes & Cisterns',
  '10': 'Time, Speed & Distance',
  '11': 'Problems on Trains',
  '12': 'Permutations & Combinations',
  finale: 'Grand Finale',
};

export function readLocalProgressCache() {
  try {
    const raw = localStorage.getItem('aptitude_student_progress');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearLocalProgressCache() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith('aptitude_progress_')) keys.push(key);
  }
  keys.forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem('aptitude_student_progress');
}
