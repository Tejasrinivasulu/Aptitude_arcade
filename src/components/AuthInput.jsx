import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function AuthInput({
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  showToggle,
  compact = false,
  ariaLabel,
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showToggle ? (visible ? 'text' : 'password') : type;

  return (
    <div>
      <div className="relative group">
        {Icon && (
          <Icon
            size={18}
            className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-orange-500'
            }`}
          />
        )}
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={ariaLabel || placeholder}
          className={`w-full rounded-2xl border-2 border-transparent bg-gray-50 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 ${
            Icon ? 'pl-11' : 'pl-4'
          } ${compact ? 'py-3.5 text-sm' : 'py-4 text-sm'} ${
            error ? '!border-red-400 !bg-white focus:!ring-red-100' : ''
          }`}
        />
        {isPassword && showToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 ml-1 text-xs font-bold text-red-500 animate-fade-in">{error}</p>}
    </div>
  );
}
