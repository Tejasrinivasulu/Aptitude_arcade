// ============================================================
// Client-side exam metadata ONLY
// Answer keys have been moved to functions/questions/ (server-side)
// This file provides display metadata for the schedule/countdown UI
// ============================================================

import { DAY1_DURATION_SECONDS, DAY1_TOTAL_QUESTIONS } from './day1QuestionBank';

export const EXAM_DURATION_SECONDS = 20 * 60;
export const EXAM_TOTAL_QUESTIONS = 20;
export const FINALE_DURATION_SECONDS = 60 * 60;
export const FINALE_TOTAL_QUESTIONS = 50;

const dayTopics = {
  1: 'Number Systems',
  2: 'Commercial Mathematics',
  3: 'Time-Based Problems',
  4: 'Logical Reasoning Basics',
  5: 'Advanced Logical Reasoning',
  6: 'Advanced Quantitative',
  7: 'Data Interpretation & Revision',
};

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
  const day = Number(testKey);
  if (day === 1) {
    return {
      testKey: '1',
      title: 'Day 1 Assessment',
      topicLabel: dayTopics[1],
      totalQuestions: DAY1_TOTAL_QUESTIONS,
      durationSeconds: DAY1_DURATION_SECONDS,
      durationMinutes: 30,
    };
  }
  return {
    testKey: String(day),
    title: `Day ${day} Assessment`,
    topicLabel: dayTopics[day] || `Day ${day} Aptitude Test`,
    totalQuestions: EXAM_TOTAL_QUESTIONS,
    durationSeconds: EXAM_DURATION_SECONDS,
    durationMinutes: 20,
  };
}

// Legacy alias for backward compat — returns metadata only, NO questions
export function getExamForTest(testKey) {
  return { ...getExamMeta(testKey), questions: [] };
}
