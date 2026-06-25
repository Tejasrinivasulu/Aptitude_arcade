import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { sanitizeForFirestore } from '../utils/firestoreHelpers';
import { DAY1_DURATION_SECONDS, DAY1_QUESTION_BANK } from '../data/day1QuestionBank';
import { DAY2_DURATION_SECONDS, DAY2_QUESTION_BANK } from '../data/day2QuestionBank';
import { DAY3_DURATION_SECONDS, DAY3_QUESTION_BANK } from '../data/day3QuestionBank';
import { getExamMeta } from '../data/examQuestions';
import { ACTIVE_PROGRAM_DAY } from '../data/testSchedule';

const SESSION_KEY = 'exam_local_session';

const LOCAL_BANKS = {
  '1': { questions: DAY1_QUESTION_BANK.questions, durationSeconds: DAY1_DURATION_SECONDS },
  '2': { questions: DAY2_QUESTION_BANK.questions, durationSeconds: DAY2_DURATION_SECONDS },
  '3': { questions: DAY3_QUESTION_BANK.questions, durationSeconds: DAY3_DURATION_SECONDS },
};

function stripAnswers(questions) {
  return questions.map(({ answer, ...rest }) => rest);
}

function normalizeAnswer(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim().toLowerCase();
}

function isAnswerCorrect(question, userAnswer) {
  if (userAnswer === null || userAnswer === undefined || userAnswer === '') return false;
  if (question.type === 'fill') {
    return normalizeAnswer(userAnswer) === normalizeAnswer(question.answer);
  }
  return userAnswer === question.answer;
}

function scoreAnswers(questions, answers) {
  let score = 0;
  questions.forEach((q, i) => {
    if (isAnswerCorrect(q, answers[i])) score += 1;
  });
  const total = questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const performance = percentage >= 85 ? 'Excellent' : percentage >= 70 ? 'Good' : 'Improve';
  const emoji = percentage >= 85 ? '🌟' : percentage >= 70 ? '👍' : '📚';
  return { score, total, percentage, performance, emoji };
}

async function loadQuestions(testKey) {
  const key = String(testKey);
  if (db) {
    const bankSnap = await getDoc(doc(db, 'question_banks', key));
    if (bankSnap.exists()) {
      const bank = bankSnap.data();
      if (Array.isArray(bank.questions) && bank.questions.length > 0) {
        return {
          questions: bank.questions,
          durationSeconds: (bank.durationMinutes || 30) * 60,
        };
      }
    }
  }
  if (LOCAL_BANKS[key]) {
    return LOCAL_BANKS[key];
  }
  throw new Error(`No questions available for Day ${key}.`);
}

export async function startExamLocal(testKey) {
  const uid = auth?.currentUser?.uid;
  if (!uid) throw new Error('You must be logged in to start the exam.');

  const key = String(testKey);
  if (Number(key) > ACTIVE_PROGRAM_DAY) {
    throw new Error(`Only Day ${ACTIVE_PROGRAM_DAY} exam is active right now.`);
  }

  if (db) {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) throw new Error('User profile not found. Please complete registration.');
    const userData = userSnap.data();
    if (userData.suspended) throw new Error('Account is suspended.');

    const progressSnap = await getDoc(doc(db, 'student_progress', uid));
    const rescheduled = progressSnap.exists()
      ? progressSnap.data().rescheduledTests?.[key] === true
      : false;

    if (userData.attemptedTests?.[key] && !rescheduled) {
      throw new Error('Test already completed.');
    }
  }

  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (parsed.uid === uid && parsed.testKey === key && parsed.status === 'open') {
        const elapsed = Math.floor((Date.now() - parsed.startedAt) / 1000);
        const remaining = Math.max(0, parsed.durationSeconds - elapsed);
        return {
          sessionId: parsed.sessionId,
          testKey: key,
          questions: stripAnswers(parsed.questions),
          totalQuestions: parsed.totalQuestions,
          durationSeconds: remaining,
          startedAt: parsed.startedAt,
        };
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

  const loaded = await loadQuestions(key);
  const sessionId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const startedAt = Date.now();

  const session = {
    sessionId,
    testKey: key,
    uid,
    status: 'open',
    questions: loaded.questions,
    totalQuestions: loaded.questions.length,
    durationSeconds: loaded.durationSeconds,
    startedAt,
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return {
    sessionId,
    testKey: key,
    questions: stripAnswers(loaded.questions),
    totalQuestions: loaded.questions.length,
    durationSeconds: loaded.durationSeconds,
    startedAt,
  };
}

export async function submitExamLocal({ testKey, answers, sessionId, violations }) {
  const uid = auth?.currentUser?.uid;
  if (!uid) throw new Error('You must be logged in to submit.');

  const key = String(testKey);
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) throw new Error('No exam session found. Please restart the exam.');

  const session = JSON.parse(raw);
  if (session.uid !== uid || session.testKey !== key || session.sessionId !== sessionId) {
    throw new Error('Invalid exam session.');
  }
  if (session.status !== 'open') throw new Error('Exam session already submitted.');

  const userSnap = db ? await getDoc(doc(db, 'users', uid)) : null;
  const userData = userSnap?.exists() ? userSnap.data() : {};

  const { score, total, percentage, performance, emoji } = scoreAnswers(session.questions, answers);
  const meta = getExamMeta(key);
  const tabViolations = violations?.tabViolations || 0;
  const faceWarnings = violations?.faceWarnings || 0;
  const submitReason = violations?.submitReason || 'manual';

  const resultData = sanitizeForFirestore({
    uid,
    testKey: key,
    sessionId,
    fullName: userData.fullName || '',
    email: userData.email || auth.currentUser?.email || '',
    rollNumber: userData.rollNumber || '',
    branch: userData.branch || '',
    score,
    total,
    percentage,
    performance,
    emoji,
    title: meta.title,
    submittedAt: new Date().toISOString(),
    durationSeconds: session.durationSeconds,
    tabViolations,
    faceWarnings,
    totalViolations: tabViolations + faceWarnings,
    autoSubmit: !!violations?.autoSubmit,
    submitReason,
    questions: stripAnswers(session.questions),
    userAnswers: answers,
    correctAnswers: session.questions.map((q) => q.answer),
  });

  if (!db) {
    throw new Error('Firebase is not configured. Results cannot be saved.');
  }

  const resultId = `${key}_${uid}`;
  try {
    await setDoc(doc(db, 'results', resultId), resultData, { merge: true });
    await setDoc(doc(db, 'exam_results', resultId), resultData, { merge: true });

    await setDoc(
      doc(db, 'users', uid),
      {
        attemptedTests: {
          [key]: {
            score,
            total,
            percentage,
            performance,
            emoji,
            title: meta.title,
            submittedAt: resultData.submittedAt,
          },
        },
      },
      { merge: true }
    );

    const progressRef = doc(db, 'student_progress', uid);
    const progressSnap = await getDoc(progressRef);
    if (progressSnap.exists()) {
      const rescheduledTests = { ...(progressSnap.data().rescheduledTests || {}) };
      if (rescheduledTests[key]) {
        delete rescheduledTests[key];
        await updateDoc(progressRef, { rescheduledTests });
      }
    }
  } catch (err) {
    console.error('Failed to save exam result to Firestore:', err);
    throw new Error(
      err.code === 'permission-denied'
        ? 'Permission denied saving results. Deploy updated Firestore rules: firebase deploy --only firestore:rules'
        : `Failed to save results: ${err.message}`
    );
  }

  session.status = 'submitted';
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return resultData;
}
