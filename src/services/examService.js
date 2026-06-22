import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../utils/firebase';
import { startExamLocal, submitExamLocal } from './examLocalService';
import { resetStudentAttempt } from './adminService';

let functionsInstance = null;

function getFns() {
  if (!app) throw new Error('Firebase not configured');
  if (!functionsInstance) {
    functionsInstance = getFunctions(app);
  }
  return functionsInstance;
}

function parseCallableError(err) {
  const code = err?.code || '';
  const message = err?.message || 'Unknown error';
  if (code === 'functions/internal' || message === 'internal') {
    return 'Exam server unavailable. Using direct mode…';
  }
  return message.replace(/^FirebaseError:\s*/i, '').replace(/^functions\/\w+:\s*/i, '');
}

async function callCloud(name, data) {
  const fn = httpsCallable(getFns(), name);
  const result = await fn(data);
  return result.data;
}

export async function startExam(testKey) {
  try {
    return await callCloud('startExam', { testKey: String(testKey) });
  } catch (err) {
    console.warn('startExam cloud failed, using local fallback:', err);
    return startExamLocal(testKey);
  }
}

export async function submitExam(payload) {
  const sessionId = String(payload?.sessionId || '');
  if (sessionId.startsWith('local_')) {
    return submitExamLocal(payload);
  }
  try {
    return await callCloud('submitExam', payload);
  } catch (err) {
    console.warn('submitExam cloud failed, using local fallback:', err);
    return submitExamLocal(payload);
  }
}

export async function callAdminAction({ action, uid, testKey }) {
  try {
    return await callCloud('adminAction', { action, uid, testKey });
  } catch (err) {
    console.warn('adminAction cloud failed, using Firestore fallback:', err);
    if (action === 'resetAttempt' && uid && testKey) {
      return resetStudentAttempt(uid, testKey);
    }
    if (action === 'suspendUser' || action === 'unsuspendUser' || action === 'flagUser') {
      throw new Error('This admin action requires Cloud Functions. Deploy functions or use Firebase Console.');
    }
    throw new Error(parseCallableError(err));
  }
}
