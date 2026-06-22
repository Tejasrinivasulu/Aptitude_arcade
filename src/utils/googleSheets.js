const SHEET_URL = import.meta.env.VITE_GOOGLE_SHEET_URL || '';
const RESULTS_QUEUE_KEY = 'aptitude_sheet_upload_queue';

export function isGoogleSheetConfigured() {
  return Boolean(SHEET_URL);
}

export async function uploadExamResultToGoogleSheet(payload) {
  const record = {
    ...payload,
    queuedAt: new Date().toISOString(),
  };

  if (!SHEET_URL) {
    queueFailedUpload(record);
    return { ok: false, skipped: true, message: 'Google Sheet URL not configured.' };
  }

  try {
    const response = await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });

    // no-cors returns opaque response — treat as submitted if no network error
    markUploadSuccess(record);
    return { ok: true, message: 'Results uploaded to Google Sheet.' };
  } catch (error) {
    queueFailedUpload(record);
    return { ok: false, message: error.message || 'Upload failed. Saved locally.' };
  }
}

function queueFailedUpload(record) {
  try {
    const queue = JSON.parse(localStorage.getItem(RESULTS_QUEUE_KEY) || '[]');
    queue.push(record);
    localStorage.setItem(RESULTS_QUEUE_KEY, JSON.stringify(queue.slice(-20)));
  } catch {
    // ignore storage errors
  }
}

function markUploadSuccess(record) {
  try {
    const history = JSON.parse(localStorage.getItem('aptitude_sheet_uploads') || '[]');
    history.push({ ...record, uploadedAt: new Date().toISOString() });
    localStorage.setItem('aptitude_sheet_uploads', JSON.stringify(history.slice(-20)));
  } catch {
    // ignore storage errors
  }
}

export function getLastSheetUploadStatus() {
  try {
    const history = JSON.parse(localStorage.getItem('aptitude_sheet_uploads') || '[]');
    return history[history.length - 1] || null;
  } catch {
    return null;
  }
}
