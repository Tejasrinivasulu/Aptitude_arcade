import { useLocation } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { AlertCircle, CheckCircle2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getDayResultsFromProgress,
  performanceTips,
  useStudentProgress,
} from '../context/StudentProgressContext';
import { grandFinale } from '../data/testSchedule';

export default function Results() {
  const { progress } = useStudentProgress();
  const location = useLocation();

  const examResult = location.state?.examSubmitted
    ? {
        testKey: location.state.testKey,
        title: location.state.title,
        score: location.state.score,
        total: location.state.total,
        percentage: location.state.percentage,
        performance: location.state.performance,
        emoji: location.state.emoji,
        submitReason: location.state.submitReason,
        tabViolations: location.state.tabViolations,
        faceWarnings: location.state.faceWarnings,
        sheetUpload: location.state.sheetUpload,
        autoSubmit: location.state.autoSubmit,
      }
    : null;

  const dayResults = getDayResultsFromProgress(progress.attemptedTests);
  const finaleResult = progress.attemptedTests?.finale;

  const completedTestKeys = useMemo(() => {
    return Object.keys(progress.attemptedTests || {}).filter((key) => {
      const attempt = progress.attemptedTests[key];
      return attempt && attempt.answers && attempt.answers.length > 0;
    });
  }, [progress.attemptedTests]);

  const [selectedReviewKey, setSelectedReviewKey] = useState(() => {
    if (examResult) return String(examResult.testKey);
    if (completedTestKeys.length > 0) return String(completedTestKeys[0]);
    return '';
  });
  
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(0);
  const [questionFilter, setQuestionFilter] = useState('all');

  const reviewTestDetails = useMemo(() => {
    if (!selectedReviewKey) return null;
    const attempt = progress.attemptedTests[selectedReviewKey];
    if (!attempt || !attempt.questions) return null; // Requires server sync

    return {
      ...attempt,
      testKey: selectedReviewKey,
    };
  }, [selectedReviewKey, progress.attemptedTests]);

  const handleSelectReview = (key) => {
    setSelectedReviewKey(String(key));
    setSelectedQuestionIdx(0);
    setQuestionFilter('all');
    setTimeout(() => {
      document.getElementById('question-review-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Results</h1>
        <p className="mt-1 text-sm text-gray-500">Track your day-wise performance and improvement areas.</p>
      </div>

      {examResult && (
        <section className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-green-800">Latest exam submitted successfully</p>
          <p className="mt-1 text-2xl font-bold text-green-900">
            {examResult.emoji} {examResult.score}/{examResult.total} · {examResult.percentage}%
          </p>
          <p className="mt-1 text-sm font-medium text-green-800">{examResult.title}</p>
          <p className="text-sm text-green-700">Performance: {examResult.performance}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-green-700">
            <span>Score: {examResult.score}/{examResult.total}</span>
            <span>Percentage: {examResult.percentage}%</span>
            <span>Rank: #{progress.currentRank}</span>
            <span>Submit: {examResult.submitReason || 'manual'}</span>
            {examResult.tabViolations != null && (
              <span>Tab switches: {examResult.tabViolations}</span>
            )}
            {examResult.faceWarnings != null && (
              <span>Face warnings: {examResult.faceWarnings}</span>
            )}
          </div>
          {examResult.sheetUpload && (
            <p
              className={`mt-3 rounded-lg px-3 py-2 text-xs ${
                examResult.sheetUpload.ok
                  ? 'bg-white text-green-800'
                  : examResult.sheetUpload.skipped
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              Google Sheet: {examResult.sheetUpload.message}
            </p>
          )}
          <p className="mt-4 rounded-lg border border-green-300 bg-white px-4 py-3 text-sm font-semibold text-green-900">
            📸 Note: Take a screenshot of this score card for your proof.
          </p>
        </section>
      )}

      {finaleResult && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-amber-800">🏆 Grand Finale Result</p>
          <p className="mt-1 text-2xl font-bold text-amber-900">
            {finaleResult.emoji} {finaleResult.score}/{finaleResult.total} · {finaleResult.percentage}%
          </p>
          <p className="mt-2 text-sm text-amber-800">Final Leaderboard Position: #{progress.currentRank}</p>
          <ul className="mt-3 grid gap-1 text-xs text-amber-700 sm:grid-cols-2">
            {grandFinale.resultFeatures.map((feature) => (
              <li key={feature}>✓ {feature}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Average Score', value: `${progress.averageScore}%` },
          { label: 'Highest Score', value: `${progress.highestScore}%` },
          { label: 'Current Rank', value: `#${progress.currentRank}` },
          { label: 'Tests Completed', value: `${progress.testsCompleted} / 7` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-bold text-gray-900">Day-wise Results</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Day</th>
                <th className="px-6 py-3 font-semibold">Topic</th>
                <th className="px-6 py-3 font-semibold">Score</th>
                <th className="px-6 py-3 font-semibold">Percentage</th>
                <th className="px-6 py-3 font-semibold">Performance</th>
              </tr>
            </thead>
            <tbody>
              {dayResults.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    No test results yet. Complete Day 1 learning and take your first test.
                  </td>
                </tr>
              ) : (
                dayResults.map((row) => {
                  const testKeyStr = row.day.replace('Day ', '');
                  const hasAnswers = !!progress.attemptedTests?.[testKeyStr]?.answers;
                  return (
                    <tr
                      key={row.day}
                      onClick={hasAnswers ? () => handleSelectReview(testKeyStr) : undefined}
                      title={hasAnswers ? "Click to review this test's questions" : undefined}
                      className={`border-t border-gray-100 transition-colors group ${
                        hasAnswers ? 'cursor-pointer hover:bg-primary/5' : ''
                      }`}
                    >
                      <td className={`px-6 py-4 font-medium text-gray-900 transition-colors ${
                        hasAnswers ? 'group-hover:text-primary' : ''
                      }`}>
                        {row.day}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{row.topic}</td>
                      <td className="px-6 py-4 text-gray-600">{row.score}</td>
                      <td className={`px-6 py-4 font-semibold ${hasAnswers ? 'text-primary' : 'text-gray-600'}`}>
                        {row.percentage}%
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                            {row.emoji} {row.performance}
                          </span>
                          {hasAnswers && (
                            <span className="text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              Review Questions →
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {completedTestKeys.length > 0 && selectedReviewKey && reviewTestDetails && (
        <section id="question-review-section" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-fade-in">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Question-by-Question Review</h2>
              <p className="text-xs text-gray-500">Analyze your correct and incorrect answers.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="review-test-select" className="text-xs font-medium text-gray-500">Select Test:</label>
                <select
                  id="review-test-select"
                  value={selectedReviewKey}
                  onChange={(e) => {
                    setSelectedReviewKey(e.target.value);
                    setSelectedQuestionIdx(0);
                    setQuestionFilter('all');
                  }}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-primary focus:bg-white"
                >
                  {completedTestKeys.map((key) => {
                    const label = key === 'finale' ? 'Grand Finale Assessment' : `Day ${key} Assessment`;
                    return (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="filter-select" className="text-xs font-medium text-gray-500">Filter:</label>
                <select
                  id="filter-select"
                  value={questionFilter}
                  onChange={(e) => setQuestionFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-primary focus:bg-white"
                >
                  <option value="all">All Questions</option>
                  <option value="correct">Correct Only</option>
                  <option value="wrong">Wrong Only</option>
                  <option value="skipped">Skipped Only</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 rounded-xl bg-gray-50 p-4 text-xs font-semibold text-gray-600">
              <span className="flex items-center gap-1.5 text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Correct Answers: {reviewTestDetails.score}
              </span>
              <span className="flex items-center gap-1.5 text-red-700">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Wrong/Skipped: {reviewTestDetails.total - reviewTestDetails.score}
              </span>
              <span className="flex items-center gap-1.5 text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Accuracy: {reviewTestDetails.percentage}%
              </span>
            </div>

            {(() => {
              const filteredIndices = reviewTestDetails.questions.map((q, idx) => {
                const userAns = reviewTestDetails.answers?.[idx];
                const correctAns = reviewTestDetails.correctAnswers?.[idx];
                const isCorrect = userAns === correctAns;
                const isSkipped = userAns === null || userAns === undefined;
                const isWrong = !isCorrect && !isSkipped;

                if (questionFilter === 'correct' && !isCorrect) return -1;
                if (questionFilter === 'wrong' && !isWrong) return -1;
                if (questionFilter === 'skipped' && !isSkipped) return -1;
                return idx;
              }).filter(idx => idx !== -1);

              if (filteredIndices.length > 0 && !filteredIndices.includes(selectedQuestionIdx)) {
                setTimeout(() => setSelectedQuestionIdx(filteredIndices[0]), 0);
              }

              return (
                <>
                  <div className="grid grid-cols-5 gap-3 sm:grid-cols-8 md:grid-cols-10">
                    {filteredIndices.map((qIdx) => {
                      const userAns = reviewTestDetails.answers?.[qIdx];
                      const correctAns = reviewTestDetails.correctAnswers?.[qIdx];
                      const isCorrect = userAns === correctAns;
                      const isSkipped = userAns === null || userAns === undefined;

                      let btnClass = "bg-red-50 text-red-700 hover:bg-red-100 border-red-200 shadow-sm";
                      if (isCorrect) btnClass = "bg-green-50 text-green-700 hover:bg-green-100 border-green-200 shadow-sm";
                      else if (isSkipped) btnClass = "bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200 shadow-sm";

                      if (selectedQuestionIdx === qIdx) {
                        btnClass += " ring-2 ring-primary ring-offset-2 scale-110";
                      }

                      return (
                        <button
                          key={qIdx}
                          onClick={() => setSelectedQuestionIdx(qIdx)}
                          title={`View Question ${qIdx + 1}`}
                          className={`flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-bold transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${btnClass}`}
                        >
                          {qIdx + 1}
                        </button>
                      );
                    })}
                    {filteredIndices.length === 0 && (
                       <p className="col-span-full text-sm text-gray-500 py-4 text-center bg-gray-50 rounded-xl border border-gray-100">
                         No questions match this filter.
                       </p>
                    )}
                  </div>

                  {/* Inline Question Details Viewer */}
                  {selectedQuestionIdx !== null && filteredIndices.includes(selectedQuestionIdx) && (
                    <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden animate-slide-up">
                      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">
                          Question {selectedQuestionIdx + 1} Details
                        </h3>
                      </div>
                      
                      <div className="p-6 md:p-8">
                        {(() => {
                          const q = reviewTestDetails.questions[selectedQuestionIdx];
                          const userAns = reviewTestDetails.answers?.[selectedQuestionIdx];
                          const correctAns = reviewTestDetails.correctAnswers?.[selectedQuestionIdx];
                          const isCorrect = userAns === correctAns;
                          const isSkipped = userAns === null || userAns === undefined;

                          return (
                            <div>
                              <div className="flex items-start gap-4 mb-6">
                                <span
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ${
                                    isCorrect
                                      ? 'bg-green-100 text-green-700 border border-green-200'
                                      : isSkipped
                                        ? 'bg-gray-100 text-gray-600 border border-gray-200'
                                        : 'bg-red-100 text-red-700 border border-red-200'
                                  }`}
                                >
                                  {selectedQuestionIdx + 1}
                                </span>
                                <h3 className="text-base font-semibold leading-relaxed text-gray-900 mt-0.5">
                                  {q.question}
                                </h3>
                              </div>

                              <div className="space-y-3 pl-12">
                                {q.options.map((option, optIdx) => {
                                  const isCorrectOpt = optIdx === correctAns;
                                  const isUserSelectedOpt = optIdx === userAns;
                                  
                                  let optStyle = 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50';
                                  let icon = null;

                                  if (isCorrectOpt) {
                                    optStyle = 'border-green-300 bg-green-50 text-green-800 font-medium shadow-sm';
                                    icon = <CheckCircle2 size={18} className="shrink-0 text-green-600" />;
                                  } else if (isUserSelectedOpt && !isCorrect) {
                                    optStyle = 'border-red-300 bg-red-50 text-red-800 font-medium shadow-sm';
                                    icon = <AlertCircle size={18} className="shrink-0 text-red-600" />;
                                  }

                                  return (
                                    <div
                                      key={option}
                                      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition-all ${optStyle}`}
                                    >
                                      <span className="flex items-center gap-3">
                                        <span
                                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                            isCorrectOpt
                                              ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                                              : isUserSelectedOpt
                                                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                                                : 'bg-gray-100 text-gray-600'
                                          }`}
                                        >
                                          {String.fromCharCode(65 + optIdx)}
                                        </span>
                                        {option}
                                      </span>
                                      {icon}
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="mt-8 pl-12">
                                {isCorrect ? (
                                  <div className="rounded-xl bg-green-50 p-4 border border-green-100">
                                    <p className="text-sm font-bold text-green-800 flex items-center gap-2">
                                      <CheckCircle2 size={18} /> Correct response. Well done!
                                    </p>
                                  </div>
                                ) : isSkipped ? (
                                  <div className="rounded-xl bg-amber-50 p-4 border border-amber-100">
                                    <p className="text-sm font-bold text-amber-800 flex items-center gap-2">
                                      <AlertCircle size={18} /> Skipped. Correct answer is Option {String.fromCharCode(65 + correctAns)}.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                                    <p className="text-sm font-bold text-red-800 flex items-center gap-2">
                                      <AlertCircle size={18} /> Incorrect. You selected Option {String.fromCharCode(65 + userAns)}. Correct answer is Option {String.fromCharCode(65 + correctAns)}.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 p-4 bg-gray-50/50">
                        <button
                          onClick={() => {
                            const curr = filteredIndices.indexOf(selectedQuestionIdx);
                            if (curr > 0) setSelectedQuestionIdx(filteredIndices[curr - 1]);
                          }}
                          disabled={filteredIndices.indexOf(selectedQuestionIdx) <= 0}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft size={16} /> Previous
                        </button>
                        
                        <button
                          onClick={() => {
                            const curr = filteredIndices.indexOf(selectedQuestionIdx);
                            if (curr < filteredIndices.length - 1) setSelectedQuestionIdx(filteredIndices[curr + 1]);
                          }}
                          disabled={filteredIndices.indexOf(selectedQuestionIdx) >= filteredIndices.length - 1}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </section>
      )}
    </div>
  );
}
