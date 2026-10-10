import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  ShieldCheck,
} from 'lucide-react';
import {
  isCatchupActive,
  CATCHUP_WINDOW_END,
  computeTestCountdown,
  formatCountdownParts,
} from '../../data/testSchedule';

const SESSION_STORAGE_KEY = 'arcade_weekend_window_notice_v1';

export default function WeekendWindowNoticeModal({ isOpen: controlledIsOpen, onClose }) {
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = typeof controlledIsOpen === 'boolean' ? controlledIsOpen : internalOpen;
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (typeof controlledIsOpen === 'boolean') return;
    // Only show if the weekend window is active and hasn't been dismissed in this session
    if (!isCatchupActive()) return;

    const dismissed = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!dismissed) {
      setInternalOpen(true);
    }
  }, [controlledIsOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const updateTimer = () => {
      const cd = computeTestCountdown(CATCHUP_WINDOW_END, new Date(), 1);
      const parts = formatCountdownParts(cd);
      setCountdown(parts);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    setInternalOpen(false);
    onClose?.();
  };

  const handleGoToTests = () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    setInternalOpen(false);
    onClose?.();
    navigate('/student/take-test');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-emerald-100 flex flex-col scrollbar-thin"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white rounded-t-3xl overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl" />

          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 tracking-wide uppercase">
              <Sparkles size={14} className="text-emerald-300 animate-pulse" />
              Special Weekend Access
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-white">
              Weekend Catch-Up Window is LIVE! 🚀
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-emerald-100/90 font-medium max-w-xl">
              All 12 daily tests have concluded. If you missed any daily assessments, you can catch up now before the Grand Finale!
            </p>
          </div>

          {/* Live countdown timer bar */}
          <div className="mt-6 pt-4 border-t border-emerald-400/20 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
              Window Closes in:
            </span>
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-emerald-400/30 text-white font-bold text-sm">
                {countdown.hours}h
              </span>
              <span className="text-emerald-300 font-bold">:</span>
              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-emerald-400/30 text-white font-bold text-sm">
                {countdown.minutes}m
              </span>
              <span className="text-emerald-300 font-bold">:</span>
              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-emerald-400/30 text-emerald-300 font-bold text-sm">
                {countdown.seconds}s
              </span>
              <span className="text-[11px] text-emerald-200 font-sans ml-1">
                (Sunday 11:59 PM IST)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 text-gray-700 text-sm">
          {/* Key Announcements */}
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Days 1 to 12 All Unlocked</span>
              </div>
              <p className="text-xs text-emerald-800/90 leading-relaxed">
                Missed Day 3? Missed Day 8? Every single unattempted test is open. Completing them will maintain your streak and consistency ranking.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
                <Award size={16} className="text-amber-600 shrink-0" />
                <span>Grand Finale on Monday</span>
              </div>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                The grand climax assessment opens on <strong>Monday, October 12 at 10:00 AM IST</strong>. Use this weekend to revise your topics!
              </p>
            </div>
          </div>

          {/* Rules & Guidelines */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-gray-600" />
              Important Guidelines:
            </h4>
            <ul className="text-xs space-y-2 text-gray-600 list-disc list-inside">
              <li>
                <strong>One Attempt per Test:</strong> Each test can only be submitted once. If you already completed a test on its scheduled date, it cannot be retaken.
              </li>
              <li>
                <strong>Proctoring Remains Active:</strong> Full camera surveillance, fullscreen enforcement, and tab-switch violation limits apply as normal.
              </li>
              <li>
                <strong>Strict Deadline:</strong> The Weekend Window closes automatically on <strong>Sunday, October 11 at 11:59:59 PM IST</strong>. No extensions will be granted.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 rounded-b-3xl flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-100 transition-colors"
          >
            Dismiss & Continue to Dashboard
          </button>
          <button
            type="button"
            onClick={handleGoToTests}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
          >
            <span>Take Tests & Catch Up</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
