let serverTimeOffset = 0;
let isSynced = false;

/**
 * Fetches the real server time from the server response `date` header
 * and calculates the offset between the student's device clock and actual server time.
 */
export async function syncServerTime() {
  if (typeof window === 'undefined') return 0;
  try {
    const t0 = Date.now();
    const res = await fetch('/', { method: 'HEAD', cache: 'no-store' });
    const dateHeader = res.headers.get('date');
    if (dateHeader) {
      const serverMs = new Date(dateHeader).getTime();
      const latency = (Date.now() - t0) / 2;
      serverTimeOffset = Math.round((serverMs + latency) - Date.now());
      isSynced = true;
      return serverTimeOffset;
    }
  } catch {
    // If offline or error, fallback to device clock
  }
  return 0;
}

/**
 * Returns a trusted Date object adjusted for any client-side device clock tampering.
 */
export function getTrustedNow() {
  return new Date(Date.now() + serverTimeOffset);
}

export function isTimeSynced() {
  return isSynced;
}

export function getServerTimeOffset() {
  return serverTimeOffset;
}

// Auto-sync in browser environment on module load
if (typeof window !== 'undefined') {
  syncServerTime();
}
