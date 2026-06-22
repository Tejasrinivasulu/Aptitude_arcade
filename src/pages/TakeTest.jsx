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
} from 'lucide-react';
import {
  dailyTests,
  generalRules,
  getAssignedTestSummary,
  getTestAvailability,
  getStudentProgramDay,
  ACTIVE_PROGRAM_DAY,
  formatDisplayDate,
  formatWindowTime,
  TEST_END_HOUR,
  TEST_END_MINUTE,
  TEST_START_HOUR,
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
  const programDay = getStudentProgramDay(progress.currentDay);
  const [showVerification, setShowVerification] = useState(false);
  const [selectedTestKey, setSelectedTestKey] = useState(String(programDay));

  const assignedTest = useMemo(
    () => getAssignedTestSummary(programDay),
    [programDay]
  );

  const assignedCountdown = useTestCountdown(assignedTest.testDate, programDay);

  const assignedAvailability = useMemo(
    () =>
      getTestAvailability({
        testKey: programDay,
        attemptedTests: progress.attemptedTests,
        rescheduledTests: progress.rescheduledTests || {},
        currentDay: programDay,
      }),
    [progress, programDay]
  );

  const isRescheduledToday = progress.rescheduledTests?.[String(programDay)] === true;

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
            Aptitude Arcade 2026 — daily tests and Grand Finale assessment.
          </p>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">General Rules</h2>
          <ul className="mt-3 space-y-2">
            {generalRules.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {rule}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Today&apos;s Assigned Test
              </p>
              <h2 className="mt-1 text-xl font-bold text-gray-900">
                Day {programDay} — {assignedTest.title}
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
              value={`${formatWindowTime(TEST_START_HOUR)} – ${formatWindowTime(TEST_END_HOUR, TEST_END_MINUTE)}`}
            />
            <InfoChip icon={FileText} label="Questions" value={`${assignedTest.questions} Questions`} />
            <InfoChip icon={Clock} label="Duration" value={`${assignedTest.durationMinutes} Minutes`} />
          </div>

          <div className="mt-4">
            <TestCountdown testDate={assignedTest.testDate} />
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
              onClick={() => openVerification(programDay)}
              disabled={!canStartAssigned}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Rocket size={18} />
              {canStartAssigned
                ? `Start Day ${programDay} Test`
                : assignedAvailability.status === 'completed'
                  ? 'Test Already Completed'
                  : assignedCountdown.isExpired
                    ? 'Test Expired'
                    : 'Take Test (Wait for Countdown)'}
            </button>
          </section>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-bold text-gray-900">📅 Daily Test Schedule</h2>
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
        <TestVerificationModal onClose={() => setShowVerification(false)} onStart={handleStartExam} />
      )}
    </>
  );
}

function DailyTestRow({ test, progress, onStart }) {
  const programDay = getStudentProgramDay(progress.currentDay);
  const availability = getTestAvailability({
    testKey: test.day,
    attemptedTests: progress.attemptedTests,
    rescheduledTests: progress.rescheduledTests || {},
    currentDay: programDay,
  });
  const countdown = useTestCountdown(test.testDate);
  const active = test.day === programDay;
  const locked = test.day > ACTIVE_PROGRAM_DAY || test.day > programDay;
  const isRescheduled = progress.rescheduledTests?.[String(test.day)] === true;
  const canStart = availability.canStart && (isRescheduled || (countdown.isReady && !countdown.isExpired));

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
          <TestCountdown testDate={test.testDate} compact />
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
          Start
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
