import React from 'react';

export const Radio = React.forwardRef(({
  label,
  value,
  selectedValue,
  onChange,
  disabled = false,
  className = '',
  id,
  name,
  ...props
}, ref) => {
  const radioId = id || `radio-${name}-${value}`;
  const isChecked = selectedValue === value;

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="relative flex items-center">
        <input
          ref={ref}
          type="radio"
          id={radioId}
          name={name}
          value={value}
          checked={isChecked}
          onChange={() => !disabled && onChange && onChange(value)}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div
          onClick={() => !disabled && onChange && onChange(value)}
          className={`
            w-4 h-4 rounded-full border flex items-center justify-center transition-all cursor-pointer
            ${isChecked
              ? 'border-indigo-500 bg-indigo-600/20 shadow-sm shadow-indigo-500/20'
              : 'bg-slate-900/80 border-slate-700 hover:border-indigo-500/50'
            }
            ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
            peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-950
            ${className}
          `.trim()}
        >
          {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
        </div>
      </div>

      {label && (
        <label
          htmlFor={radioId}
          className={`text-xs font-semibold text-slate-200 cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          {label}
        </label>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';

export const RadioGroup = ({
  label,
  name,
  value,
  onChange,
  options = [],
  children,
  className = '',
}) => {
  return (
    <div className="w-full flex flex-col gap-2">
      {label && <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>}
      <div className={`flex flex-col gap-2.5 ${className}`.trim()}>
        {children
          ? React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { name, selectedValue: value, onChange });
              }
              return child;
            })
          : options.map((opt) => (
              <Radio
                key={opt.value}
                name={name}
                value={opt.value}
                label={opt.label}
                selectedValue={value}
                onChange={onChange}
                disabled={opt.disabled}
              />
            ))}
      </div>
    </div>
  );
};
