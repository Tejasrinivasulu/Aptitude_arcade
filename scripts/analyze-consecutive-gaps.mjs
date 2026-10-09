import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(resolve(__dirname, 'consistent-students-output.json'), 'utf8'));

const analysis = [];

data.forEach((student) => {
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

  const consecutivePairs = [];
  for (let i = 1; i < tests.length; i++) {
    const prev = tests[i - 1];
    const curr = tests[i];
    const diffMs = curr.timeMs - prev.timeMs;
    const diffMins = Math.round(diffMs / (1000 * 60));

    // Focus on tests taken within 4 hours (240 mins) of each other (same sitting / same day catch-up)
    if (diffMs > 0 && diffMins <= 240) {
      const isSuspicious = diffMins < 5;
      const isFast = diffMins >= 5 && diffMins < 12;
      const isNormal = diffMins >= 12 && diffMins <= 45;
      consecutivePairs.push({
        fromDay: prev.day,
        toDay: curr.day,
        fromTime: prev.submittedAt,
        toTime: curr.submittedAt,
        gapMinutes: diffMins,
        status: isSuspicious ? '🚨 VERY SUSPICIOUS (<5m)' : isFast ? '⚡ FAST (5-12m)' : isNormal ? '✅ NORMAL SOLVING (12-45m)' : '⏳ SPREAD OUT (>45m)',
        fromScore: `${prev.score}/${prev.total}`,
        toScore: `${curr.score}/${curr.total}`,
      });
    }
  }

  if (consecutivePairs.length > 0) {
    const avgGap = Math.round(consecutivePairs.reduce((sum, p) => sum + p.gapMinutes, 0) / consecutivePairs.length);
    const minGap = Math.min(...consecutivePairs.map((p) => p.gapMinutes));
    analysis.push({
      name: student.name,
      rollNumber: student.rollNumber,
      branch: student.branch,
      totalAttempted: student.totalAttempted,
      avgPercentage: student.avgPercentage,
      sameDayTestsCount: consecutivePairs.length + 1,
      avgGapMinutes: avgGap,
      minGapMinutes: minGap,
      hasSuspicious: minGap < 5,
      pairs: consecutivePairs,
    });
  }
});

// Sort by minGapMinutes (ascending) so the fastest/most suspicious are at the top, followed by normal
analysis.sort((a, b) => a.minGapMinutes - b.minGapMinutes);

writeFileSync(resolve(__dirname, 'consecutive-gaps-output.json'), JSON.stringify(analysis, null, 2));

console.log(`Analyzed ${analysis.length} students who took multiple tests in the same sitting.`);
console.log(`Found ${analysis.filter((s) => s.hasSuspicious).length} students with gaps under 5 minutes!`);
