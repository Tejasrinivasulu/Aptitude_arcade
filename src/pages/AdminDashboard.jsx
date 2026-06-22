import { useState, useEffect, useMemo } from 'react';
import {
  Shield, Lock, Users, Activity, Terminal, Eye, FileText, ClipboardList, RotateCcw, LifeBuoy, Trash2,
} from 'lucide-react';
import {
  listenToOverviewMetrics,
  listenToSystemLogs,
  listenToUsers,
  listenToResults,
  listenToUserResults,
  listenToHelpRequests,
  listenToStudentProgress,
  rescheduleStudentTest,
  grantStudentRetake,
  purgeAllPlatformData,
} from '../services/adminService';
import { signInWithEmailAndPassword, signOut, getIdTokenResult, onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseReady, getFirebaseSetupHint } from '../utils/firebase';
import { DEFAULT_ADMIN_EMAIL, isAdminAccount } from '../utils/adminAuth';
import { clearLocalProgressCache, filterExamResults, enrichExamResults, enrichHelpRequests } from '../utils/adminData';
import AdminOverviewTab from '../components/admin/AdminOverviewTab';
import AdminRescueTab from '../components/admin/AdminRescueTab';
import AdminLogsTab from '../components/admin/AdminLogsTab';
import AdminExamResultsTab from '../components/admin/AdminExamResultsTab';
import AdminContentTab from '../components/admin/AdminContentTab';
import AdminQueriesTab from '../components/admin/AdminQueriesTab';

