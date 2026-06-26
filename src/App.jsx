import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { StudentProgressProvider } from './context/StudentProgressContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import LandingPage from './pages/LandingPage';
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

export default function App() {
  // KILL SWITCH: Set this to true at 11:45 PM to lock down the site.
  const isEventOver = true;

  return (
    <ThemeProvider>
      <AuthProvider>
        <StudentProgressProvider>
          <Routes>
            {/* Admin Routes (ALWAYS OPEN) */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            
            {/* Temporary preview route */}
            <Route path="/thank-you-preview" element={<ThankYouPage />} />

            {/* Event Lock Down Logic */}
            {isEventOver ? (
              // If the event is over, EVERY other route is replaced by the Thank You Page
              <Route path="*" element={<ThankYouPage />} />
            ) : (
              // If the event is NOT over, all student routes work normally
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
