import { CheckCircle, X } from 'lucide-react';

export default function RegistrationSuccessModal({ user, onProceed }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-secondary/60 backdrop-blur-sm" onClick={onProceed} />
      <div className="glass animate-fade-in relative w-full max-w-md rounded-2xl border border-white/20 p-8 shadow-2xl dark:border-white/10">
        <button
          onClick={onProceed}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:text-secondary dark:hover:text-white"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="text-green-600 dark:text-green-400" size={36} />
          </div>
        </div>

        <h2 className="mb-2 text-center text-2xl font-bold text-secondary dark:text-white">
          Registration Successful 🎉
        </h2>
        <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Your Aptitude Arcade account has been created successfully.
        </p>

        <div className="mb-6 space-y-3 rounded-xl bg-background p-4 dark:bg-secondary/50">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Registered Details
          </h3>
          <div className="space-y-2">
            <DetailRow label="Full Name" value={user.fullName} />
            <DetailRow label="Roll Number" value={user.rollNumber} />
            <DetailRow label="Email Address" value={user.email} />
          </div>
        </div>

        <button
          onClick={onProceed}
          className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary-dark"
        >
          Proceed to Login
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-secondary dark:text-white">{value}</span>
    </div>
  );
}
