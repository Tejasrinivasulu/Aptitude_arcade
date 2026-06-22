/**
 * Minimal, non-authoritative auth-session helpers.
 *
 * IMPORTANT: credentials and the user store live ONLY in Firebase Auth +
 * Firestore. Nothing here is trusted — it exists purely so a page reload can
 * show the right state while `onAuthStateChanged` resolves, and so "Remember
 * me" can persist the choice between localStorage / sessionStorage.
 *
 * The previous version of this file stored users and a base64 "token" in
 * localStorage; that created a split-brain (a user could exist in Firebase but
 * not locally, or vice-versa) and the token was forgeable. Both are gone.
 */

const REMEMBER_KEY = 'aptitude_remember';
const UID_CACHE_KEY = 'aptitude_uid_cache';

export function setRememberChoice(remember) {
  try {
    if (remember) localStorage.setItem(REMEMBER_KEY, 'true');
    else localStorage.removeItem(REMEMBER_KEY);
  } catch {
    /* storage may be unavailable (private mode) — non-fatal */
  }
}

export function getRememberChoice() {
  try {
    return localStorage.getItem(REMEMBER_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Caches the last Firebase UID so the UI can render an optimistic logged-in
 * state on reload before `onAuthStateChanged` fires. Never trusted for authz.
 */
export function cacheUid(uid) {
  try {
    const store = getRememberChoice() ? localStorage : sessionStorage;
    if (uid) store.setItem(UID_CACHE_KEY, uid);
    else {
      localStorage.removeItem(UID_CACHE_KEY);
      sessionStorage.removeItem(UID_CACHE_KEY);
    }
  } catch {
    /* non-fatal */
  }
}

export function getCachedUid() {
  try {
    return (
      localStorage.getItem(UID_CACHE_KEY) ||
      sessionStorage.getItem(UID_CACHE_KEY)
    );
  } catch {
    return null;
  }
}

export function clearAuthCache() {
  cacheUid(null);
  try {
    localStorage.removeItem(REMEMBER_KEY);
  } catch {
    /* non-fatal */
  }
}