const TABS = [
  { id: 'overview', label: 'Overview Dashboard', icon: Activity },
  { id: 'rescue', label: 'Rescue Desk & Overrides', icon: Users },
  { id: 'logs', label: 'System Logs & Flags', icon: Terminal },
  { id: 'results', label: 'Exam Results', icon: ClipboardList },
  { id: 'content', label: 'Content Manager', icon: FileText },
  { id: 'queries', label: 'Student Queries', icon: LifeBuoy },
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserResults, setSelectedUserResults] = useState([]);
  const [studentProgress, setStudentProgress] = useState(null);
  const [users, setUsers] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const enrichedResults = useMemo(
    () => filterExamResults(enrichExamResults(allResults, users)),
    [allResults, users]
  );
  const enrichedSelectedUserResults = useMemo(
    () => (selectedUser ? enrichExamResults(selectedUserResults, [selectedUser]) : []),
    [selectedUserResults, selectedUser]
  );
  const enrichedHelpRequests = useMemo(
    () => enrichHelpRequests(helpRequests, users),
    [helpRequests, users]
  );
  const [metricsData, setMetricsData] = useState({
    heatmap: [], activity: [], isLive: false, liveSessions: 0, averageScore: 0, flaggedCount: 0,
  });
  const [systemLogs, setSystemLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purgeStatus, setPurgeStatus] = useState('');
  const [isPurging, setIsPurging] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!auth) {
      setAuthChecking(false);
      return undefined;
    }
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAuthenticated(false);
        setAuthChecking(false);
        return;
      }
      try {
        const tokenResult = await getIdTokenResult(user, true);
        setIsAuthenticated(isAdminAccount(user, tokenResult));
      } catch {
        setIsAuthenticated(false);
      } finally {
        setAuthChecking(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const unsubs = [
      listenToOverviewMetrics(setMetricsData),
      listenToSystemLogs(setSystemLogs),
      listenToUsers(setUsers),
      listenToResults(setAllResults),
      listenToHelpRequests(setHelpRequests),
    ];
    return () => unsubs.forEach((u) => u());
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !selectedUser?.id) {
      setSelectedUserResults([]);
      setStudentProgress(null);
      return undefined;
    }
    const unsubs = [
      listenToUserResults(selectedUser.id, setSelectedUserResults),
      listenToStudentProgress(selectedUser.id, setStudentProgress),
    ];
    return () => unsubs.forEach((u) => u());
  }, [isAuthenticated, selectedUser?.id]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');
    if (!isFirebaseReady() || !auth) {
      setError(getFirebaseSetupHint());
      setAuthLoading(false);
      return;
    }
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await cred.user.getIdToken(true);
      const tokenResult = await getIdTokenResult(cred.user, true);
      if (isAdminAccount(cred.user, tokenResult)) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        await signOut(auth);
        setError('ACCESS DENIED: Not an admin account.');
      }
    } catch (err) {
      setError(err.code?.includes('invalid') ? 'Invalid email or password.' : 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch { /* ignore */ }
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setSelectedUser(null);
  };

  const handleFactoryReset = () => {
    if (!window.confirm('Clear all local aptitude_progress_* cache on this browser?')) return;
    clearLocalProgressCache();
    alert('Local progress cache cleared.');
  };

  const handlePurgeAllData = async () => {
    const confirmed = window.confirm(
      'DELETE ALL DATA?\n\nThis permanently removes all students, exam results, help queries, sessions, and logs from Firebase.\n\nThe admin account will be kept. This cannot be undone.'
    );
    if (!confirmed) return;
    const typed = window.prompt('Type DELETE ALL to confirm:');
    if (typed !== 'DELETE ALL') {
      alert('Purge cancelled.');
      return;
    }

    setIsPurging(true);
    setPurgeStatus('Starting purge…');
    try {
      const stats = await purgeAllPlatformData((msg) => setPurgeStatus(msg));
      setSelectedUser(null);
      alert(`All data deleted.\n\n${JSON.stringify(stats, null, 2)}`);
    } catch (err) {
      alert(`Purge failed: ${err.message}`);
    } finally {
      setIsPurging(false);
      setPurgeStatus('');
    }
  };

  const handleRescheduleFromOverview = async (student) => {
    const testKey = String(student.currentDay || 1);
    if (!window.confirm(`Grant Day ${testKey} retake for ${student.fullName || student.rollNumber}?`)) return;
    try {
      await grantStudentRetake({ uid: student.id, testKey });
      alert(`Day ${testKey} rescheduled. Student can start the test from Take Test.`);
      setSelectedUser(student);
      setActiveTab('rescue');
    } catch (err) {
      alert(`Reschedule failed: ${err.message}`);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent" />
        <p className="mt-4 text-sm text-gray-500">Loading admin portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 border shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
              <Shield size={32} />
            </div>
            <h1 className="text-2xl font-black">Admin Login</h1>
            <p className="text-sm text-gray-500 mt-2">Restricted Access · Authorized Personnel Only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder={DEFAULT_ADMIN_EMAIL} value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border rounded-xl text-sm" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 border rounded-xl text-sm" />
            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
            <button type="submit" disabled={authLoading} className="w-full py-3.5 bg-black text-white font-bold rounded-xl disabled:opacity-70">
              {authLoading ? 'Authenticating...' : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isLive = metricsData.isLive && isFirebaseReady();

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center"><Eye size={20} /></div>
            <h1 className="text-xl font-black">Admin Console</h1>
            {isLive ? (
              <span className="px-2.5 py-1 rounded-md bg-green-100 text-green-700 text-[10px] font-black uppercase border border-green-200">Firebase Live</span>
            ) : (
              <span className="px-2.5 py-1 rounded-md bg-gray-200 text-gray-700 text-[10px] font-black uppercase border border-gray-300">Offline Mode</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePurgeAllData}
              disabled={isPurging}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-60"
            >
              <Trash2 size={14} /> {isPurging ? 'Deleting…' : 'Delete All Data'}
            </button>
            <button type="button" onClick={handleFactoryReset} className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100">
              <RotateCcw size={14} /> Factory Reset
            </button>
            <button type="button" onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-gray-100 rounded-lg hover:bg-gray-200">
              <Lock size={14} /> Lock System
            </button>
          </div>
        </div>
      </header>

      {purgeStatus && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-center text-xs font-bold text-red-700">
          {purgeStatus}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="animate-pulse h-64 bg-white rounded-2xl border" />
        ) : (
          <>
            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${activeTab === id ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <AdminOverviewTab
                users={users}
                allResults={enrichedResults}
                metricsData={metricsData}
                onRescheduleStudent={handleRescheduleFromOverview}
              />
            )}
            {activeTab === 'rescue' && (
              <AdminRescueTab
                users={users}
                helpRequests={enrichedHelpRequests}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                selectedUserResults={enrichedSelectedUserResults}
                studentProgress={studentProgress}
              />
            )}
            {activeTab === 'logs' && <AdminLogsTab systemLogs={systemLogs} />}
            {activeTab === 'results' && <AdminExamResultsTab allResults={enrichedResults} />}
            {activeTab === 'content' && <AdminContentTab />}
            {activeTab === 'queries' && <AdminQueriesTab helpRequests={enrichedHelpRequests} />}
          </>
        )}
      </div>
    </div>
  );
}
