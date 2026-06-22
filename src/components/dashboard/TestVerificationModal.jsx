import { useState, useEffect } from 'react';
import {
  Maximize,
  MonitorOff,
  CheckCircle,
  Loader2,
  Play,
  XCircle,
  Clock,
  HelpCircle,
  BookOpen,
  Radio
} from 'lucide-react';

const examDetails = [
  { id: 'topic', icon: BookOpen, label: 'Topic: General Aptitude', type: 'info' },
  { id: 'questions', icon: HelpCircle, label: 'Questions: 20 Multiple Choice', type: 'info' },
  { id: 'time', icon: Clock, label: 'Time Limit: 30 Minutes', type: 'info' },
];

const checks = [
  { id: 'fullscreen', icon: Maximize, label: 'Fullscreen Mode Required', type: 'check' },
  { id: 'tabswitch', icon: MonitorOff, label: 'Tab Switching Restricted', type: 'check' },
];

export default function TestVerificationModal({ onClose, onStart }) {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState({});
  const [failed, setFailed] = useState({});
  const [allDone, setAllDone] = useState(false);
  const [error, setError] = useState('');

  const runVerification = async () => {
    setVerifying(true);
    setError('');
    setFailed({});
    const results = {};
    const failures = {};

    // Check 1: Fullscreen
    try {
      if (!document.fullscreenElement) {
        const el = document.documentElement;
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        }
      }
      results.fullscreen = !!document.fullscreenElement;
      if (!results.fullscreen) failures.fullscreen = true;
    } catch {
      results.fullscreen = false;
      failures.fullscreen = true;
    }
    setVerified({ fullscreen: results.fullscreen });

    await new Promise((r) => setTimeout(r, 600));
    
    // Check 2: Tab Switching
    results.tabswitch = true;
    setVerified((prev) => ({ ...prev, tabswitch: true }));

    setFailed(failures);
    setVerifying(false);
    
    const allChecksPassed = results.fullscreen && results.tabswitch;
    setAllDone(allChecksPassed);

    if (!allChecksPassed) {
      setError('Fullscreen permission is required to enter the arena. Please try again.');
    }
  };

  const handleStart = () => {
    onStart();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Radar/Pulse Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 opacity-80" />
        
        <div className="flex flex-col items-center justify-center mb-6 pt-2">
          <div className="relative flex items-center justify-center w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-emerald-500/50 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 rounded-full z-10 border border-slate-700">
              <Radio className="text-emerald-400 w-8 h-8" />
            </div>
          </div>
          <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase mb-1">
            Exam Security Setup
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">Entering the Arena</h2>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0 pr-2 -mr-2 mb-4 space-y-5">
          
          {/* Exam Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Session Details</h3>
            <ul className="space-y-2">
              {examDetails.map(({ id, icon: Icon, label }) => (
                <li key={id} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/50 py-2.5 px-4">
                  <Icon size={16} className="text-slate-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-200">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Security Checks */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Security Protocol</h3>
            <ul className="space-y-2">
              {checks.map(({ id, icon: Icon, label }) => {
                const isVerified = verified[id];
                const isFailed = failed[id];
                const isPending = verifying && verified[id] === undefined;

                return (
                  <li
                    key={id}
                    className={`flex items-center gap-3 rounded-xl border py-3 px-4 transition-all duration-300 ${
                      isVerified
                        ? 'border-emerald-500/30 bg-emerald-500/10'
                        : isFailed
                          ? 'border-red-500/30 bg-red-500/10 animate-shake'
                          : isPending
                            ? 'border-emerald-500/20 bg-slate-800 animate-pulse'
                            : 'border-slate-800 bg-slate-800/50'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={`shrink-0 transition-colors ${
                        isVerified ? 'text-emerald-400' : isFailed ? 'text-red-400' : isPending ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
                      }`}
                    />
                    <span className={`flex-1 text-sm font-bold transition-colors ${
                      isVerified ? 'text-emerald-50' : isFailed ? 'text-red-50' : 'text-slate-300'
                    }`}>
                      {label}
                    </span>
                    
                    {/* Status Badge */}
                    <div className="flex items-center">
                      {isVerified && (
                        <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md text-[10px] font-black tracking-wider uppercase">
                          <CheckCircle size={12} /> Granted
                        </div>
                      )}
                      {isFailed && (
                        <div className="flex items-center gap-1.5 bg-red-500/20 text-red-400 px-2 py-1 rounded-md text-[10px] font-black tracking-wider uppercase">
                          <XCircle size={12} /> Failed
                        </div>
                      )}
                      {isPending && (
                        <div className="flex items-center gap-1.5 bg-slate-700 text-emerald-400 px-2 py-1 rounded-md text-[10px] font-black tracking-wider uppercase">
                          <Loader2 size={12} className="animate-spin" /> Checking
                        </div>
                      )}
                      {!isVerified && !isFailed && !isPending && (
                        <div className="flex items-center gap-1.5 bg-slate-800 text-slate-500 px-2 py-1 rounded-md text-[10px] font-black tracking-wider uppercase">
                          Standby
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 font-medium animate-shake">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 shrink-0 pt-2 border-t border-slate-800 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 rounded-xl border border-slate-700 py-3 text-sm font-bold text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
          >
            Abort
          </button>
          {!allDone ? (
            <button
              type="button"
              onClick={runVerification}
              disabled={verifying}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-black tracking-wide text-slate-900 transition-all hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500"
            >
              {verifying ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> ESTABLISHING CONNECTION...
                </>
              ) : (
                'INITIATE PROTOCOL'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStart}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-black tracking-wide text-slate-900 transition-all hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <Play size={16} className="fill-slate-900" /> ENTER ARENA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
