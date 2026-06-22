import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDayPlan, getDayTopicLabel } from '../data/dailyLearningPlan';
import { getPerformanceLevel, getStudentProgramDay, ACTIVE_PROGRAM_DAY } from '../data/testSchedule';
import { useAuth } from './AuthContext';
import { db, isFirebaseReady } from '../utils/firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';

const PROGRESS_KEY = 'aptitude_student_progress';
const PROGRESS_VERSION = 4;

const defaultProgress = {
  progressVersion: PROGRESS_VERSION,
  currentDay: 1,
  learningProgress: 0,
  testsCompleted: 0,
  averageScore: 0,
  highestScore: 0,
  currentRank: 15,
  overallProgress: 0,
  learningCompleted: false,
  attemptedTests: {},
};

function withDerivedProgress(progress) {
  const programDay = getStudentProgramDay(progress.currentDay);
  const attempted = progress.attemptedTests || {};
  const completedCount = Object.keys(attempted).filter((k) => k !== 'finale').length;
  const scores = Object.values(attempted).map((a) => a.percentage);
  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : 0;
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const learningProgress = Math.min(
    100,
    Math.round((completedCount / 7) * 100 + (progress.learningCompleted ? 5 : 0))
  );
  const overallProgress = Math.min(
    100,
    Math.round((completedCount / 7) * 100 + (progress.attemptedTests?.finale ? 10 : 0))
  );

  return {
    ...progress,
    attemptedTests: attempted,
    testsCompleted: completedCount,
    averageScore,
    highestScore,
    learningProgress,
    overallProgress,
    todayTopic: getDayTopicLabel(programDay),
    dayTitle: getDayPlan(programDay).title,
    learningGoal: getDayPlan(programDay).learningGoal,
    dayTopics: getDayPlan(programDay).topics,
    programDay,
  };
}

const StudentProgressContext = createContext(null);

