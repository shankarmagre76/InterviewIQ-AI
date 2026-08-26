import React from 'react';

const styleVariants = {
  primary: {
    soft: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    solid: 'bg-indigo-600 text-white border-transparent',
    outline: 'bg-transparent text-indigo-400 border-indigo-500/50',
  },
  secondary: {
    soft: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    solid: 'bg-cyan-600 text-white border-transparent',
    outline: 'bg-transparent text-cyan-400 border-cyan-500/50',
  },
  success: {
    soft: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    solid: 'bg-emerald-600 text-white border-transparent',
    outline: 'bg-transparent text-emerald-400 border-emerald-500/50',
  },
  warning: {
    soft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    solid: 'bg-amber-600 text-white border-transparent',
    outline: 'bg-transparent text-amber-400 border-amber-500/50',
  },
  danger: {
    soft: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    solid: 'bg-rose-600 text-white border-transparent',
    outline: 'bg-transparent text-rose-400 border-rose-500/50',
  },
  info: {
    soft: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    solid: 'bg-sky-600 text-white border-transparent',
    outline: 'bg-transparent text-sky-400 border-sky-500/50',
  },
  neutral: {
    soft: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    solid: 'bg-slate-700 text-slate-100 border-transparent',
    outline: 'bg-transparent text-slate-400 border-slate-700',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[11px] gap-1 font-semibold',
  md: 'px-2.5 py-1 text-xs gap-1.5 font-semibold',
};

export const Badge = ({
  children,
  variant = 'primary',
  style = 'soft',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const variantObj = styleVariants[variant] || styleVariants.primary;
  const colorClass = variantObj[style] || variantObj.soft;

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors ${colorClass} ${sizeClasses[size]} ${className}`.trim()}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
