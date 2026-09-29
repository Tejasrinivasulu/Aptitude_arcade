import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Target,
  ExternalLink,
  CalendarDays,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { dailyLearningPlan, getDayPlan } from '../data/dailyLearningPlan';
import { ACTIVE_PROGRAM_DAY, TOTAL_PROGRAM_DAYS } from '../data/testSchedule';
import { useStudentProgress } from '../context/StudentProgressContext';
import TestVerificationModal from '../components/dashboard/TestVerificationModal';

export default function Learn() {
  const navigate = useNavigate();
  const { progress } = useStudentProgress();
  const [selectedDay, setSelectedDay] = useState(progress.programDay);
  const [showVerification, setShowVerification] = useState(false);
  const dayPlan = getDayPlan(selectedDay);
  const isRescheduled = progress.rescheduledTests?.[String(selectedDay)] === true;

  const handleStartRetake = () => {
    setShowVerification(false);
    sessionStorage.setItem('exam_verified', 'true');
    sessionStorage.setItem('exam_test_key', String(selectedDay));
    navigate('/student/exam');
  };

  return (
    <>
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Daily Learning Module</h1>
        <p className="mt-1 text-sm text-gray-500">
          Aptitude Arcade 2026 — {TOTAL_PROGRAM_DAYS}-day structured learning program.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-[#f8fafc] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Program Overview
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto p-4">
          {dailyLearningPlan.map((plan) => {
            const active = plan.day === selectedDay;
            const locked = plan.day > ACTIVE_PROGRAM_DAY;
            const dayRescheduled = progress.rescheduledTests?.[String(plan.day)] === true;
            return (
              <button
                key={plan.day}
                onClick={() => !locked && setSelectedDay(plan.day)}
                disabled={locked}
                className={`group min-w-[120px] shrink-0 rounded-xl border px-3 py-2.5 text-center transition-all flex flex-col items-center justify-center overflow-hidden relative ${
                  active
                    ? dayRescheduled
                      ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200'
                      : 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : locked
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : dayRescheduled
                    ? 'border-amber-300 bg-amber-50/70 hover:border-amber-400 cursor-pointer'
                    : 'border-gray-200 bg-white hover:border-primary/30 hover:bg-gray-50 cursor-pointer'
                }`}
              >
                {locked && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-0"></div>}
                <div className="flex items-center gap-1.5 z-10">
                  <p className={`text-xs font-bold transition-colors ${active ? (dayRescheduled ? 'text-amber-700' : 'text-primary') : locked ? 'text-gray-400' : dayRescheduled ? 'text-amber-700' : 'text-gray-600'}`}>
                    DAY {plan.day}
                  </p>
                  {locked && <Lock size={12} className="text-gray-400" />}
                  {!locked && dayRescheduled && <RotateCcw size={12} className="text-amber-600" />}
                </div>
                <p className={`mt-1 text-[10px] font-medium z-10 ${active ? 'text-gray-800' : locked ? 'text-gray-400' : 'text-gray-500'}`}>
                  {dayRescheduled && !locked ? 'Retake available' : plan.title}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <CalendarDays size={14} />
              📅 Day {selectedDay} — {dayPlan.subtitle}
            </p>
            <h2 className="mt-2 text-xl font-bold text-gray-900">{dayPlan.title}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isRescheduled && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                Retake Granted
              </span>
            )}
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedDay === progress.programDay ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>
              {selectedDay === progress.programDay ? 'Active Day' : 'Review Mode'}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {dayPlan.topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-medium text-primary"
            >
              {topic}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl bg-white/80 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Target size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Learning Goal</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{dayPlan.learningGoal}</p>
          </div>
        </div>

        {isRescheduled && (
          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-amber-900">Admin granted a retake for Day {selectedDay}</p>
              <p className="mt-1 text-xs text-amber-800">
                You can attempt this day&apos;s exam again. Complete verification to start.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowVerification(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700"
            >
              <RotateCcw size={16} />
              Retake Test
            </button>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <span>🎥</span> Video Tutorials
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Watch curated YouTube tutorials for Day {selectedDay}.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {dayPlan.tutorials.map((tutorial) => (
            <a
              key={tutorial.title}
              href={tutorial.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start gap-3 rounded-xl border border-gray-200 p-4 transition-all hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Play size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-primary">
                  {tutorial.title}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  Watch on YouTube <ExternalLink size={12} />
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <h4 className="flex items-center gap-2 text-base font-bold text-gray-900">
            <Target size={18} className="text-primary" />
            Practice Websites
          </h4>
          <p className="mt-1 text-sm text-gray-500">
            Official practice portals grouped by topic for Day {selectedDay}.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {dayPlan.studyMaterials.map((item) => (
              <PracticeWebsiteRow key={item.topic + item.practiceLabel} item={item} />
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">
            📝 Target Practice Questions: {dayPlan.totalPracticeQuestions}
          </div>
        </div>
      </section>
    </div>

    {showVerification && (
      <TestVerificationModal
        onClose={() => setShowVerification(false)}
        onStart={handleStartRetake}
      />
    )}
    </>
  );
}

function PracticeWebsiteRow({ item }) {
  return (
    <a
      href={item.practiceUrl}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
    >
      <div>
        <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{item.topic}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <Target size={14} className="text-primary/70" /> {item.practiceLabel}
        </p>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        <ExternalLink size={18} />
      </div>
    </a>
  );
}
