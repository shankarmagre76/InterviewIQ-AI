import React from 'react';

export const Textarea = React.forwardRef(({
  label,
  helperText,
  error,
  className = '',
  id,
  rows = 4,
  disabled = false,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-semibold uppercase tracking-wider text-slate-300"
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        className={`
          w-full rounded-xl bg-slate-900/80 border text-slate-100 placeholder-slate-500 text-sm p-4 transition-all duration-200 resize-y
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

      {error ? (
        <p className="text-xs text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 font-normal">{helperText}</p>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';
