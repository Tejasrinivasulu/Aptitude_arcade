/**
 * Client-side format validators.
 *
 * Uniqueness of email and rollNumber is no longer checked here — it is
 * verified asynchronously against Firestore during SignUp (async check)
 * and enforced by Firestore composite indexes + Security Rules at rest.
 * The `existingUsers` parameter is kept for backward compatibility but
 * is ignored when provided.
 */

export function validateFullName(name) {
  if (!name.trim()) return 'Full name is required';
  if (name.trim().length < 2) return 'Full name must be at least 2 characters';
  return '';
}

export function validateRollNumber(rollNumber) {
  if (!rollNumber.trim()) return 'Roll number is required';
  if (rollNumber.trim().length < 3) return 'Roll number must be at least 3 characters';
  return '';
}

export function validateEmail(email) {
  if (!email.trim()) return 'Email address is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Enter a valid email address';
  return '';
}

export function validatePhone(phone) {
  if (!phone.trim()) return 'Phone number is required';
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 10) return 'Phone number must be exactly 10 digits';
  return '';
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Minimum 8 characters required';
  if (!/[A-Z]/.test(password)) return 'Must contain one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Must contain one number';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Must contain one special character';
  return '';
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
}

export function validateRequired(value, fieldName) {
  if (!value || !value.trim()) return `${fieldName} is required`;
  return '';
}

export function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  return score;
}
