import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(({
  label,
  helperText,
  error,
  options = [],
  children,
  className = '',
  id,
  disabled = false,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold uppercase tracking-wider text-slate-300"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`
            w-full rounded-xl bg-slate-900/80 border text-slate-100 text-sm py-2.5 pl-4 pr-10 appearance-none transition-all duration-200 cursor-pointer
            ${error
              ? 'border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50'
              : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 hover:border-slate-700'
            }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-950/60
            focus:outline-none focus:bg-slate-900
            ${className}
          `.trim()}
          {...props}
        >
          {children ? (
            children
          ) : (
            options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-slate-900 text-slate-100 py-2"
              >
                {opt.label}
              </option>
            ))
          )}
        </select>

        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
      </div>

      {error ? (
        <p className="text-xs text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 font-normal">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
