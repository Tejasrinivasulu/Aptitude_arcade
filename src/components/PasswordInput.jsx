import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  error,
  showPassword,
  onToggle,
  label,
  compact = false,
}) {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className={`block font-medium text-gray-700 ${compact ? 'mb-1 text-xs' : 'mb-1.5 text-sm'}`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded border bg-white pr-10 text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/30 ${
            compact ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-sm'
          } ${error ? 'border-red-400' : 'border-gray-300'}`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-primary"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && (
        <p className={`text-red-500 ${compact ? 'mt-0.5 text-[11px]' : 'mt-1 text-xs'}`}>{error}</p>
      )}
    </div>
  );
}
