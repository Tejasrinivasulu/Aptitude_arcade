import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Scene config ───────────────────────────────────────────────────── */
const SCENES = [
  { id: 'brand', duration: 3000 },
  { id: 'season', duration: 3500 },
  { id: 'day1', duration: 3500 },
  { id: 'learn', duration: 3500 },
  { id: 'test', duration: 3500 },
  { id: 'climb', duration: 3000 },
  { id: 'montage', duration: 8500 },
  { id: 'finale', duration: 4000 },
  { id: 'cta', duration: Infinity },
];

const MONTAGE_DAYS = [2, 5, 9, 13];
const MONTAGE_INTERVAL = 1800;

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1];

/* ─── Landing Page ───────────────────────────────────────────────────── */
export default function LandingPage() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [montageIndex, setMontageIndex] = useState(0);

  const current = SCENES[sceneIndex];
  const isLast = sceneIndex === SCENES.length - 1;

  /* Auto-advance scenes */
  useEffect(() => {
    if (isLast) return;
    const id = setTimeout(() => setSceneIndex((i) => i + 1), current.duration);
    return () => clearTimeout(id);
  }, [sceneIndex, isLast, current.duration]);

  /* Montage sub-cycling */
  useEffect(() => {
    if (current.id !== 'montage') {
      setMontageIndex(0);
      return;
    }
    if (montageIndex >= MONTAGE_DAYS.length - 1) return;
    const id = setTimeout(() => setMontageIndex((i) => i + 1), MONTAGE_INTERVAL);
    return () => clearTimeout(id);
  }, [current.id, montageIndex]);

  const advance = useCallback(() => {
    if (!isLast) setSceneIndex((i) => i + 1);
  }, [isLast]);

  const skipToEnd = useCallback(() => {
    setSceneIndex(SCENES.length - 1);
  }, []);

  /* ─── Scene renderer ─────────────────────────────────────────────── */
  const renderScene = () => {
    switch (current.id) {
      case 'brand':
        return (
          <div className="flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-none uppercase">
              Aptitude Arcade
            </h1>
            <p className="absolute bottom-16 text-[10px] text-white/15 tracking-[0.2em] uppercase font-medium">
              Tap anywhere to skip ahead
            </p>
          </div>
        );

      case 'season':
        return (
          <div className="relative flex flex-col items-center gap-4">
            <div className="absolute -inset-40 rounded-full bg-[#FF6B2B]/[0.04] blur-[100px]" />
            <p className="relative text-[11px] font-bold uppercase tracking-[0.4em] text-[#FF6B2B]/60">
              Season 2
            </p>
            <h2 className="relative text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-snug">
              Bigger. Better. Harder.
            </h2>
          </div>
        );

      case 'day1':
        return (
          <div className="flex flex-col items-center">
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white leading-none">
              DAY 1
            </h1>
          </div>
        );

      case 'learn':
        return (
          <div className="relative flex flex-col items-center">
            <div className="absolute -inset-40 rounded-full bg-amber-500/[0.04] blur-[80px]" />
            <h2 className="relative text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white/90 leading-snug">
              You learn a topic.
            </h2>
            <p className="relative mt-5 text-sm text-white/25 font-medium max-w-sm leading-relaxed text-center">
              Study materials and practice sets drop every morning.
              <br />
              Understand it completely.
            </p>
          </div>
        );

      case 'test':
        return (
          <div className="relative flex flex-col items-center">
            <div className="absolute -inset-40 rounded-full bg-red-500/[0.03] blur-[80px]" />
            <h2 className="relative text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white/90 leading-snug">
              You take a test.
            </h2>
            <p className="relative mt-5 text-sm text-white/25 font-medium max-w-xs leading-relaxed text-center">
              30 questions. 30 minutes. One attempt.
            </p>
            <div className="relative mt-8 inline-flex items-center gap-2.5 text-white/15">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="font-mono text-xs tracking-widest">29:47</span>
            </div>
          </div>
        );

      case 'climb':
        return (
          <div className="flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-snug text-center">
              <span className="text-emerald-400">You climb</span>
              <span className="text-white/15 mx-1"> or </span>
              <span className="text-red-400">you fall.</span>
            </h2>
            <p className="mt-5 text-sm text-white/25 font-medium max-w-xs text-center">
              Live leaderboard. Every test reshuffles the ranks.
            </p>
          </div>
        );

      case 'montage':
        return (
          <AnimatePresence mode="wait">
            <motion.span
              key={MONTAGE_DAYS[montageIndex]}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
              className="text-6xl sm:text-7xl md:text-8xl font-black text-white tabular-nums tracking-tighter"
            >
              DAY {MONTAGE_DAYS[montageIndex]}
            </motion.span>
          </AnimatePresence>
        );

      case 'finale':
        return (
          <div className="relative flex flex-col items-center">
            <div className="absolute -inset-48 rounded-full bg-amber-400/[0.06] blur-[120px]" />
            <p className="relative text-[11px] font-bold uppercase tracking-[0.35em] text-amber-400/40 mb-5">
              Day 14
            </p>
            <h2 className="relative text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none">
              <span className="bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
                The Grand Finale.
              </span>
            </h2>
          </div>
        );

      case 'cta':
        return (
          <div className="space-y-7 max-w-lg text-center">
            <p className="text-base sm:text-lg md:text-xl text-white/40 font-medium leading-relaxed">
              The question isn't whether you're smart enough.
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-snug">
              It's whether you're consistent enough.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                to="/signup"
                onClick={(e) => e.stopPropagation()}
                className="px-8 py-3.5 bg-[#FF6B2B] hover:bg-[#e0531b] text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-all hover:scale-[1.03] shadow-lg shadow-orange-500/20"
              >
                Register Now →
              </Link>
              <Link
                to="/login"
                onClick={(e) => e.stopPropagation()}
                className="px-8 py-3.5 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white font-bold rounded-xl border border-white/[0.06] text-sm uppercase tracking-wider transition-all"
              >
                Student Login →
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 pt-4 opacity-25">
              <img
                src="/iste-logo.png"
                alt="ISTE"
                className="h-8 w-auto object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <img
                src="/mbu-logo.png"
                alt="MBU"
                className="h-8 w-auto object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>

            <p className="text-[10px] text-white/10 uppercase tracking-widest font-medium pt-2">
              Aptitude Arcade · Nexera 2k26 · ISTE MBU
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  /* ─── Render ─────────────────────────────────────────────────────── */
  return (
    <div
      className="h-screen w-full bg-black text-white overflow-hidden relative selection:bg-orange-500/30 cursor-pointer"
      onClick={advance}
    >
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <img
            src="/arcade-logo.png"
            alt="Aptitude Arcade"
            className="h-7 w-auto rounded"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <span className="text-sm font-bold tracking-tight text-white/80">
            Aptitude Arcade
          </span>
        </div>
        <Link
          to="/login"
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
        >
          Enter Portal →
        </Link>
      </nav>

      {/* ── Scene ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          className="absolute inset-0 flex items-center justify-center px-6"
        >
          {renderScene()}
        </motion.div>
      </AnimatePresence>

      {/* ── Progress bar ───────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.03] z-40">
        <motion.div
          className="h-full bg-[#FF6B2B]/30"
          animate={{ width: `${(sceneIndex / (SCENES.length - 1)) * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* ── Skip button ────────────────────────────────────────────── */}
      {!isLast && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            skipToEnd();
          }}
          className="fixed bottom-5 right-6 z-50 text-[10px] font-bold uppercase tracking-widest text-white/15 hover:text-white/40 transition-colors cursor-pointer"
        >
          Skip intro →
        </button>
      )}
    </div>
  );
}
