import { getDayPlan } from './dailyLearningPlan.js';
import { getTrustedNow } from '../utils/serverTime.js';

export const TEST_START_HOUR = 10;
export const TEST_START_MINUTE = 0;
/** Window closes at noon on the day after the test date (e.g. Day 1: today 10 AM → tomorrow 12 PM). */
export const TEST_END_HOUR = 12;
export const TEST_END_MINUTE = 0;
export const TEST_END_OFFSET_DAYS = 1;

/** New 14-Day Series Start Date: Monday, September 28, 2026 */
export const SERIES_START_DATE = '2026-09-28';

export function getRelativeDateStr(offsetDays) {
  const d = new Date(`${SERIES_START_DATE}T00:00:00`);
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dateVal = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dateVal}`;
}

export const DAY1_EXAM_DATE = getRelativeDateStr(0); // 2026-09-28
export const DAY2_EXAM_DATE = getRelativeDateStr(1);
export const DAY3_EXAM_DATE = getRelativeDateStr(2);
export const DAY4_EXAM_DATE = getRelativeDateStr(3);

export const DAY1_EXAM_WINDOW = {
  date: DAY1_EXAM_DATE,
  startHour: TEST_START_HOUR,
  startMinute: TEST_START_MINUTE,
  endHour: TEST_END_HOUR,
  endMinute: TEST_END_MINUTE,
  durationMinutes: 30,
};

/** Total days in the daily series (concluded at 12 continuous daily tests) */
export const TOTAL_PROGRAM_DAYS = 12;

export const PROGRAM_DAY_KEYS = Array.from({ length: TOTAL_PROGRAM_DAYS }, (_, i) => String(i + 1));

/** Catch-Up Open Window: All unattempted tests (Days 1–12) are open from Saturday 10:00 AM to Sunday 11:59:59 PM IST */
export const CATCHUP_WINDOW_START = '2026-10-10T10:00:00+05:30';
export const CATCHUP_WINDOW_END = '2026-10-11T23:59:59+05:30';
export const CATCHUP_MAX_DAY = 12;

export function isCatchupActive(now = getTrustedNow()) {
  const start = new Date(CATCHUP_WINDOW_START);
  const end = new Date(CATCHUP_WINDOW_END);
  return now >= start && now <= end;
}

export function isCatchupEligible(testKey) {
  const num = Number(testKey);
  return num >= 1 && num <= CATCHUP_MAX_DAY;
}

/** Calculate active program day based on calendar timeline (1 to 14) */
export function calculateActiveProgramDay(now = getTrustedNow()) {
  const start = new Date(`${SERIES_START_DATE}T00:00:00+05:30`);
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays < 1) return 1;
  if (diffDays > TOTAL_PROGRAM_DAYS) return TOTAL_PROGRAM_DAYS;
  return diffDays;
}

export const ACTIVE_PROGRAM_DAY = calculateActiveProgramDay();

/** Allows assigned-day test outside calendar date for development and inspection */
export const DEMO_SCHEDULE_BYPASS = false;

const TOPIC_TITLES = [
  'Number System',
  'Percentages',
  'Ratio & Proportion',
  'Averages',
  'Profit, Loss & Discount',
  'Simple & Compound Interest',
  'Problems on Ages',
  'Time & Work',
  'Pipes & Cisterns',
  'Time, Speed & Distance',
  'Problems on Trains',
  'Permutation & Combination',
  'Mixtures & Alligation',
  'Probability',
];

export const dailyTests = Array.from({ length: TOTAL_PROGRAM_DAYS }, (_, idx) => {
  const day = idx + 1;
  const title = TOPIC_TITLES[idx] || `Day ${day} Assessment`;
  const is25 = day === 2 || day === 3 || day === 4 || day === 5 || day === 6 || day === 7 || day === 8 || day === 9 || day === 10 || day === 11 || day === 12;
  return {
    id: day,
    day,
    title,
    topics: [title],
    testDate: getRelativeDateStr(idx),
    questions: is25 ? 25 : 30,
    durationMinutes: is25 ? 25 : 30,
  };
});

export const grandFinale = {
  id: 'finale',
  title: 'Grand Finale Assessment',
  testDate: getRelativeDateStr(14),
  topics: TOPIC_TITLES,
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
  if (!dateStr) return '';
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

export function formatWindowRangeLabel() {
  return `${formatWindowTime(TEST_START_HOUR, TEST_START_MINUTE)} – ${formatWindowTime(TEST_END_HOUR, TEST_END_MINUTE)} IST next day`;
}

export const generalRules = [
  `14-Day Series Start Date: ${formatDisplayDate(DAY1_EXAM_DATE)}`,
  `Daily Test Window: ${formatWindowRangeLabel()}`,
  'Daily exam duration: 30 minutes once started.',
  'Students can attempt each test only once.',
  'The test remains available only during the daily window.',
  `Each day's window opens at ${formatWindowTime(TEST_START_HOUR, TEST_START_MINUTE)} and closes at ${formatWindowTime(TEST_END_HOUR, TEST_END_MINUTE)} IST the next day.`,
  'If you face technical difficulties, contact admin via the Help Center immediately.',
  'After submitting the test, review your score breakdown on the results screen.',
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
  end.setDate(end.getDate() + TEST_END_OFFSET_DAYS);
  end.setHours(TEST_END_HOUR, TEST_END_MINUTE, 0, 0);
  return { start, end };
}

