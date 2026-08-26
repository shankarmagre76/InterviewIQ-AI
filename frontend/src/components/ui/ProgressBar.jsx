import React from 'react';

const colorVariants = {
  indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
  cyan: 'bg-gradient-to-r from-cyan-500 to-teal-400',
  emerald: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  amber: 'bg-gradient-to-r from-amber-500 to-orange-500',
  rose: 'bg-gradient-to-r from-rose-500 to-red-600',
};

export const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  showPercentage = true,
  color = 'indigo',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size] || 'h-2.5';

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`.trim()}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          {label && <span>{label}</span>}
          {showPercentage && <span className="text-slate-400">{percentage}%</span>}
        </div>
      )}

      <div className={`w-full rounded-full bg-slate-900/90 border border-slate-800 overflow-hidden ${heightClasses}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorVariants[color] || colorVariants.indigo}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};
