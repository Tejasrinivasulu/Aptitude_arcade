import { getDayPlan } from './dailyLearningPlan';

export const TEST_START_HOUR = 10;
export const TEST_START_MINUTE = 0;
export const TEST_END_HOUR = 23;
export const TEST_END_MINUTE = 0;

/** Day 1 exam date and live window (IST) — 23 June, 10:00 AM to 11:00 PM */
export const DAY1_EXAM_DATE = '2026-06-23';

export const DAY1_EXAM_WINDOW = {
  date: DAY1_EXAM_DATE,
  startHour: TEST_START_HOUR,
  startMinute: TEST_START_MINUTE,
  endHour: TEST_END_HOUR,
  endMinute: TEST_END_MINUTE,
  durationMinutes: 30,
};

/** Day 2 exam date (IST) — 24 June */
export const DAY2_EXAM_DATE = '2026-06-24';

/** Day 3 exam date (IST) — 25 June */
export const DAY3_EXAM_DATE = '2026-06-25';

/** Day 4 exam date (IST) — 26 June */
export const DAY4_EXAM_DATE = '2026-06-26';

/** Only this day is live for students right now. Increase to 2, 3… when each day opens. */
export const ACTIVE_PROGRAM_DAY = 4;

/** Total days in the program (Day 4 is the last daily test). */
export const TOTAL_PROGRAM_DAYS = 4;

export const PROGRAM_DAY_KEYS = ['1', '2', '3', '4'];

/** Allows assigned-day test outside calendar date for development */
export const DEMO_SCHEDULE_BYPASS = false;

