import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Camera,
  Clock,
  FileText,
  Lock,
  Maximize,
  MonitorOff,
  Rocket,
  Wifi,
  Fingerprint,
  Sparkles,
  Award,
  ArrowDownCircle,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import {
  dailyTests,
  generalRules,
  getAssignedTestSummary,
  getTestAvailability,
  getTodaysAssignedDay,
  TOTAL_PROGRAM_DAYS,
  formatDisplayDate,
  formatWindowRangeLabel,
  isCatchupActive,
  CATCHUP_WINDOW_END,
} from '../data/testSchedule';
import { useStudentProgress } from '../context/StudentProgressContext';
import TestVerificationModal from '../components/dashboard/TestVerificationModal';
import TestCountdown, { useTestCountdown } from '../components/TestCountdown';

const checks = [
  { icon: Camera, label: 'Camera Access Enabled' },
  { icon: Maximize, label: 'Fullscreen Mode Enabled' },
  { icon: Wifi, label: 'Internet Connected' },
  { icon: MonitorOff, label: 'Tab Switching Restricted' },
];

const statusStyles = {
  green: 'bg-green-50 text-green-700 border-green-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  gray: 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function TakeTest() {
  const navigate = useNavigate();
  const { progress } = useStudentProgress();
  const assignedDay = getTodaysAssignedDay();
  const [showVerification, setShowVerification] = useState(false);
  const [selectedTestKey, setSelectedTestKey] = useState(String(assignedDay));

  const assignedTest = useMemo(
    () => getAssignedTestSummary(assignedDay),
    [assignedDay]
  );

  const assignedCountdown = useTestCountdown(assignedTest.testDate, assignedDay);

  const assignedAvailability = useMemo(
    () =>
      getTestAvailability({
        testKey: assignedDay,
        attemptedTests: progress.attemptedTests,
        rescheduledTests: progress.rescheduledTests || {},
        currentDay: assignedDay,
      }),
    [progress, assignedDay]
  );

  const isRescheduledToday = progress.rescheduledTests?.[String(assignedDay)] === true;

  const canStartAssigned =
    assignedAvailability.canStart &&
    (isRescheduledToday || (assignedCountdown.isReady && !assignedCountdown.isExpired));

  const openVerification = (testKey) => {
    setSelectedTestKey(String(testKey));
    setShowVerification(true);
  };

  const handleStartExam = () => {
    setShowVerification(false);
    sessionStorage.setItem('exam_verified', 'true');
    sessionStorage.setItem('exam_test_key', selectedTestKey);
    navigate('/student/exam');
  };

  return (
    <>
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Schedule</h1>
          <p className="mt-1 text-sm text-gray-500">
            Aptitude Arcade 2026 — {TOTAL_PROGRAM_DAYS} daily tests and Grand Finale assessment.
          </p>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>📋 Program Guidelines & Rules</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Current rules for the Weekend Catch-Up Window and Grand Finale assessment.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="flex items-center gap-2 font-bold text-emerald-950 text-xs mb-1">
                <Clock size={15} className="text-emerald-700 shrink-0" />
                <span>Weekend Open Access</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                All unattempted tests (Days 1–12) are open until <strong>Sunday, Oct 11 at 11:59 PM IST</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center gap-2 font-bold text-amber-950 text-xs mb-1">
                <Award size={15} className="text-amber-700 shrink-0" />
                <span>Grand Finale on Tuesday</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Conducted on <strong>Tuesday, Oct 13 in-college</strong> via this portal. Timing & details in the WhatsApp community.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
              <div className="flex items-center gap-2 font-bold text-blue-950 text-xs mb-1">
                <ShieldCheck size={15} className="text-blue-700 shrink-0" />
                <span>Strict Proctoring Rules</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Webcam monitoring, fullscreen mode, and anti-tab switch detection remain active on every test.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>Single Attempt Policy</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Each test can only be attempted once. Previously submitted tests cannot be retaken.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80">
              <div className="flex items-center gap-2 font-bold text-purple-950 text-xs mb-1">
                <Calendar size={15} className="text-purple-700 shrink-0" />
                <span>12-Day Series Concluded</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                The daily 12-day aptitude training has finished. Use this weekend to complete pending tests.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80">
              <div className="flex items-center gap-2 font-bold text-rose-950 text-xs mb-1">
                <HelpCircle size={15} className="text-rose-700 shrink-0" />
                <span>Technical Support</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Facing technical difficulties? Raise a query through the <strong>Help Center</strong> immediately.
              </p>
            </div>
          </div>
        </section>

        {isCatchupActive() ? (
          <section className="rounded-3xl border-2 border-emerald-400/40 bg-gradient-to-br from-emerald-500/10 via-white to-amber-500/5 p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Sparkles size={14} className="text-emerald-600 animate-pulse" />
                  WEEKEND OPEN ACCESS · CATCH-UP WINDOW LIVE
                </span>
                <h2 className="mt-3 text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  All Daily Tests (Days 1–{TOTAL_PROGRAM_DAYS}) Are Open!
                </h2>
                <p className="mt-1.5 text-sm text-gray-600 max-w-2xl leading-relaxed">
                  The {TOTAL_PROGRAM_DAYS}-day daily test series has completed! Missed any previous assessment? You can attempt any unattempted daily tests right now to boost your score and consistency streak before Tuesday&apos;s in-college Grand Finale.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-green-500 text-white shadow-sm animate-pulse">
                ● Window Live Now
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoChip icon={Calendar} label="Access Period" value="Oct 10 – Oct 11" />
              <InfoChip icon={Clock} label="Window Closes" value="Sunday 11:59 PM IST" />
              <InfoChip icon={FileText} label="Eligible Tests" value={`Days 1 to ${TOTAL_PROGRAM_DAYS}`} />
              <InfoChip icon={Award} label="Next Event" value="Grand Finale (Tue, Oct 13 · In-College)" />
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Weekend Catch-Up Window Closes In
              </p>
              <TestCountdown testDate={CATCHUP_WINDOW_END} testKey={1} />
            </div>

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
              <div className="flex items-center gap-2.5">
                <ArrowDownCircle className="text-emerald-600 shrink-0" size={20} />
                <p className="text-xs sm:text-sm font-semibold text-emerald-950">
                  Select any unattempted day from the <strong>Daily Test Schedule below</strong> to start!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('daily-test-schedule')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                View Available Tests ↓
              </button>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Today&apos;s Assigned Test
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  Day {assignedDay} — {assignedTest.title}
                </h2>
                <p className="mt-1 text-sm text-primary">{assignedTest.topicLabel}</p>
              </div>
              <StatusBadge availability={assignedAvailability} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoChip icon={Calendar} label="Test Date" value={formatDisplayDate(assignedTest.testDate)} />
              <InfoChip
                icon={Clock}
                label="Test Window"
                value={formatWindowRangeLabel()}
              />
              <InfoChip icon={FileText} label="Questions" value={`${assignedTest.questions} Questions`} />
              <InfoChip icon={Clock} label="Duration" value={`${assignedTest.durationMinutes} Minutes`} />
            </div>

            <div className="mt-4">
              <TestCountdown testDate={assignedTest.testDate} testKey={assignedDay} />
            </div>

            <p className="mt-4 text-sm text-gray-600">{assignedAvailability.message}</p>

            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-bold text-gray-900">Exam Verification</h3>
              <ul className="mt-3 space-y-2">
                {checks.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800"
                  >
                    <Icon size={16} /> ✓ {label}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => openVerification(assignedDay)}
                disabled={!canStartAssigned}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Rocket size={18} />
                {canStartAssigned
                  ? `Start Day ${assignedDay} Test`
                  : assignedAvailability.status === 'completed'
                    ? 'Test Already Completed'
                    : assignedCountdown.isExpired
                      ? 'Test Expired'
                      : 'Take Test (Wait for Countdown)'}
              </button>
            </section>
          </section>
        )}

        <section id="daily-test-schedule" className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-gray-900">📅 Daily Test Schedule</h2>
              <p className="text-xs text-gray-500">
                Aptitude Arcade 2026 — {TOTAL_PROGRAM_DAYS}-day test series and Grand Finale.
              </p>
            </div>
            {isCatchupActive() && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 animate-pulse">
                ✨ Weekend Open Access: All Unattempted Tests (Days 1–{TOTAL_PROGRAM_DAYS}) Open Until Sunday 11:59 PM IST
              </span>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {dailyTests.map((test) => (
              <DailyTestRow
                key={test.day}
                test={test}
                progress={progress}
                onStart={openVerification}
              />
            ))}
          </div>
        </section>

      </div>

      {showVerification && (
        <TestVerificationModal
          testKey={selectedTestKey}
          onClose={() => setShowVerification(false)}
          onStart={handleStartExam}
        />
      )}
    </>
  );
}

function DailyTestRow({ test, progress, onStart }) {
  const assignedDay = getTodaysAssignedDay();
  const availability = getTestAvailability({
    testKey: test.day,
    attemptedTests: progress.attemptedTests,
    rescheduledTests: progress.rescheduledTests || {},
    currentDay: assignedDay,
  });
  const countdown = useTestCountdown(test.testDate, test.day);
  const active = test.day === assignedDay && availability.status !== 'completed';
  const locked = availability.status === 'locked';
  const isRescheduled = progress.rescheduledTests?.[String(test.day)] === true;
  const canStart = availability.canStart && (isRescheduled || availability.status === 'open' || (countdown.isReady && !countdown.isExpired));
  const showExpired = availability.status === 'missed' || availability.label === 'Expired';

  return (
    <div
      className={`group flex flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between transition-colors relative overflow-hidden ${
        active ? 'bg-primary/5' : locked ? 'bg-slate-900 hover:bg-slate-800 cursor-not-allowed border-l-4 border-l-red-500' : ''
      }`}
    >
      {locked && <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20"></div>}
      <div className="z-10">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-bold ${locked ? 'text-red-500 tracking-wider drop-shadow-[0_0_3px_rgba(239,68,68,0.8)]' : 'text-gray-900'}`}>
            DAY {test.day} {locked ? '' : '— '}
          </p>
          <span className={`text-sm font-bold ${locked ? 'text-slate-300 font-mono tracking-widest' : 'text-gray-900'}`}>
            {locked ? '[ SECURED CONTENT ]' : test.title}
          </span>
          {locked && <Fingerprint size={16} className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)] transition-all duration-300 group-hover:scale-110" />}
        </div>
        <p className={`mt-1 text-xs font-mono font-bold tracking-widest ${locked ? 'text-red-500/80 drop-shadow-[0_0_2px_rgba(239,68,68,0.5)]' : 'text-gray-500'}`}>
          {locked ? 'UNLOCKS WHEN YOU REACH THIS DAY' : test.topics.join(' · ')}
        </p>
        <p className={`mt-2 text-xs ${locked ? 'text-slate-500 font-mono' : 'text-gray-500'}`}>
          {formatDisplayDate(test.testDate)} · {locked ? '?? Q' : `${test.questions} Q`} · {test.durationMinutes} min
        </p>
        <div className="mt-2">
          {availability.status === 'completed' ? (
            <span className="font-mono text-xs font-semibold text-green-700">{availability.message}</span>
          ) : showExpired ? (
            <span className="font-mono text-xs font-semibold text-red-600">Expired</span>
          ) : (
            <TestCountdown testDate={test.testDate} testKey={test.day} compact />
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge availability={availability} compact />
        <button
          type="button"
          onClick={() => onStart(test.day)}
          disabled={!canStart}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {availability.status === 'completed' ? 'Completed' : 'Start'}
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ availability, compact }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[availability.color]}`}
    >
      {compact ? availability.label : availability.label}
    </span>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Icon size={14} className="shrink-0" /> {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
