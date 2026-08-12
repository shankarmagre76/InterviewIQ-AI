import React from 'react';

export const ProgressCircle = ({
  value = 0,
  max = 100,
  size = 100,
  strokeWidth = 8,
  color = '#6366f1',
  trackColor = '#1e293b',
  label,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`inline-flex flex-col items-center justify-center relative ${className}`.trim()}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <span className="text-base font-bold text-white tracking-tight">{percentage}%</span>
        {label && <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">{label}</span>}
      </div>
    </div>
  );
};
