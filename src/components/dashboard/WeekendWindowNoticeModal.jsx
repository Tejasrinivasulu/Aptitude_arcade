import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  X,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Clock,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  isCatchupActive,
  CATCHUP_WINDOW_END,
  computeTestCountdown,
  formatCountdownParts,
} from '../../data/testSchedule';

export const SESSION_STORAGE_KEY = 'arcade_grand_finale_postponed_notice_v2';

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
        className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-amber-300 overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with integrated countdown and close button */}
        <div className="relative p-4 sm:p-5 bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 text-white shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white/20 text-white border border-white/30 uppercase tracking-wider">
                <Sparkles size={12} className="text-amber-200" />
                Schedule Announcement · Grand Finale
              </span>
              <h2 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-white">
                Grand Finale Postponed to Wednesday! 🏆
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-amber-100 font-medium">
                Venue: <strong>519 MNS Block</strong> at <strong>2:30 PM</strong> · Catch-up tests open till tomorrow night!
              </p>
            </div>

            {/* Close Button */}
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
          <div className="mt-3 pt-2.5 border-t border-amber-400/30 flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] font-bold text-amber-100 uppercase tracking-wider flex items-center gap-1">
              <Clock size={13} className="text-amber-200" />
              Catch-Up Closes In:
            </span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="px-2 py-0.5 rounded bg-black/40 border border-amber-400/30 font-bold text-white text-xs">
                {countdown.hours}h
              </span>
              <span className="text-amber-200 font-bold">:</span>
              <span className="px-2 py-0.5 rounded bg-black/40 border border-amber-400/30 font-bold text-white text-xs">
                {countdown.minutes}m
              </span>
              <span className="text-amber-200 font-bold">:</span>
              <span className="px-2 py-0.5 rounded bg-black/40 border border-amber-400/30 font-bold text-amber-200 text-xs">
                {countdown.seconds}s
              </span>
              <span className="text-[11px] text-amber-100 font-sans ml-1 hidden sm:inline">
                (Tue, 11:59 PM IST)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-3 bg-white text-slate-800 text-xs sm:text-sm">
          {/* Two Key Announcements */}
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300">
              <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs mb-1.5">
                <Award size={16} className="text-amber-700 shrink-0" />
                <span>Grand Finale on Wednesday</span>
              </div>
              <div className="space-y-1 text-[11.5px] text-slate-700 font-medium">
                <p className="flex items-center gap-1.5 text-amber-900 font-bold">
                  <Calendar size={13} className="text-amber-700 shrink-0" />
                  <span>Wed, Oct 14 at 2:30 PM IST</span>
                </p>
                <p className="flex items-center gap-1.5 text-amber-900 font-bold">
                  <MapPin size={13} className="text-amber-700 shrink-0" />
                  <span>Venue: 519 MNS Block</span>
                </p>
                <p className="text-slate-600 leading-snug pt-0.5">
                  Live in-college final assessment. Bring your device with working camera.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs mb-1.5">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                <span>Days 1–12 Open Till Tomorrow</span>
              </div>
              <div className="space-y-1 text-[11.5px] text-slate-700 font-medium">
                <p className="text-emerald-900 font-bold">
                  All unattempted tests unlocked
                </p>
                <p className="flex items-center gap-1.5 text-emerald-900 font-bold">
                  <Clock size={13} className="text-emerald-700 shrink-0" />
                  <span>Closes: Tuesday, Oct 13 @ 11:59 PM</span>
                </p>
                <p className="text-slate-600 leading-snug pt-0.5">
                  Catch up on missed days now to complete your series before the finale!
                </p>
              </div>
            </div>
          </div>

          {/* Guidelines Box */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={13} className="text-slate-700" />
              Guidelines & Rules:
            </h4>
            <ul className="text-[11.5px] space-y-1 text-slate-700 font-medium">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>1 attempt per test:</strong> Previously submitted tests cannot be retaken.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Strict proctoring active:</strong> Camera, fullscreen, and anti-tab switch detection active.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Catch-up deadline:</strong> Closes strictly on <strong>Tuesday, Oct 13 at 11:59 PM IST</strong>.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Action - Single Full-Width Action Button */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={handleGoToTests}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/25 transition-all cursor-pointer"
          >
            <span>Take Catch-Up Tests (Days 1–12)</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
