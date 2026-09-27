// ============================================================
// Client-side exam metadata ONLY
// This file provides display metadata for the schedule/countdown UI
// ============================================================

import { DAY_TOPICS } from '../utils/adminData';

export const EXAM_DURATION_SECONDS = 30 * 60;
export const EXAM_TOTAL_QUESTIONS = 30;
export const FINALE_DURATION_SECONDS = 60 * 60;
export const FINALE_TOTAL_QUESTIONS = 50;

export function getExamMeta(testKey) {
  if (testKey === 'finale') {
    return {
      testKey: 'finale',
      title: 'Grand Finale Assessment',
      topicLabel: 'All Topics · Comprehensive Assessment',
      totalQuestions: FINALE_TOTAL_QUESTIONS,
      durationSeconds: FINALE_DURATION_SECONDS,
      durationMinutes: 60,
    };
  }
  const day = Number(testKey) || 1;
  const topic = DAY_TOPICS[String(day)] || `Day ${day} Aptitude`;
  return {
    testKey: String(day),
    title: `Day ${day} Assessment`,
    topicLabel: topic,
    totalQuestions: EXAM_TOTAL_QUESTIONS,
    durationSeconds: EXAM_DURATION_SECONDS,
    durationMinutes: 30,
  };
}

// Legacy alias for backward compat — returns metadata only, NO questions
export function getExamForTest(testKey) {
  return { ...getExamMeta(testKey), questions: [] };
}
