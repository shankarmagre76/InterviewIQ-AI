import React from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

const alertConfig = {
  info: {
    bg: 'bg-sky-500/10 border-sky-500/30 text-sky-200',
    icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
    titleColor: 'text-sky-300',
  },
  success: {
    bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    titleColor: 'text-emerald-300',
  },
  warning: {
    bg: 'bg-amber-500/10 border-amber-500/30 text-amber-200',
    icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    titleColor: 'text-amber-300',
  },
  danger: {
    bg: 'bg-rose-500/10 border-rose-500/30 text-rose-200',
    icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    titleColor: 'text-rose-300',
  },
};

export const Alert = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const config = alertConfig[variant] || alertConfig.info;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`rounded-xl border p-4 flex items-start gap-3.5 backdrop-blur-md ${config.bg} ${className}`.trim()}
    >

      {config.icon}
      <div className="flex-1 text-sm leading-relaxed">
        {title && <h4 className={`font-semibold mb-1 ${config.titleColor}`}>{title}</h4>}
        <div className="text-slate-300">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors cursor-pointer"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
