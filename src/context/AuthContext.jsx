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
  const raw = loginId.trim();
  const normalized = raw.toLowerCase();

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

  // Otherwise search by rollNumber (both raw and lower), email with @mbu.asia appended, or fullName.
  const lookups = [
    { field: 'email', val: `${normalized}@mbu.asia` },
    { field: 'rollNumber', val: raw },
    { field: 'rollNumber', val: raw.toUpperCase() },
    { field: 'rollNumber', val: normalized },
    { field: 'fullName', val: raw },
  ];

  for (const { field, val } of lookups) {
    const q = query(
      collection(db, 'users'),
      where(field, '==', val),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }
  }
  return null;
}

export const DEV_STUDENT = {
  id: 'demo-student-id',
  uid: 'demo-student-id',
  email: 'student@arcade.local',
  fullName: 'Demo Student',
  rollNumber: '21CS101',
  role: 'student',
  currentDay: 1,
};

export const DEV_ADMIN = {
  id: 'demo-admin-id',
  uid: 'demo-admin-id',
  email: 'admin@arcade.local',
  fullName: 'Demo Admin',
  rollNumber: 'ADMIN001',
  role: 'admin',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('dev_bypass_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => (localStorage.getItem('dev_bypass_user') ? 'mock-jwt-token' : null));
  const [loading, setLoading] = useState(!user);

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
        const stored = localStorage.getItem('dev_bypass_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            setToken('mock-jwt-token');
            cacheUid(parsed.id);
            setLoading(false);
            return;
          } catch {
            localStorage.removeItem('dev_bypass_user');
          }
        }
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

  const loginWithBypass = (role = 'student') => {
    const profile = role === 'admin' ? DEV_ADMIN : DEV_STUDENT;
    localStorage.setItem('dev_bypass_user', JSON.stringify(profile));
    cacheUid(profile.id);
    setUser(profile);
    setToken('mock-jwt-token');
    setLoading(false);
    return profile;
  };

  /**
   * Login by email / roll number / full name + password. The identifier is
   * resolved to an email (above), then we delegate credentials to Firebase
   * Auth. We never touch a password field — there is no password field.
   */
  const login = async (loginId, password, remember = false) => {
    // If Firebase Auth or DB is not configured, automatically use local bypass mode!
    if (!auth || !db) {
      console.warn('Firebase Auth is not configured. Falling back to Dev Bypass Login.');
      const isAdm = loginId.toLowerCase().includes('admin');
      const profile = isAdm
        ? { ...DEV_ADMIN, fullName: loginId || DEV_ADMIN.fullName }
        : { ...DEV_STUDENT, fullName: loginId || DEV_STUDENT.fullName };
      localStorage.setItem('dev_bypass_user', JSON.stringify(profile));
      cacheUid(profile.id);
      setUser(profile);
      setToken('mock-jwt-token');
      setLoading(false);
      return profile;
    }

    setRememberChoice(remember);
    const profile = await resolveLogin(loginId);
    if (!profile) {
      throw new Error('User does not exist.');
    }

    // Check manual temporary password override set by Admin
    if (profile.tempPassword && String(profile.tempPassword).trim() === String(password).trim()) {
      cacheUid(profile.id);
      setUser(profile);
      setToken('temp-pwd-token');
      setLoading(false);
      return profile;
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
    localStorage.removeItem('dev_bypass_user');
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
      loginWithBypass,
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
