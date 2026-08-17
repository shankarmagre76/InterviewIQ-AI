import React from 'react';
import { Check } from 'lucide-react';

export const Checkbox = React.forwardRef(({
  label,
  helperText,
  error,
  checked = false,
  onChange,
  disabled = false,
  className = '',
  id,
  ...props
}, ref) => {
  const checkboxId = id || (label ? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="flex items-start gap-2.5 select-none">
      <div className="relative flex items-center mt-0.5">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div
          onClick={() => !disabled && onChange && onChange({ target: { checked: !checked } })}
          className={`
            w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer
            ${checked
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-500/30'
              : 'bg-slate-900/80 border-slate-700 hover:border-indigo-500/50'
            }
            ${error ? 'border-rose-500/80' : ''}
            ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
            peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-950
            ${className}
          `.trim()}
        >
          {checked && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      </div>

      {(label || helperText || error) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={checkboxId}
              className={`text-xs font-semibold text-slate-200 cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {label}
            </label>
          )}
          {error ? (
            <p className="text-[11px] text-rose-400 font-medium mt-0.5">{error}</p>
          ) : helperText ? (
            <p className="text-[11px] text-slate-400 font-normal mt-0.5">{helperText}</p>
          ) : null}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