export function getCalendarDayFromDate(now = getTrustedNow()) {
  const match = dailyTests.find((test) => isSameDay(parseDateOnly(test.testDate), now));
  return match?.day ?? null;
}

export function getDailyTest(day) {
  const num = Number(day) || 1;
  return dailyTests.find((t) => t.day === num) ?? dailyTests[0];
}

export function getPerformanceLevel(percentage) {
  if (percentage >= 85) return { label: 'Excellent', emoji: '🌟' };
  if (percentage >= 70) return { label: 'Good', emoji: '👍' };
  return { label: 'Improve', emoji: '📈' };
}

export function getTestWindowPhase(testDate, now = getTrustedNow()) {
  const { start, end } = getWindowBoundsForDate(testDate);

  if (now < start) return 'before_window';
  if (now >= start && now <= end) return 'open';
  if (now > end) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    if (isSameDay(endDay, today)) return 'closed_today';
    return 'missed';
  }
  return 'upcoming';
}

export function getActiveProgramDay(now = getTrustedNow()) {
  return calculateActiveProgramDay(now);
}

/** Calendar program day — today's live assigned test */
export function getTodaysAssignedDay(now = getTrustedNow()) {
  return calculateActiveProgramDay(now);
}

export function getStudentProgramDay(currentDay = 1) {
  return Math.min(Number(currentDay) || 1, getActiveProgramDay());
}

export function computeTestCountdown(testDate, now = getTrustedNow(), testKey = null) {
  const numKey = Number(testKey);
  if (numKey && isCatchupActive(now) && isCatchupEligible(numKey)) {
    const catchupEnd = new Date(CATCHUP_WINDOW_END);
    const diffMs = Math.max(0, catchupEnd.getTime() - now.getTime());
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      hours,
      minutes,
      seconds,
      isReady: true,
      isExpired: false,
      totalMs: diffMs,
    };
  }

  const { start, end } = getWindowBoundsForDate(testDate);

  // During bypass for Day 1: keep window live until the configured end bound
  const isDay1Active = testKey === '1' || testKey === 1 || testDate === DAY1_EXAM_DATE;
  if (DEMO_SCHEDULE_BYPASS && isDay1Active) {
    const { end: bypassEnd } = getWindowBoundsForDate(DAY1_EXAM_DATE);
    if (now < bypassEnd) {
      const diffMs = Math.max(0, bypassEnd.getTime() - now.getTime());
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return {
        hours,
        minutes,
        seconds,
        isReady: true,
        isExpired: false,
        totalMs: diffMs,
      };
    }
  }

  if (now > end) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      isReady: false,
      isExpired: true,
      totalMs: 0,
    };
  }

  if (now >= start && now <= end) {
    // Window is LIVE — countdown until next-day noon close
    const diffMs = Math.max(0, end.getTime() - now.getTime());
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      hours,
      minutes,
      seconds,
      isReady: true,
      isExpired: false,
      totalMs: diffMs,
    };
  }

  // Before window (upcoming): Countdown until 10:00 AM start
  const diffMs = Math.max(0, start.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    isReady: false,
    isExpired: false,
    totalMs: diffMs,
  };
}

export function formatCountdownParts({ hours, minutes, seconds }) {
  const pad = (n) => String(n).padStart(2, '0');
  return {
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  };
}

