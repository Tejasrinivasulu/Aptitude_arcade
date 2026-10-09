import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rawStudents = JSON.parse(readFileSync(resolve(__dirname, 'consistent-students-output.json'), 'utf8'));

const evaluated = [];

rawStudents.forEach((student) => {
  // 1. Sort tests chronologically
  const tests = [];
  Object.entries(student.testsDetail || {}).forEach(([day, detail]) => {
    if (detail.submittedAt) {
      tests.push({
        day: Number(day),
        score: detail.score,
        total: detail.total,
        percentage: detail.percentage,
        submittedAt: detail.submittedAt,
        timeMs: new Date(detail.submittedAt).getTime(),
      });
    }
  });

  tests.sort((a, b) => a.timeMs - b.timeMs);

  // 2. Check consecutive submission gaps
  let minGapMinutes = null;
  let totalGapMinutes = 0;
  let gapCount = 0;
  let hasSuspiciousGap = false;
  let suspiciousDetail = null;

  for (let i = 1; i < tests.length; i++) {
    const prev = tests[i - 1];
    const curr = tests[i];
    const diffMs = curr.timeMs - prev.timeMs;
    const diffMins = Math.round(diffMs / (1000 * 60));

    // Under 4 hours is considered same sitting / catch-up
    if (diffMs > 0 && diffMins <= 240) {
      if (minGapMinutes === null || diffMins < minGapMinutes) {
        minGapMinutes = diffMins;
      }
      totalGapMinutes += diffMins;
      gapCount++;

      // Cheating signature: < 5 mins gap with high score (>= 80%) on the second test
      if (diffMins < 5 && curr.percentage >= 80) {
        hasSuspiciousGap = true;
        suspiciousDetail = `Submitted Day ${curr.day} (${curr.score}/${curr.total}) just ${diffMins} min(s) after Day ${prev.day}`;
      }
    }
  }

  const avgGapMinutes = gapCount > 0 ? Math.round(totalGapMinutes / gapCount) : null;

  // 3. Determine Integrity Status
  let integrityStatus = 'VERIFIED_GENUINE';
  let cheatFlag = false;
  let cheatReason = null;

  if (hasSuspiciousGap) {
    integrityStatus = 'SUSPICIOUS_SPEED_SUBMISSION';
    cheatFlag = true;
    cheatReason = suspiciousDetail;
  }

  // 4. Assign Consistency Tier
  let tier = 'TIER_3_PARTICIPANT';
  if (cheatFlag) {
    tier = 'FLAGGED_CHEATING';
  } else if (student.totalAttempted === 12 && student.onTimeCount >= 10 && student.avgPercentage >= 85) {
    tier = 'TIER_1_UNSTOPPABLE_CHAMPION';
  } else if (student.totalAttempted === 12) {
    tier = 'TIER_1_COMPLETED_ALL_12';
  } else if (student.totalAttempted >= 10 && student.avgPercentage >= 75) {
    tier = 'TIER_2_CONSISTENT';
  }

  evaluated.push({
    name: student.name,
    rollNumber: student.rollNumber,
    email: student.email,
    branch: student.branch,
    tier,
    integrityStatus,
    cheatFlag,
    cheatReason,
    totalAttempted: student.totalAttempted,
    onTimeCount: student.onTimeCount,
    avgPercentage: student.avgPercentage,
    totalScore: student.totalScore,
    totalPossible: student.totalPossible,
    advTopicsPercentage: student.advPercentage,
    advTopicsScore: `${student.advScore}/${student.advPossible}`,
    rescheduleCount: student.rescheduleCount,
    minGapMinutesSameDay: minGapMinutes,
    avgGapMinutesSameDay: avgGapMinutes,
    testsSummary: student.testsDetail,
  });
});

// Sort order:
// 1. Non-cheaters first, Cheaters last
// 2. totalAttempted (desc)
// 3. onTimeCount (desc)
// 4. avgPercentage (desc)
// 5. advTopicsPercentage (desc)
evaluated.sort((a, b) => {
  if (a.cheatFlag !== b.cheatFlag) return a.cheatFlag ? 1 : -1;
  if (b.totalAttempted !== a.totalAttempted) return b.totalAttempted - a.totalAttempted;
  if (b.onTimeCount !== a.onTimeCount) return b.onTimeCount - a.onTimeCount;
  if (b.avgPercentage !== a.avgPercentage) return b.avgPercentage - a.avgPercentage;
  return b.advTopicsPercentage - a.advTopicsPercentage;
});

// Assign Rank
let currentRank = 1;
evaluated.forEach((s) => {
  if (!s.cheatFlag) {
    s.rank = currentRank++;
  } else {
    s.rank = 'FLAGGED';
  }
});

const outputPath = resolve(__dirname, 'final-consistent-students.json');
writeFileSync(outputPath, JSON.stringify(evaluated, null, 2));

console.log(`Successfully generated final consistent students report!`);
console.log(`Total students: ${evaluated.length}`);
console.log(`Tier 1 Champions: ${evaluated.filter((s) => s.tier === 'TIER_1_UNSTOPPABLE_CHAMPION').length}`);
console.log(`Tier 1 (Completed 12/12): ${evaluated.filter((s) => s.tier === 'TIER_1_COMPLETED_ALL_12').length}`);
console.log(`Tier 2 Consistent: ${evaluated.filter((s) => s.tier === 'TIER_2_CONSISTENT').length}`);
console.log(`Flagged for Speed Cheating: ${evaluated.filter((s) => s.cheatFlag).length}`);
console.log(`Saved to ${outputPath}`);
