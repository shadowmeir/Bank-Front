import React, { forwardRef, type InputHTMLAttributes } from 'react';
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label &&
        <label className="text-sm font-medium text-gray-300 ml-1">
            {label}
          </label>
        }
        <div className="relative group">
          {icon &&
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-cyan transition-colors">
              {icon}
            </div>
          }
          <input
            ref={ref}
            className={`
              w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3
              text-white placeholder:text-gray-600
              focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              ${className}
            `}
            {...props} />

        </div>
        {error &&
        <p className="text-sm text-red-400 ml-1 animate-pulse">{error}</p>
        }
      </div>);

  }
);
Input.displayName = 'Input';