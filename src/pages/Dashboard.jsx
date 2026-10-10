import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, TrendingUp, CheckCircle2, Award, Rocket, Check, X, Lock, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudentProgress, getDayResultsFromProgress } from '../context/StudentProgressContext';
import {
  getDailyTest,
  computeTestCountdown,
  formatCountdownParts,
  formatExamWindowForDay,
  getTodaysAssignedDay,
  TOTAL_PROGRAM_DAYS,
  formatDisplayDate,
  isCatchupActive,
} from '../data/testSchedule';
import { getDayPlan } from '../data/dailyLearningPlan';

export default function Dashboard() {
  const { user } = useAuth();
  const { progress } = useStudentProgress();
  const firstName = user?.fullName?.split(' ')[0] || 'Student';
  const assignedDay = getTodaysAssignedDay();
  const assignedAttempt = progress.attemptedTests?.[String(assignedDay)];
  const testDone = !!assignedAttempt;
  
  const [timeLeft, setTimeLeft] = useState('');
  const [isTestLive, setIsTestLive] = useState(false);

  const assignedTest = getDailyTest(assignedDay);
  const upcomingDays = [assignedDay + 1, assignedDay + 2].filter((d) => d <= TOTAL_PROGRAM_DAYS);

  useEffect(() => {
    const updateTimer = () => {
      if (!assignedTest) return;
      const cd = computeTestCountdown(assignedTest.testDate, new Date(), assignedDay);
      setIsTestLive(cd.isReady);
      if (!cd.isExpired) {
        const parts = formatCountdownParts(cd);
        setTimeLeft(`${parts.hours}:${parts.minutes}:${parts.seconds}`);
      } else {
        setTimeLeft('');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [assignedTest?.testDate, assignedDay]);

  const testStatus = testDone ? 'Completed' : (isTestLive ? 'Live' : 'Scheduled');
  const pastResults = getDayResultsFromProgress(progress.attemptedTests).reverse();

  return (
    <div className="animate-fade-in space-y-6">
      <section className="rounded-3xl bg-[#09090b] p-6 text-white shadow-2xl lg:p-10 relative overflow-hidden border border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-[#ff6a2b]/30 blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-48 w-48 rounded-full bg-orange-500/20 blur-[60px]"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-black lg:text-4xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Welcome Back, {firstName}</h1>
          <p className="mt-2 text-gray-400 font-medium">Ready to continue your aptitude journey?</p>
          <StreakIndicator progress={progress} />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Calendar} title="Current Day" value={`Day ${assignedDay} of ${TOTAL_PROGRAM_DAYS}`} />
        <StatCard icon={TrendingUp} title="Learning Progress" value={`${progress.learningProgress}%`} progress={progress.learningProgress} />
        <StatCard icon={CheckCircle2} title="Tests Completed" value={`${progress.testsCompleted} / ${TOTAL_PROGRAM_DAYS}`} />
        <StatCard icon={Award} title="Average Score" value={`${progress.averageScore}%`} accent />
      </div>

      {isCatchupActive() ? (
        <section className="rounded-3xl border-2 border-emerald-400/40 bg-gradient-to-br from-emerald-500/10 via-white to-amber-500/5 p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Sparkles size={14} className="text-emerald-600 animate-pulse" />
                WEEKEND OPEN ACCESS · CATCH-UP WINDOW LIVE
              </span>
              <h2 className="mt-2.5 text-2xl font-black text-gray-900">
                All Tests (Days 1–{TOTAL_PROGRAM_DAYS}) Are Open!
              </h2>
              <p className="mt-1 text-sm text-gray-600 max-w-xl">
                The {TOTAL_PROGRAM_DAYS}-day daily series has concluded. Missed any test earlier? You can attempt any unattempted daily assessments right now before Sunday 11:59 PM IST!
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-emerald-700">
                <span>⏱️ Window closes Sunday, Oct 11 at 11:59 PM IST</span>
                <span>·</span>
                <span>Grand Finale on Tuesday, Oct 13 at 10 AM (In-College)</span>
              </div>
            </div>
            <Link
              to="/student/take-test"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition-all"
            >
              <Rocket size={18} />
              Take Unattempted Tests
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Current Challenge</p>
              <h2 className="mt-1 text-xl font-bold text-gray-900">
                Day {assignedDay} — {getDailyTest(assignedDay).title}
              </h2>
              <p className="mt-1 text-sm font-medium text-primary">{progress.dayTopics?.join(' · ') || getDailyTest(assignedDay).topics.join(' · ')}</p>
              {assignedDay >= 1 && assignedDay <= TOTAL_PROGRAM_DAYS && (
                <p className="mt-2 inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
                  <Calendar size={16} className="shrink-0" />
                  Day {assignedDay} Exam: {formatExamWindowForDay(assignedDay)}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-3 items-center">
                <StatusBadge label="Status" value="Active" color="green" dot />
                <StatusBadge
                  label="Test Status"
                  value={testStatus}
                  color={testDone ? 'green' : (isTestLive ? 'blue' : 'amber')}
                  icon={testDone ? '✅' : (isTestLive ? '🚀' : '⏳')}
                />
                {!testDone && isTestLive && timeLeft && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm animate-pulse">
                    ⏱️ Closes in: {timeLeft}
                  </span>
                )}
                {!testDone && !isTestLive && timeLeft && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 animate-pulse shadow-sm">
                    ⏱️ Opens in: {timeLeft}
                  </span>
                )}
              </div>
            </div>
            <Link
              to={testDone ? '/student/results' : '/student/take-test'}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary-dark"
            >
              <Rocket size={18} />
              {testDone ? 'View Results' : 'Take Test'}
            </Link>
          </div>
        </section>
      )}

      {/* Next 2 Days' Tests - Strictly Locked Until That Day */}
      {upcomingDays.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>Upcoming Challenges</span>
                <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  Next 2 Days
                </span>
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                These tests are locked and will open automatically on their scheduled day only.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {upcomingDays.map((d) => {
              const test = getDailyTest(d);
              const plan = getDayPlan(d);
              const dateStr = formatDisplayDate(test.testDate);

              return (
                <div
                  key={d}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-gray-700">
                          Day {d}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                          <Lock size={12} /> Locked · Opens {dateStr}
                        </span>
                      </div>

                      <h3 className="mt-2 text-lg font-bold text-gray-900">
                        Day {d} — {test.title}
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-primary">
                        {plan?.topics?.join(' · ') || test.topics.join(' · ')}
                      </p>
                      {plan?.learningGoal && (
                        <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                          {plan.learningGoal}
                        </p>
                      )}
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400 border border-gray-200">
                      <Lock size={20} />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-1.5 font-medium border border-gray-100">
                      <Calendar size={13} className="text-gray-400" />
                      {dateStr}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-1.5 font-medium border border-gray-100">
                      <Clock size={13} className="text-gray-400" />
                      10:00 AM – 12:00 PM IST next day
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-1.5 font-medium border border-gray-100">
                      {test.questions || 30} Questions · {test.durationMinutes || 30} min
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                      <Lock size={13} className="text-gray-400" />
                      <span>Available on Day {d} only</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to="/student/learn"
                        className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-primary transition"
                      >
                        Study Topics
                      </Link>
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        title={`Day ${d} test will unlock on ${dateStr}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-100 px-4 py-1.5 text-xs font-bold text-gray-400 cursor-not-allowed select-none"
                      >
                        <Lock size={13} />
                        Locked
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Previous Results */}
      {pastResults.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Previous Challenges</h2>
          <div className="space-y-3">
            {pastResults.map((res) => (
              <div key={res.day} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-[#f8fafc] p-4 transition-all hover:border-primary/20 hover:bg-primary/5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm text-2xl">
                    {res.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{res.day} — {res.topic}</h3>
                    <p className="text-sm font-medium text-gray-500">Score: {res.score} ({res.percentage}%)</p>
                  </div>
                </div>
                <Link
                  to="/student/results"
                  className="rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-primary"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StreakIndicator({ progress }) {
  const assignedDay = progress.programDay;
  const days = Array.from({ length: TOTAL_PROGRAM_DAYS }, (_, i) => i + 1);
  return (
    <div className="mt-8 flex items-center justify-start gap-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {days.map(day => {
          const isToday = day === assignedDay;
          const isPast = day < assignedDay;
          const isFuture = day > assignedDay;
          const attempted = progress.attemptedTests?.[String(day)];
          
          let content;
          let boxClasses = "flex h-[52px] w-[52px] flex-col items-center justify-center rounded-[1rem] border-2 transition-all ";
          
          if (isToday) {
            content = <span className="text-2xl filter drop-shadow-md">🔥</span>;
            boxClasses = "flex h-[58px] w-[58px] flex-col items-center justify-center rounded-[1rem] border-2 transition-all overflow-hidden border-white bg-white/20 backdrop-blur-md shadow-xl";
          } else if (isPast) {
            if (attempted) {
              content = <Check size={24} className="text-primary-dark" />;
              boxClasses += "border-white/50 bg-white shadow-md";
            } else {
              content = <X size={24} className="text-red-400" />;
              boxClasses += "border-red-100/50 bg-red-50/90 shadow-sm";
            }
          } else {
            content = <Lock size={20} className="text-white/70 drop-shadow-sm" />;
            boxClasses += "border-white/20 bg-white/15 backdrop-blur-sm shadow-sm";
          }

          return (
            <div key={day} className="flex flex-col items-center gap-2 px-1">
              <div className={boxClasses}>
                {content}
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isToday ? 'text-white' : isFuture ? 'text-white/60' : 'text-white/80'}`}>
                Day {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, progress, accent }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon size={18} className="text-primary" />
        </div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      </div>
      <p className={`text-2xl font-bold ${accent ? 'text-primary' : 'text-gray-900'}`}>{value}</p>
      {progress !== undefined && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ label, value, color, dot, icon }) {
  const colors = {
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${colors[color]}`}>
      {dot && <span className="h-2 w-2 rounded-full bg-green-500" />}
      {icon && <span>{icon}</span>}
      {label}: {value}
    </span>
  );
}
