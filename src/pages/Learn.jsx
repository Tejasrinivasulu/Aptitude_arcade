import { useState } from 'react';
import {
  Play,
  Download,
  FileText,
  Target,
  ExternalLink,
  CalendarDays,
  BookOpen,
  Lock,
  Fingerprint,
} from 'lucide-react';
import { dailyLearningPlan, getDayPlan } from '../data/dailyLearningPlan';
import { ACTIVE_PROGRAM_DAY } from '../data/testSchedule';
import { useStudentProgress } from '../context/StudentProgressContext';

export default function Learn() {
  const { progress } = useStudentProgress();
  const [selectedDay, setSelectedDay] = useState(progress.currentDay);
  const dayPlan = getDayPlan(selectedDay);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Daily Learning Module</h1>
        <p className="mt-1 text-sm text-gray-500">
          Aptitude Arcade 2026 — 7-day structured learning program.
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
            return (
              <button
                key={plan.day}
                onClick={() => !locked && setSelectedDay(plan.day)}
                disabled={locked}
                className={`group min-w-[120px] shrink-0 rounded-xl border px-3 py-2.5 text-center transition-all flex flex-col items-center justify-center overflow-hidden relative ${
                  active
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : locked
                    ? 'border-slate-800 bg-slate-900 cursor-not-allowed hover:bg-slate-800 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]'
                    : 'border-gray-200 bg-white hover:border-primary/30 hover:bg-gray-50 cursor-pointer'
                }`}
              >
                {locked && <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20"></div>}
                <div className="flex items-center gap-1.5 z-10">
                  <p className={`text-xs font-bold transition-colors ${active ? 'text-primary' : locked ? 'text-red-500 tracking-widest drop-shadow-[0_0_3px_rgba(239,68,68,0.8)]' : 'text-gray-600'}`}>
                    DAY {plan.day}
                  </p>
                  {locked && <Fingerprint size={12} className="text-red-500 drop-shadow-[0_0_3px_rgba(239,68,68,0.8)] transition-all duration-300 group-hover:scale-110" />}
                </div>
                <p className={`mt-1 text-[10px] font-mono font-bold tracking-widest z-10 ${active ? 'text-gray-800' : locked ? 'text-slate-400 uppercase' : 'text-gray-500'}`}>
                  {locked ? '[ SECURED CONTENT ]' : plan.title}
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
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedDay === progress.currentDay ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>
            {selectedDay === progress.currentDay ? 'Active Day' : 'Review Mode'}
          </span>
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
