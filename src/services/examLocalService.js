import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isFirebaseReady } from '../utils/firebase';
import { sanitizeForFirestore } from '../utils/firestoreHelpers';
import { DAY1_DURATION_SECONDS, DAY1_QUESTION_BANK } from '../data/day1QuestionBank';
import { DAY2_DURATION_SECONDS, DAY2_QUESTION_BANK } from '../data/day2QuestionBank';
import { DAY3_DURATION_SECONDS, DAY3_QUESTION_BANK } from '../data/day3QuestionBank';
import { DAY4_DURATION_SECONDS, DAY4_QUESTION_BANK } from '../data/day4QuestionBank';
import { getExamMeta } from '../data/examQuestions';
import { ACTIVE_PROGRAM_DAY, TOTAL_PROGRAM_DAYS, DEMO_SCHEDULE_BYPASS } from '../data/testSchedule';

const SESSION_KEY = 'exam_local_session';

const LOCAL_BANKS = {
  '1': { questions: DAY1_QUESTION_BANK.questions, durationSeconds: DAY1_DURATION_SECONDS },
  '2': { questions: DAY2_QUESTION_BANK.questions, durationSeconds: DAY2_DURATION_SECONDS },
  '3': { questions: DAY3_QUESTION_BANK.questions, durationSeconds: DAY3_DURATION_SECONDS },
  '4': { questions: DAY4_QUESTION_BANK.questions, durationSeconds: DAY4_DURATION_SECONDS },
};

function generateFallbackQuestions(day) {
  return Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    type: 'mcq',
    question: `[Day ${day}] Aptitude Practice Question #${i + 1}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    answer: 0,
  }));
}

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
  if (isFirebaseReady() && db) {
    try {
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
    } catch {
      // Fallback
    }
  }

  // Check static banks
  if (LOCAL_BANKS[key]) {
    return LOCAL_BANKS[key];
  }

  // Check localStorage for banks saved locally
  try {
    const localSaved = localStorage.getItem(`local_qbank_${key}`);
    if (localSaved) {
      const parsed = JSON.parse(localSaved);
      if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return {
          questions: parsed.questions,
          durationSeconds: (parsed.durationMinutes || 30) * 60,
        };
      }
    }
  } catch {
    // Ignore
  }

  // Generate fallback sample questions for any of the 14 days
  return {
    questions: generateFallbackQuestions(key),
    durationSeconds: 30 * 60,
  };
}

export async function startExamLocal(testKey) {
  const devUser = localStorage.getItem('dev_bypass_user') ? JSON.parse(localStorage.getItem('dev_bypass_user')) : null;
  const uid = auth?.currentUser?.uid || devUser?.id;
  if (!uid) throw new Error('You must be logged in to start the exam.');

  const key = String(testKey);
  if (Number(key) > TOTAL_PROGRAM_DAYS && key !== 'finale') {
    throw new Error(`Day ${key} is not part of the 14-day program.`);
  }

  if (!DEMO_SCHEDULE_BYPASS && Number(key) > ACTIVE_PROGRAM_DAY && key !== 'finale') {
    throw new Error(`Only Day ${ACTIVE_PROGRAM_DAY} exam is active right now.`);
  }

  if (isFirebaseReady() && db) {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
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
  }

  const testData = await loadQuestions(key);
  const questionsWithoutAnswers = stripAnswers(testData.questions);
  const durationSeconds = testData.durationSeconds;

  const session = {
    sessionId: `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    testKey: key,
    questions: questionsWithoutAnswers,
    durationSeconds,
    startedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + durationSeconds * 1000).toISOString(),
    status: 'active',
    proctoring: {
      warningsRemaining: 3,
      tabViolations: 0,
      faceWarnings: 0,
    },
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function submitExamLocal({ sessionId, answers, proctoringViolations }) {
  const devUser = localStorage.getItem('dev_bypass_user') ? JSON.parse(localStorage.getItem('dev_bypass_user')) : null;
  const uid = auth?.currentUser?.uid || devUser?.id;
  if (!uid) throw new Error('You must be logged in to submit the exam.');

  const rawSession = sessionStorage.getItem(SESSION_KEY);
  if (!rawSession) throw new Error('No active exam session found.');

  const session = JSON.parse(rawSession);
  if (session.sessionId !== sessionId) throw new Error('Invalid exam session.');
  if (session.status === 'submitted') throw new Error('Exam already submitted.');

  const key = String(session.testKey);
  const testData = await loadQuestions(key);
  const { score, total, percentage, performance, emoji } = scoreAnswers(
    testData.questions,
    answers || []
  );

  const meta = getExamMeta(key);
  const resultData = {
    testKey: key,
    title: meta.title,
    topicLabel: meta.topicLabel,
    score,
    total,
    percentage,
    performance,
    emoji,
    submittedAt: new Date().toISOString(),
    proctoringViolations: proctoringViolations || {},
  };

  // If Firebase is not configured, save locally
  if (!isFirebaseReady() || !db) {
    try {
      const storedProgress = localStorage.getItem('aptitude_student_progress');
      const progress = storedProgress ? JSON.parse(storedProgress) : { attemptedTests: {} };
      progress.attemptedTests = {
        ...(progress.attemptedTests || {}),
        [key]: resultData,
      };
      localStorage.setItem('aptitude_student_progress', JSON.stringify(progress));
    } catch {
      // Ignore local storage error
    }

    session.status = 'submitted';
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return resultData;
  }

  // Firestore save
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    const userData = userSnap.data() || {};
    const sanitized = sanitizeForFirestore({
      uid,
      testKey: key,
      title: meta.title,
      topicLabel: meta.topicLabel,
      score,
      total,
      percentage,
      performance,
      emoji,
      answers: answers || [],
      submittedAt: resultData.submittedAt,
      tabViolations: proctoringViolations?.tabViolations || 0,
      faceWarnings: proctoringViolations?.faceWarnings || 0,
      rollNumber: userData.rollNumber || '',
      fullName: userData.fullName || '',
      email: userData.email || '',
      branch: userData.branch || '',
    });

    const resultDocId = `${uid}_${key}`;
    await setDoc(doc(db, 'results', resultDocId), sanitized);
    await setDoc(doc(db, 'exam_results', resultDocId), sanitized);

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
  }

  session.status = 'submitted';
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return resultData;
}
