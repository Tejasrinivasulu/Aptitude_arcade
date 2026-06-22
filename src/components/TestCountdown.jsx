import { useEffect, useState } from 'react';
import { computeTestCountdown, formatCountdownParts } from '../data/testSchedule';

export function useTestCountdown(testDate) {
  const [countdown, setCountdown] = useState(() => computeTestCountdown(testDate));

  useEffect(() => {
    setCountdown(computeTestCountdown(testDate));
    const timer = setInterval(() => {
      setCountdown(computeTestCountdown(testDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [testDate]);

  return countdown;
}

export default function TestCountdown({ testDate, compact = false }) {
  const countdown = useTestCountdown(testDate);
  const parts = formatCountdownParts(countdown);
  const ready = countdown.isReady && !countdown.isExpired;

  if (compact) {
    return (
      <span
        className={`font-mono text-xs font-semibold ${ready ? 'text-green-700' : 'text-primary'}`}
      >
        {parts.hours}hrs {parts.minutes}min {parts.seconds}sec
      </span>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-5 ${
        ready
          ? 'border-green-200 bg-green-50'
          : countdown.isExpired
            ? 'border-red-200 bg-red-50'
            : 'border-primary/20 bg-primary/5'
      }`}
    >
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
        {ready ? 'Test Window Open' : countdown.isExpired ? 'Test Expired' : 'Test Starts In'}
      </p>
      <div className="mt-3 flex items-center justify-center gap-3 sm:gap-6">
        <CountdownUnit value={parts.hours} label="hrs" active={ready} />
        <CountdownUnit value={parts.minutes} label="min" active={ready} />
        <CountdownUnit value={parts.seconds} label="sec" active={ready} />
      </div>
      {ready && (
        <p className="mt-3 text-center text-sm font-medium text-green-700">
          Take Test button is now active
        </p>
      )}
    </div>
  );
}

function CountdownUnit({ value, label, active }) {
  return (
    <div className="text-center">
      <div
        className={`min-w-[72px] rounded-xl px-3 py-3 font-mono text-2xl font-bold sm:min-w-[84px] sm:text-3xl ${
          active ? 'bg-green-600 text-white' : 'bg-white text-primary shadow-sm'
        }`}
      >
        {value}
      </div>
      <p className="mt-1 text-xs font-medium text-gray-500">{label}</p>
    </div>
  );
}
