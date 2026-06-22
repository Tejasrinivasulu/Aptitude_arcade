import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import DarkModeToggle from '../components/DarkModeToggle';

export default function ForgotPassword() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const auth = getAuth();
    if (!auth) {
      setError('Authentication service is not configured.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err?.message || 'Failed to send reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-auth-pattern px-4 font-sans selection:bg-orange-200"
      onMouseMove={handleMouseMove}
    >
      {/* Spotlight Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.1) 20%, transparent 50%)`
        }}
      />

      <div className="absolute right-4 top-4 z-10">
        <DarkModeToggle />
      </div>

      <div className="glass-card shadow-premium animate-fade-in w-full max-w-md rounded-[28px] border border-white/50 p-8 sm:p-10 relative z-10 bg-white/60">
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 transition-colors hover:text-orange-500"
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 shadow-sm border border-orange-200">
            <Mail className="text-orange-500" size={32} />
          </div>
        </div>

        <h1 className="mb-3 text-center text-3xl font-black text-gray-900 tracking-tight">
            Forgot Password?
        </h1>
        <p className="mb-8 text-center text-sm font-medium text-gray-600">
          Enter your registered email address and we&apos;ll send you a password reset link.
        </p>

        {sent ? (
          <div className="rounded-2xl bg-green-50 border border-green-200 p-5 text-center">
            <p className="text-sm font-bold text-green-800">Reset link sent!</p>
            <p className="mt-1 text-xs text-green-700">
              Check your inbox at <strong>{email}</strong> and follow the link to create a new password.
            </p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-2.5 text-center text-sm font-medium text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="Enter your registered email"
                className="w-full rounded-2xl border-2 border-transparent bg-gray-50 px-4 py-4 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-[#ff6a2b] to-[#ff8552] py-4 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        <div className="mt-8 rounded-2xl bg-white/40 border border-white/50 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Reset Flow</p>
          <ol className="mt-3 space-y-2 text-sm font-medium text-gray-700">
            <li>1. Enter Email</li>
            <li>2. Receive Reset Link</li>
            <li>3. Create New Password</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
