import { User, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthCardLayout from '../components/AuthCardLayout';
import { AuthInput } from '../components/AuthInput';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ loginId: '', password: '', remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const submitLogin = async (loginId, password) => {
    setLoading(true);
    setError('');

    try {
      await login(loginId.trim(), password, form.remember);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.loginId.trim() || !form.password) {
      setError('Please enter your full name and password.');
      return;
    }

    await submitLogin(form.loginId, form.password);
  };


  return (
    <AuthCardLayout mode="login">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="mb-8 text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h1>


        {error && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <AuthInput
            id="loginId"
            name="loginId"
            type="text"
            value={form.loginId}
            onChange={handleChange}
            placeholder="Full Name"
            icon={User}
            compact
          />

          <AuthInput
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            icon={Lock}
            compact
          />

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-xs text-gray-500">Remember Me</span>
            </label>
            <Link to="/forgot-password" className="text-xs font-bold text-gray-500 hover:text-orange-500 transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-[#ff6a2b] to-[#ff8552] py-4 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Authenticating...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 lg:hidden">
          Don&apos;t have an account?   
          <Link to="/signup" className="ml-1 font-black text-orange-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </AuthCardLayout>
  );
}
