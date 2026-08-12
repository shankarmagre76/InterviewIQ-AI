import React from 'react';

export const Input = React.forwardRef(({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  className = '',
  id,
  type = 'text',
  disabled = false,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex justify-between"
        >
          <span>{label}</span>
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={`
            w-full rounded-xl bg-slate-900/80 border text-slate-100 placeholder-slate-500 text-sm py-2.5 transition-all duration-200
            ${leftIcon ? 'pl-10' : 'pl-4'}
            ${rightIcon ? 'pr-10' : 'pr-4'}
            ${error
              ? 'border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50'
              : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 hover:border-slate-700'
            }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-950/60
            focus:outline-none focus:bg-slate-900
            ${className}
          `.trim()}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 text-slate-400 flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-400 font-medium flex items-center gap-1">
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 font-normal">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