export function getTestAvailability({
  testKey,
  attemptedTests = {},
  rescheduledTests = {},
  currentDay = 1,
  now = getTrustedNow(),
}) {
  const isFinale = testKey === 'finale';
  const key = String(testKey);
  const test = isFinale ? grandFinale : getDailyTest(Number(testKey));
  const attempt = attemptedTests[key];
  const isRescheduled = rescheduledTests[key] === true;
  const testDayNum = Number(testKey);
  const activeDay = getActiveProgramDay(now);

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
      countdown: computeTestCountdown(test.testDate, now, testKey),
    };
  }

  if (isFinale) {
    const finaleBounds = getWindowBoundsForDate(grandFinale.testDate);
    const finaleCountdown = computeTestCountdown(grandFinale.testDate, now, 'finale');
    if (now < finaleBounds.start) {
      return {
        status: 'locked',
        label: 'Upcoming',
        color: 'gray',
        canStart: false,
        message: `Grand Finale unlocks on Monday, October 12 at ${formatWindowTime(TEST_START_HOUR, TEST_START_MINUTE)} IST.`,
        test: grandFinale,
        countdown: finaleCountdown,
      };
    }
    if (now >= finaleBounds.start && now <= finaleBounds.end) {
      return {
        status: 'open',
        label: 'Open Now',
        color: 'green',
        canStart: true,
        message: 'Grand Finale is LIVE! Complete your final assessment.',
        test: grandFinale,
        countdown: finaleCountdown,
      };
    }
    return {
      status: 'missed',
      label: 'Expired',
      color: 'red',
      canStart: false,
      message: 'Grand Finale assessment has concluded.',
      test: grandFinale,
      countdown: expiredCountdown,
    };
  }

  // Weekend Open Window: All unattempted tests (Days 1–12) are unlocked from Saturday 10:00 AM to Sunday 11:59:59 PM IST
  if (isCatchupActive(now) && isCatchupEligible(testDayNum)) {
    const catchupCountdown = computeTestCountdown(test.testDate, now, testKey);
    return {
      status: 'open',
      label: 'Open Now',
      color: 'green',
      canStart: true,
      message: 'Weekend Open Window: Available until Sunday, Oct 11 at 11:59 PM IST.',
      test,
      countdown: catchupCountdown,
    };
  }

  // ALL FUTURE DAYS ARE STRICTLY LOCKED — NO EXCEPTIONS!
  if (!isFinale && testDayNum > activeDay) {
    return {
      status: 'locked',
      label: 'Locked',
      color: 'gray',
      canStart: false,
      message: `Day ${testKey} is locked. Opens on ${formatDisplayDate(test.testDate)} at ${formatWindowTime(TEST_START_HOUR, TEST_START_MINUTE)} IST.`,
      test,
      countdown: computeTestCountdown(test.testDate, now, testKey),
    };
  }

  // Past or current calendar day — respect extended window (opens day X 10 AM, closes day X+1 12 PM)
  const countdown = computeTestCountdown(test.testDate, now, testKey);

  if (countdown.isExpired) {
    return {
      status: 'missed',
      label: 'Expired',
      color: 'red',
      canStart: false,
      message: 'Test window closed. Access has expired permanently.',
      test,
      countdown: testDayNum < activeDay ? expiredCountdown : countdown,
    };
  }

  if (countdown.isReady) {
    const { end } = getWindowBoundsForDate(test.testDate);
    return {
      status: 'open',
      label: 'Open Now',
      color: 'green',
      canStart: true,
      message: `Test window is open until ${formatDisplayDate(getTodayDateStr(end))} at ${formatWindowTime(TEST_END_HOUR, TEST_END_MINUTE)} IST.`,
      test,
      countdown,
    };
  }

  if (DEMO_SCHEDULE_BYPASS) {
    return {
      status: 'open',
      label: 'Open (Bypass)',
      color: 'green',
      canStart: true,
      message: `Test opens on ${formatDisplayDate(test.testDate)} at ${formatWindowTime(TEST_START_HOUR)}. (Testing bypass active)`,
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

export function formatExamWindowForDay(day) {
  const test = getDailyTest(Number(day));
  if (!test) return '';
  return `${formatDisplayDate(test.testDate)} · ${formatWindowRangeLabel()}`;
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
