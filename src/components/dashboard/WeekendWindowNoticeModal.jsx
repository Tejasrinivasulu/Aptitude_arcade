import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Clock,
  Award,
  CheckCircle2,
  X,
  ShieldCheck,
  ArrowRight,
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
    /* z-[100] ensures the modal is strictly above the Navbar (z-[60]) */
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-emerald-300 overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Compact Header with integrated countdown and close button */}
        <div className="relative p-4 sm:p-5 bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400/20 text-amber-200 border border-amber-300/30 uppercase tracking-wider">
                <span className="text-xs">⚡</span>
                Special Weekend Access
              </span>
              <h2 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-white">
                Weekend Catch-Up Window is LIVE! 🚀
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-emerald-100 font-medium">
                All 12 daily tests have concluded. Missed any? Catch up now!
              </p>
            </div>

            {/* Clear Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white/90 hover:text-white transition-colors shrink-0 cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Integrated Ticking Timer Bar */}
          <div className="mt-3 pt-2.5 border-t border-emerald-400/20 flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
              Closes in:
            </span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="px-2 py-0.5 rounded bg-black/40 border border-emerald-400/30 font-bold text-white text-xs">
                {countdown.hours}h
              </span>
              <span className="text-emerald-300 font-bold">:</span>
              <span className="px-2 py-0.5 rounded bg-black/40 border border-emerald-400/30 font-bold text-white text-xs">
                {countdown.minutes}m
              </span>
              <span className="text-emerald-300 font-bold">:</span>
              <span className="px-2 py-0.5 rounded bg-black/40 border border-emerald-400/30 font-bold text-emerald-300 text-xs">
                {countdown.seconds}s
              </span>
              <span className="text-[11px] text-emerald-200 font-sans ml-1">
                (Sun, 11:59 PM)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body - High-Contrast & High Readability */}
        <div className="p-4 sm:p-5 space-y-3 bg-white text-slate-800 text-xs sm:text-sm">
          {/* Two Key Announcements */}
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs mb-1">
                <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                <span>Days 1 to 12 All Unlocked</span>
              </div>
              <p className="text-[11.5px] text-slate-700 leading-snug font-medium">
                Every unattempted test is open. Write them to complete your streak and ranking!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300">
              <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs mb-1">
                <Award size={15} className="text-amber-700 shrink-0" />
                <span>Grand Finale on Tuesday (In College)</span>
              </div>
              <p className="text-[11.5px] text-slate-700 leading-snug font-medium">
                Conducted in-college on <strong>Tuesday, Oct 13 at 10 AM IST</strong> via this portal. Prepare this weekend!
              </p>
            </div>
          </div>

          {/* Guidelines Box */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={13} className="text-slate-700" />
              Guidelines:
            </h4>
            <ul className="text-[11.5px] space-y-1 text-slate-700 font-medium">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>1 attempt per test:</strong> Previously completed tests cannot be retaken.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Full proctoring active:</strong> Camera, fullscreen, and anti-tab switch rules apply.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Strict deadline:</strong> Closes automatically on <strong>Sunday, Oct 11 at 11:59 PM IST</strong>.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Action - Single Full-Width Action Button */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={handleGoToTests}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/25 transition-all cursor-pointer"
          >
            <span>Take Catch-Up Tests</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
