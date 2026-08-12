import React from 'react';
import { Loader2 } from 'lucide-react';

const variantStyles = {
  primary: 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/30',
  secondary: 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30',
  outline: 'bg-slate-900/60 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-indigo-500/50 hover:text-white',
  ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white',
  danger: 'bg-rose-600/90 hover:bg-rose-600 text-white shadow-lg shadow-rose-600/20 border border-rose-500/30',
  success: 'bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 border border-emerald-500/30',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs rounded-lg font-medium gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl font-semibold gap-2',
  lg: 'px-6 py-3 text-base rounded-xl font-semibold gap-2.5',
  icon: 'p-2.5 rounded-xl text-sm font-medium',
};

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

  const widthClass = fullWidth ? 'w-full' : '';
  const computedClasses = `${baseClasses} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${widthClass} ${className}`.trim();

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={computedClasses}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';
