import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, onSnapshot, query, where, limit } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import {
  cacheUid,
  clearAuthCache,
  getCachedUid,
  getRememberChoice,
  setRememberChoice,
} from '../utils/storage';

const AuthContext = createContext(null);

/**
 * Resolve a free-text login identifier (email, roll number, or full name) to
 * the user's email so we can call signInWithEmailAndPassword. Returns the
 * matching profile doc (which carries the non-credential fields) or null.
 */
async function resolveLogin(loginId) {
  if (!db) return null;
  const normalized = loginId.trim().toLowerCase();

  // Fast path: it's already an email — read the profile directly.
  if (normalized.includes('@')) {
    const q = query(
      collection(db, 'users'),
      where('email', '==', normalized),
      limit(1)
    );
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  }

  // Otherwise search by rollNumber then fullName.
  for (const field of ['rollNumber', 'fullName']) {
    const q = query(
      collection(db, 'users'),
      where(field, '==', normalized),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe once to Firebase Auth — this is the single source of truth for
  // "is someone logged in". Reconciles across tabs and reloads.
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    let profileUnsub = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (cancelled) return;
      profileUnsub?.();

      if (!firebaseUser) {
        setUser(null);
        setToken(null);
        cacheUid(null);
        setLoading(false);
        return;
      }

      cacheUid(firebaseUser.uid);

      const applyProfile = async (profile) => {
        let jwt = null;
        try {
          jwt = await firebaseUser.getIdToken();
        } catch {
          /* token refresh is best-effort */
        }
        if (!cancelled) {
          setUser(profile);
          setToken(jwt);
          setLoading(false);
        }
      };

      const profileRef = doc(db, 'users', firebaseUser.uid);
      profileUnsub = onSnapshot(
        profileRef,
        async (profileDoc) => {
          const profile = profileDoc.exists()
            ? { id: profileDoc.id, ...profileDoc.data() }
            : { id: firebaseUser.uid, email: firebaseUser.email };
          await applyProfile(profile);
        },
        async (err) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load user profile after auth:', err);
          try {
            const profileDoc = await getDoc(profileRef);
            const profile = profileDoc.exists()
              ? { id: profileDoc.id, ...profileDoc.data() }
              : { id: firebaseUser.uid, email: firebaseUser.email };
            await applyProfile(profile);
          } catch {
            if (!cancelled) {
              setUser({ id: firebaseUser.uid, email: firebaseUser.email });
              setLoading(false);
            }
          }
        }
      );
    });

    return () => {
      cancelled = true;
      profileUnsub?.();
      unsubscribe();
    };
  }, []);

  /**
   * Login by email / roll number / full name + password. The identifier is
   * resolved to an email (above), then we delegate credentials to Firebase
   * Auth. We never touch a password field — there is no password field.
   */
  const login = async (loginId, password, remember = false) => {
    if (!auth || !db) {
      throw new Error('Authentication service is not configured.');
    }

    setRememberChoice(remember);
    const profile = await resolveLogin(loginId);
    if (!profile) {
      throw new Error('User does not exist.');
    }

    try {
      await signInWithEmailAndPassword(auth, profile.email, password);
      // onAuthStateChanged will populate `user`; return profile for the
      // immediate navigation in the Login page.
      return profile;
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        throw new Error('Invalid password.');
      }
      if (code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Try again later.');
      }
      if (code === 'auth/user-disabled') {
        throw new Error('This account has been suspended.');
      }
      throw new Error(err?.message || 'Login failed.');
    }
  };

  const logout = async () => {
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch {
        /* fall through to local cleanup */
      }
    }
    clearAuthCache();
    setUser(null);
    setToken(null);
  };

  // The cached UID lets us short-circuit the initial loading flicker on reload.
  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated: Boolean(user),
      optimisticUid: getCachedUid(),
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
