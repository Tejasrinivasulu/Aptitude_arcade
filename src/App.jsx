import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { syncServerTime } from './utils/serverTime';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { StudentProgressProvider } from './context/StudentProgressContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import LandingPage from './pages/LandingPage';
import IntroPage from './pages/IntroPage';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import TakeTest from './pages/TakeTest';
import Exam from './pages/Exam';
import Results from './pages/Results';
import Profile from './pages/Profile';
import HelpCenter from './pages/HelpCenter';
import AdminDashboard from './pages/AdminDashboard';
import ThankYouPage from './pages/ThankYouPage';

/** Intro page cutoff: Sep 28, 2026 at 08:00 AM IST */
function isBeforeEventStart() {
  const cutoff = new Date('2026-09-28T08:00:00+05:30');
  return new Date() < cutoff;
}

export default function App() {
  useEffect(() => {
    syncServerTime();
  }, []);

  // KILL SWITCH: Set this to true to lock down the site after event ends.
  const isEventOver = false;

  // INTRO SWITCH: Temporarily disabled for testing (re-enable with isBeforeEventStart())
  const isIntroActive = false;

  return (
    <ThemeProvider>
      <AuthProvider>
        <StudentProgressProvider>
          <Routes>
            {/* Admin Routes (ALWAYS OPEN) */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            
            {/* Temporary preview routes (always accessible for development) */}
            <Route path="/thank-you-preview" element={<ThankYouPage />} />
            <Route path="/intro-preview" element={<IntroPage />} />
            <Route path="/landing-preview" element={<LandingPage />} />

            {/* Event Lock Down Logic */}
            {isEventOver ? (
              // Event is over → Thank You page everywhere
              <Route path="*" element={<ThankYouPage />} />
            ) : isIntroActive ? (
              // Before event start → Intro page everywhere (except admin)
              <Route path="*" element={<IntroPage />} />
            ) : (
              // Event is live → Normal site
              <>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route
                  path="/student/exam"
                  element={
                    <ProtectedRoute>
                      <Exam />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/student"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="learn" element={<Learn />} />
                  <Route path="take-test" element={<TakeTest />} />
                  <Route path="results" element={<Results />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="help" element={<HelpCenter />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </StudentProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