export function StudentProgressProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.progressVersion || parsed.progressVersion < PROGRESS_VERSION) {
          return withDerivedProgress(defaultProgress);
        }
        return withDerivedProgress({ ...defaultProgress, ...parsed });
      }
      return withDerivedProgress(defaultProgress);
    } catch {
      return withDerivedProgress(defaultProgress);
    }
  });

  // Local storage sync
  useEffect(() => {
    const { todayTopic, dayTitle, learningGoal, dayTopics, learningProgress, overallProgress, ...toSave } =
      progress;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(toSave));
  }, [progress]);

  // Firestore sync — results + student_progress
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !isFirebaseReady() || !db) return;

    const resultsQuery = query(collection(db, 'results'), where('uid', '==', user.id));
    const examResultsQuery = query(collection(db, 'exam_results'), where('uid', '==', user.id));

    const mergeResults = (primary, secondary) => {
      const merged = new Map();
      [...primary, ...secondary].forEach((data) => {
        if (data.testKey) merged.set(String(data.testKey), data);
      });
      return merged;
    };

    let primaryResults = [];
    let secondaryResults = [];

    const applyResults = () => {
      const merged = mergeResults(primaryResults, secondaryResults);
      const serverAttemptedTests = {};
      merged.forEach((data, testKey) => {
        serverAttemptedTests[testKey] = {
          score: data.score,
          total: data.total,
          percentage: data.percentage,
          performance: data.performance,
          emoji: data.emoji,
          title: data.title || (testKey === 'finale' ? 'Grand Finale Assessment' : `Day ${testKey} Assessment`),
          submittedAt: data.submittedAt,
          questions: data.questions,
          answers: data.userAnswers,
          userAnswers: data.userAnswers,
          correctAnswers: data.correctAnswers,
          tabViolations: data.tabViolations || 0,
          faceWarnings: data.faceWarnings || 0,
          submitReason: data.submitReason || 'manual',
        };
      });

      setProgress((prev) => {
        const nextDay = determineNextDay(serverAttemptedTests, prev.currentDay);
        return withDerivedProgress({
          ...prev,
          attemptedTests: serverAttemptedTests,
          currentDay: Math.min(nextDay, ACTIVE_PROGRAM_DAY),
        });
      });
    };

    const unsubscribeResults = onSnapshot(resultsQuery, (snapshot) => {
      primaryResults = [];
      snapshot.forEach((d) => primaryResults.push(d.data()));
      applyResults();
    }, (error) => {
      console.error('Error fetching user results:', error);
    });

    const unsubscribeExamResults = onSnapshot(examResultsQuery, (snapshot) => {
      secondaryResults = [];
      snapshot.forEach((d) => secondaryResults.push(d.data()));
      applyResults();
    }, (error) => {
      console.error('Error fetching user exam_results:', error);
    });

    const unsubscribeProgress = onSnapshot(doc(db, 'student_progress', user.id), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setProgress((prev) =>
        withDerivedProgress({
          ...prev,
          currentDay: data.currentDay || prev.currentDay,
          rescheduledTests: data.rescheduledTests || {},
        })
      );
    });

    return () => {
      unsubscribeResults();
      unsubscribeExamResults();
      unsubscribeProgress();
    };
  }, [isAuthenticated, user?.id]);

  const determineNextDay = (attempted, currentDay) => {
    const highestDayFinished = Object.keys(attempted)
      .filter(k => k !== 'finale')
      .map(Number)
      .sort((a,b) => b-a)[0] || 0;
    const next = highestDayFinished + 1;
    const capped = next > 7 ? 7 : Math.max(currentDay, next);
    return Math.min(capped, ACTIVE_PROGRAM_DAY);
  };

  const markLearningComplete = useCallback(() => {
    setProgress((prev) => ({ ...prev, learningCompleted: true }));
  }, []);

  const resetLearningForDemo = useCallback(() => {
    setProgress((prev) => ({ ...prev, learningCompleted: false }));
  }, []);

  const setCurrentDay = useCallback((day) => {
    setProgress((prev) =>
      withDerivedProgress({ ...prev, currentDay: day, learningCompleted: false })
    );
  }, []);

  // Still called to optimistically update before Firestore sync catches up
  const markTestSubmitted = useCallback((testKey, resultData) => {
    setProgress((prev) => {
      const attemptedTests = {
        ...prev.attemptedTests,
        [String(testKey)]: resultData,
      };

      const nextDay = testKey !== 'finale' && Number(testKey) === prev.currentDay && prev.currentDay < 7
        ? prev.currentDay + 1
        : prev.currentDay;

      const rescheduledTests = { ...(prev.rescheduledTests || {}) };
      delete rescheduledTests[String(testKey)];

      return withDerivedProgress({
        ...prev,
        attemptedTests,
        rescheduledTests,
        learningCompleted: testKey !== 'finale' ? false : prev.learningCompleted,
        currentDay: Math.min(Math.max(nextDay, prev.currentDay), ACTIVE_PROGRAM_DAY),
      });
    });
  }, []);

  return (
    <StudentProgressContext.Provider
      value={{
        progress,
        markLearningComplete,
        resetLearningForDemo,
        setCurrentDay,
        markTestSubmitted,
      }}
    >
      {children}
    </StudentProgressContext.Provider>
  );
}

export function useStudentProgress() {
  const ctx = useContext(StudentProgressContext);
  if (!ctx) throw new Error('useStudentProgress must be used within StudentProgressProvider');
  return ctx;
}

export const performanceTips = {
  Excellent: {
    message: 'Outstanding performance! You have mastered this topic.',
    suggestions: ['Practice advanced questions', 'Improve solving speed', 'Attempt challenge quizzes'],
  },
  Good: {
    message: 'Good understanding of concepts with room for improvement.',
    suggestions: ['Revise incorrect answers', 'Focus on accuracy', 'Practice timed tests'],
  },
  Improve: {
    message: 'You are progressing well. Continue practicing to strengthen fundamentals.',
    suggestions: ['Rewatch tutorial videos', 'Solve more practice questions', 'Revise formulas and shortcuts'],
  },
};

export function getDayResultsFromProgress(attemptedTests = {}) {
  return Object.entries(attemptedTests)
    .filter(([key]) => key !== 'finale')
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([key, result]) => ({
      day: `Day ${key}`,
      topic: result.topic || result.title,
      score: `${result.score}/${result.total}`,
      percentage: result.percentage,
      performance: result.performance,
      emoji: result.emoji,
    }));
}
