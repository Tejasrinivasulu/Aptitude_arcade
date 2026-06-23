import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, TrendingUp, CheckCircle2, Award, Rocket, Check, X, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudentProgress, getDayResultsFromProgress } from '../context/StudentProgressContext';
import { getDailyTest, computeTestCountdown, formatCountdownParts, formatExamWindowForDay } from '../data/testSchedule';

export default function Dashboard() {
  const { user } = useAuth();
  const { progress } = useStudentProgress();
  const firstName = user?.fullName?.split(' ')[0] || 'Student';
  const assignedAttempt = progress.attemptedTests?.[String(progress.currentDay)];
  const testDone = !!assignedAttempt;
  
  const [timeLeft, setTimeLeft] = useState('');
  const [isTestLive, setIsTestLive] = useState(false);

  const assignedTest = getDailyTest(progress.currentDay);

  useEffect(() => {
    const updateTimer = () => {
      if (!assignedTest) return;
      const cd = computeTestCountdown(assignedTest.testDate);
      setIsTestLive(cd.isReady);
      if (!cd.isReady && !cd.isExpired) {
        const parts = formatCountdownParts(cd);
        setTimeLeft(`${parts.hours}:${parts.minutes}:${parts.seconds}`);
      } else {
        setTimeLeft('');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [assignedTest?.testDate]);

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
        <StatCard icon={Calendar} title="Current Day" value={`Day ${progress.currentDay} of 7`} />
        <StatCard icon={TrendingUp} title="Learning Progress" value={`${progress.learningProgress}%`} progress={progress.learningProgress} />
        <StatCard icon={CheckCircle2} title="Tests Completed" value={`${progress.testsCompleted} / 7`} />
        <StatCard icon={Award} title="Average Score" value={`${progress.averageScore}%`} accent />
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Current Challenge</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">
              Day {progress.currentDay} — {progress.dayTitle}
            </h2>
            <p className="mt-1 text-sm font-medium text-primary">{progress.todayTopic}</p>
            {(progress.currentDay === 1 || progress.currentDay === 2) && (
              <p className="mt-2 inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
                <Calendar size={16} className="shrink-0" />
                Day {progress.currentDay} Exam: {formatExamWindowForDay(progress.currentDay)}
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
              {!testDone && !isTestLive && timeLeft && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 animate-pulse shadow-sm">
                  ⏱️ Opens in: {timeLeft}
                </span>
              )}
            </div>
          </div>
          <Link
            to={testDone ? '/student/results' : (isTestLive ? '/student/take-test' : '/student/learn')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary-dark"
          >
            <Rocket size={18} />
            {testDone ? 'View Results' : isTestLive ? 'Take Test' : 'Learn'}
          </Link>
        </div>
      </section>

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
  const days = Array.from({ length: 7 }, (_, i) => i + 1);
  return (
    <div className="mt-8 flex items-center justify-start gap-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {days.map(day => {
          const isToday = day === progress.currentDay;
          const isPast = day < progress.currentDay;
          const isFuture = day > progress.currentDay;
          const attempted = progress.attemptedTests?.[String(day)];
          
          let content;
          let boxClasses = "flex h-[52px] w-[52px] flex-col items-center justify-center rounded-[1rem] border-2 transition-all ";
          
          if (isToday) {
            content = <span className="text-2xl filter drop-shadow-md">🔥</span>;
            boxClasses += "border-white bg-white/20 backdrop-blur-md shadow-xl scale-110";
          } else if (isPast) {
            if (attempted) {
              content = <Check size={24} className="text-primary-dark" />;
              boxClasses += "border-white/50 bg-white shadow-md";
            } else {
              content = <X size={24} className="text-red-400" />;
              boxClasses += "border-red-100/50 bg-red-50/90 shadow-sm";
            }
          } else {
            content = <Lock size={18} className="text-white/40" />;
            boxClasses += "border-white/10 bg-white/5";
          }

          return (
            <div key={day} className="flex flex-col items-center gap-2 px-1">
              <div className={boxClasses}>
                {content}
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isToday ? 'text-white' : isFuture ? 'text-white/40' : 'text-white/80'}`}>
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
