import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, User, Lock, Mail, Phone, Hash } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  limit,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import AuthCardLayout from '../components/AuthCardLayout';
import { AuthInput } from '../components/AuthInput';
import RegistrationSuccessModal from '../components/RegistrationSuccessModal';
import {
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validatePassword,
  validatePhone,
  validateRequired,
  validateRollNumber,
} from '../utils/validation';

const BRANCHES = [
  'Computer Science Engineering (CSE)',
  'Artificial Intelligence & Machine Learning (AIML)',
  'Artificial Intelligence & Data Science (AIDS)',
  'Information Technology (IT)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical Engineering (EEE)',
  'Mechanical Engineering',
  'Civil Engineering',
  'Other',
];

const GENDERS = ['Male', 'Female', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const initialForm = {
  fullName: '',
  rollNumber: '',
  email: '',
  phone: '',
  gender: '',
  collegeName: '',
  branch: '',
  yearOfStudy: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
};

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Check uniqueness of email and roll number against Firestore (the real
   * user store). Falls back to allowing registration when Firebase is not
   * configured — the admin can handle duplicates in that case.
   */
  const checkUniqueness = async () => {
    if (!db) return { email: '', rollNumber: '' };

    const emailErr = await validateEmail(form.email.trim(), []);
    if (emailErr) return { email: emailErr, rollNumber: '' };

    const rollErr = await validateRollNumber(form.rollNumber.trim(), []);
    if (rollErr) return { email: '', rollNumber: rollErr };

    const email = form.email.trim().toLowerCase();
    const rollNumber = form.rollNumber.trim();

    const emailSnap = await getDocs(
      query(collection(db, 'users'), where('email', '==', email), limit(1))
    );
    if (!emailSnap.empty) return { email: 'Email address already registered', rollNumber: '' };

    const rollSnap = await getDocs(
      query(collection(db, 'users'), where('rollNumber', '==', rollNumber.toLowerCase()), limit(1))
    );
    if (!rollSnap.empty) return { email: '', rollNumber: 'Roll number already registered' };

    return { email: '', rollNumber: '' };
  };

  const validateForm = () => {
    const newErrors = {};

    newErrors.fullName = validateFullName(form.fullName);
    newErrors.email = validateEmail(form.email, []); // format-only check here; uniqueness is async
    newErrors.rollNumber = validateRollNumber(form.rollNumber, []); // format-only check here
    newErrors.phone = validatePhone(form.phone);
    newErrors.gender = validateRequired(form.gender, 'Gender');
    newErrors.collegeName = validateRequired(form.collegeName, 'College name');
    newErrors.branch = validateRequired(form.branch, 'Branch');
    newErrors.yearOfStudy = validateRequired(form.yearOfStudy, 'Year of study');
    newErrors.password = validatePassword(form.password);
    newErrors.confirmPassword = validateConfirmPassword(form.password, form.confirmPassword);

    if (!form.termsAccepted) {
      newErrors.termsAccepted = 'You must agree to the terms and conditions';
    }

    const filtered = Object.fromEntries(
      Object.entries(newErrors).filter(([, v]) => v !== '')
    );
    setErrors(filtered);
    return Object.keys(filtered).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!auth || !db) {
      setErrors({ _general: 'Firebase is not configured. Cannot register.' });
      return;
    }

    setLoading(true);

    const email = form.email.trim().toLowerCase();
    const rollNumber = form.rollNumber.trim();

    // Async uniqueness check (format checks already passed in validateForm).
    const unique = await checkUniqueness();
    if (unique.email || unique.rollNumber) {
      setErrors(unique);
      setLoading(false);
      return;
    }

    // 1. Create the Firebase Auth user (password is managed by Firebase, never stored by us).
    let firebaseUser;
    try {
      firebaseUser = await createUserWithEmailAndPassword(auth, email, form.password);
    } catch (err) {
      setLoading(false);
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setErrors({ email: 'Email address already registered.' });
      } else if (code === 'auth/weak-password') {
        setErrors({ password: 'Password is too weak.' });
      } else {
        setErrors({ _general: err?.message || 'Registration failed. Please try again.' });
      }
      return;
    }

    // 2. Write the profile doc (no password).
    const profile = {
      fullName: form.fullName.trim(),
      rollNumber,
      email,
      phone: form.phone.replace(/\D/g, ''),
      gender: form.gender,
      collegeName: form.collegeName.trim(),
      branch: form.branch,
      yearOfStudy: form.yearOfStudy,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', firebaseUser.user.uid), profile);
    } catch (err) {
      // Profile write failed — delete the Auth user to avoid an orphan account.
      // eslint-disable-next-line no-console
      console.error('Profile write failed, rolling back auth user:', err);
      try {
        await firebaseUser.user.delete();
      } catch (delErr) {
        // eslint-disable-next-line no-console
        console.error('Failed to delete orphan auth user:', delErr);
      }
      setErrors({ _general: 'Registration failed during profile creation. Please try again.' });
      setLoading(false);
      return;
    }

    // 3. Sign out so the student must log in from the login page.
    try {
      await signOut(auth);
    } catch {
      /* non-fatal */
    }

    setRegisteredUser({ fullName: profile.fullName, rollNumber, email });
    setLoading(false);
    setSuccess(true);
  };

  return (
    <>
      <AuthCardLayout mode="register">
        <div className="w-full">
          <h1 className="mb-6 text-center text-3xl font-black tracking-tight text-gray-900">
            Create An Account
          </h1>

          {errors._general && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-center text-sm font-medium text-red-700">
              {errors._general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <FormField
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                error={errors.fullName}
                icon={User}
              />
              <FormField
                name="rollNumber"
                value={form.rollNumber}
                onChange={handleChange}
                placeholder="Roll Number"
                error={errors.rollNumber}
                icon={Hash}
              />
              <FormField
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                error={errors.email}
                icon={Mail}
              />
              <FormField
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                error={errors.phone}
                icon={Phone}
              />
              <SelectField
                name="gender"
                value={form.gender}
                onChange={handleChange}
                options={GENDERS}
                placeholder="Gender"
                error={errors.gender}
              />
              <SelectField
                name="yearOfStudy"
                value={form.yearOfStudy}
                onChange={handleChange}
                options={YEARS}
                placeholder="Year of Study"
                error={errors.yearOfStudy}
              />
              <SelectField
                name="branch"
                value={form.branch}
                onChange={handleChange}
                options={BRANCHES}
                placeholder="Branch"
                error={errors.branch}
                className="sm:col-span-2"
              />
              <FormField
                name="collegeName"
                value={form.collegeName}
                onChange={handleChange}
                placeholder="College Name"
                error={errors.collegeName}
                className="sm:col-span-2"
              />
              <FormField
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create Password"
                error={errors.password}
                icon={Lock}
                showToggle
              />
              <FormField
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                error={errors.confirmPassword}
                icon={Lock}
                showToggle
              />

              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={form.termsAccepted}
                    onChange={handleChange}
                    className="h-3.5 w-3.5 shrink-0 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-xs text-gray-600">
                    I agree to Terms &amp; Conditions and examination rules.
                  </span>
                </label>
                {errors.termsAccepted && (
                  <p className="mt-1 text-xs font-medium text-red-500">{errors.termsAccepted}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#ff6a2b] to-[#ff8552] py-4 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </div>
          </form>

          <p className="mt-4 text-center text-sm font-medium text-gray-500 lg:hidden">
            Already have an account?{' '}
            <Link to="/login" className="font-black text-orange-500 hover:underline ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </AuthCardLayout>

      {success && registeredUser && (
        <RegistrationSuccessModal
          user={registeredUser}
          onProceed={() => navigate('/login')}
        />
      )}
    </>
  );
}

function FormField({
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon,
  showToggle,
  className = '',
}) {
  return (
    <div className={className}>
      <AuthInput
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        icon={icon}
        error={error}
        showToggle={showToggle}
        compact
        ariaLabel={placeholder}
      />
    </div>
  );
}

function SelectField({ name, value, onChange, options, placeholder, error, className = '' }) {
  return (
    <div className={className}>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        aria-label={placeholder}
        className={`w-full rounded-2xl border-2 border-transparent bg-gray-50 px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 ${
          error ? '!border-red-400 !bg-white focus:!ring-red-100' : ''
        } ${!value ? 'text-gray-400' : ''}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