function getRelativeDateStr(offsetDays) {
  const d = new Date('2026-06-23T00:00:00');
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dateVal = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dateVal}`;
}

export const dailyTests = [
  {
    id: 1,
    day: 1,
    title: 'Number Systems',
    topics: ['Number Systems'],
    testDate: DAY1_EXAM_DATE,
    questions: 30,
    durationMinutes: 30,
  },
  {
    id: 2,
    day: 2,
    title: 'Percentages',
    topics: ['Percentages'],
    testDate: DAY2_EXAM_DATE,
    questions: 30,
    durationMinutes: 30,
  },
  {
    id: 3,
    day: 3,
    title: 'Ratio and Proportion',
    topics: ['Ratio and Proportion'],
    testDate: DAY3_EXAM_DATE,
    questions: 30,
    durationMinutes: 30,
  },
  {
    id: 4,
    day: 4,
    title: 'Averages',
    topics: ['Averages'],
    testDate: DAY4_EXAM_DATE,
    questions: 30,
    durationMinutes: 30,
  },
];

export const grandFinale = {
  id: 'finale',
  title: 'Grand Finale Assessment',
  testDate: getRelativeDateStr(5),
  topics: [
    'Number Systems',
    'Percentages',
    'Averages',
    'Profit & Loss',
    'Ratio & Proportion',
    'Simple Interest',
    'Compound Interest',
    'Time & Work',
    'Time Speed Distance',
    'Coding-Decoding',
    'Blood Relations',
    'Directions',
    'Series',
    'Seating Arrangements',
    'Permutations & Combinations',
    'Probability',
    'Data Interpretation',
  ],
  questions: 50,
  durationMinutes: 60,
  resultFeatures: [
    'Score',
    'Percentage',
    'Rank',
    'Performance Level',
    'Personalized Suggestions',
    'Topic-wise Analysis',
    'Final Leaderboard Position',
  ],
};

function parseDateOnly(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDisplayDate(dateStr) {
  return parseDateOnly(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatWindowTime(hour, minute = 0) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  const mins = minute ? `:${String(minute).padStart(2, '0')}` : ':00';
  return `${h}${mins} ${period}`;
}

export const generalRules = [
  `Day 4 Test Date: ${formatDisplayDate(DAY4_EXAM_DATE)}`,
  `Test Window: ${formatWindowTime(TEST_START_HOUR, TEST_START_MINUTE)} – ${formatWindowTime(TEST_END_HOUR, TEST_END_MINUTE)} IST`,
  'Day 4 exam duration: 30 minutes once started.',
  'Students can attempt the test only once.',
  'The test remains available only during the daily window.',
  `After ${formatWindowTime(TEST_END_HOUR, TEST_END_MINUTE)}, the test is automatically closed.`,
  'If a student misses the test, contact admin via Help Center.',
  'After submitting the test, take a screenshot of your score card as proof of completion.',
];

export function getTodayDateStr(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWindowBoundsForDate(dateStr) {
  const day = parseDateOnly(dateStr);
  const start = new Date(day);
  start.setHours(TEST_START_HOUR, TEST_START_MINUTE, 0, 0);
  const end = new Date(day);
  end.setHours(TEST_END_HOUR, TEST_END_MINUTE, 0, 0);
  return { start, end };
}

export function getCalendarDayFromDate(now = new Date()) {
  const match = dailyTests.find((test) => isSameDay(parseDateOnly(test.testDate), now));
  return match?.day ?? null;
}

export function getDailyTest(day) {
  return dailyTests.find((t) => t.day === day) ?? dailyTests[0];
}

export function getPerformanceLevel(percentage) {
  if (percentage >= 85) return { label: 'Excellent', emoji: '🌟' };
  if (percentage >= 70) return { label: 'Good', emoji: '👍' };
  return { label: 'Improve', emoji: '📈' };
}

export function getTestWindowPhase(testDate, now = new Date()) {
  const { start, end } = getWindowBoundsForDate(testDate);
  const testDay = parseDateOnly(testDate);

  if (now < start && isSameDay(testDay, now)) return 'before_window';
  if (now >= start && now <= end && isSameDay(testDay, now)) return 'open';
  if (isSameDay(testDay, now) && now > end) return 'closed_today';
  if (now > end && testDay < new Date(now.getFullYear(), now.getMonth(), now.getDate())) return 'missed';
  return 'upcoming';
}

export function getActiveProgramDay() {
  return ACTIVE_PROGRAM_DAY;
}

/** Calendar program day — today's live assigned test (not tied to student completion progress). */
export function getTodaysAssignedDay() {
  return ACTIVE_PROGRAM_DAY;
}

export function getStudentProgramDay(currentDay = 1) {
  return Math.min(Number(currentDay) || 1, ACTIVE_PROGRAM_DAY);
}

export function computeTestCountdown(testDate, now = new Date()) {
  const { start, end } = getWindowBoundsForDate(testDate);
  const testDay = parseDateOnly(testDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (now > end && (isSameDay(testDay, now) || testDay < today)) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      isReady: false,
      isExpired: true,
      totalMs: 0,
    };
  }

  if (now >= start && now <= end && isSameDay(testDay, now)) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      isReady: true,
      isExpired: false,
      totalMs: 0,
    };
  }

  const diff = Math.max(0, start.getTime() - now.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    hours,
    minutes,
    seconds,
    isReady: diff === 0,
    isExpired: false,
    totalMs: diff,
  };
}

export function formatCountdownParts({ hours, minutes, seconds }) {
  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

export function getTestAvailability({
  testKey,
  attemptedTests = {},
  rescheduledTests = {},
  currentDay = 1,
  now = new Date(),
}) {
  const isFinale = testKey === 'finale';
  const key = String(testKey);
  const test = isFinale ? grandFinale : getDailyTest(Number(testKey));
  const attempt = attemptedTests[key];
  const isRescheduled = rescheduledTests[key] === true;
  const testDayNum = Number(testKey);
  const expiredCountdown = {
    hours: 0,
    minutes: 0,
    seconds: 0,
    isReady: false,
    isExpired: true,
    totalMs: 0,
  };

  if (attempt && !isRescheduled) {
    return {
      status: 'completed',
      label: 'Completed',
      color: 'green',
      canStart: false,
      message: `Attempted · Score ${attempt.score}/${attempt.total} (${attempt.percentage}%)`,
      test,
      countdown: computeTestCountdown(test.testDate, now, testKey),
    };
  }

  if (isRescheduled) {
    return {
      status: 'open',
      label: 'Rescheduled',
      color: 'amber',
      canStart: true,
      message: 'Admin granted a retake. You may start the test now.',
      test,
      countdown: { hours: 0, minutes: 0, seconds: 0, isReady: true, isExpired: false, totalMs: 0 },
    };
  }

  if (!isFinale && testDayNum > ACTIVE_PROGRAM_DAY) {
    return {
      status: 'locked',
      label: 'Coming Soon',
      color: 'gray',
      canStart: false,
      message: `Day ${testKey} is not open yet. The program is on Day ${ACTIVE_PROGRAM_DAY} only.`,
      test,
      countdown: computeTestCountdown(test.testDate, now, testKey),
    };
  }

  if (!isFinale && testDayNum < ACTIVE_PROGRAM_DAY) {
    return {
      status: 'missed',
      label: 'Expired',
      color: 'red',
      canStart: false,
      message: 'Test window closed. Access has expired permanently.',
      test,
      countdown: expiredCountdown,
    };
  }

  if (isFinale) {
    return {
      status: 'locked',
      label: 'Locked',
      color: 'gray',
      canStart: false,
      message: `Grand Finale unlocks after all ${TOTAL_PROGRAM_DAYS} daily tests are complete.`,
      test,
      countdown: computeTestCountdown(test.testDate, now, testKey),
    };
  }

  const countdown = computeTestCountdown(test.testDate, now, testKey);

  if (countdown.isExpired) {
    return {
      status: 'missed',
      label: 'Expired',
      color: 'red',
      canStart: false,
      message: 'Test window closed. Access has expired permanently.',
      test,
      countdown,
    };
  }

  if (countdown.isReady) {
    return {
      status: 'open',
      label: 'Open Now',
      color: 'green',
      canStart: true,
      message: `Test window is open until ${formatWindowTime(TEST_END_HOUR, TEST_END_MINUTE)}.`,
      test,
      countdown,
    };
  }

  return {
    status: 'upcoming',
    label: 'Scheduled',
    color: 'blue',
    canStart: false,
    message: `Test opens on ${formatDisplayDate(test.testDate)} at ${formatWindowTime(TEST_START_HOUR)}.`,
    test,
    countdown,
  };
}

export function formatDay1ExamWindow() {
  return `${formatDisplayDate(DAY1_EXAM_DATE)} · ${formatWindowTime(TEST_START_HOUR, TEST_START_MINUTE)} – ${formatWindowTime(TEST_END_HOUR, TEST_END_MINUTE)} IST`;
}

export function formatDay2ExamWindow() {
  return `${formatDisplayDate(DAY2_EXAM_DATE)} · ${formatWindowTime(TEST_START_HOUR, TEST_START_MINUTE)} – ${formatWindowTime(TEST_END_HOUR, TEST_END_MINUTE)} IST`;
}

export function formatDay3ExamWindow() {
  return `${formatDisplayDate(DAY3_EXAM_DATE)} · ${formatWindowTime(TEST_START_HOUR, TEST_START_MINUTE)} – ${formatWindowTime(TEST_END_HOUR, TEST_END_MINUTE)} IST`;
}

export function formatDay4ExamWindow() {
  return `${formatDisplayDate(DAY4_EXAM_DATE)} · ${formatWindowTime(TEST_START_HOUR, TEST_START_MINUTE)} – ${formatWindowTime(TEST_END_HOUR, TEST_END_MINUTE)} IST`;
}

export function formatExamWindowForDay(day) {
  if (Number(day) === 4) return formatDay4ExamWindow();
  if (Number(day) === 3) return formatDay3ExamWindow();
  if (Number(day) === 2) return formatDay2ExamWindow();
  return formatDay1ExamWindow();
}

export function getAssignedTestSummary(currentDay) {
  const plan = getDayPlan(currentDay);
  const test = getDailyTest(currentDay);
  return {
    ...test,
    topics: plan.topics,
    topicLabel: plan.topics.join(' · '),
  };
}
