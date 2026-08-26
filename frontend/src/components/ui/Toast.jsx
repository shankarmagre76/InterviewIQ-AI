import React, { useState, useCallback, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react';
import { ToastContext } from '../../context/ToastContext';

/**
 * Modern Custom Toast Variant Definitions & Aesthetics
 */
const toastVariants = {
  success: {
    bg: 'bg-slate-950/95 border-emerald-500/40 shadow-[0_10px_35px_-5px_rgba(16,185,129,0.3)]',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    progressBar: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300',
    titleColor: 'text-emerald-300',
    defaultTitle: 'Success',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  },
  error: {
    bg: 'bg-slate-950/95 border-rose-500/40 shadow-[0_10px_35px_-5px_rgba(244,63,94,0.3)]',
    iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.35)]',
    progressBar: 'bg-gradient-to-r from-rose-500 via-red-400 to-rose-300',
    titleColor: 'text-rose-300',
    defaultTitle: 'Error',
    icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
  },
  warning: {
    bg: 'bg-slate-950/95 border-amber-500/40 shadow-[0_10px_35px_-5px_rgba(245,158,11,0.3)]',
    iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.35)]',
    progressBar: 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300',
    titleColor: 'text-amber-300',
    defaultTitle: 'Attention',
    icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  },
  info: {
    bg: 'bg-slate-950/95 border-sky-500/40 shadow-[0_10px_35px_-5px_rgba(56,189,248,0.3)]',
    iconBg: 'bg-sky-500/20 text-sky-400 border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.35)]',
    progressBar: 'bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-400',
    titleColor: 'text-sky-300',
    defaultTitle: 'Information',
    icon: <Info className="w-5 h-5 text-sky-400" />,
  },
  loading: {
    bg: 'bg-slate-950/95 border-indigo-500/40 shadow-[0_10px_35px_-5px_rgba(99,102,241,0.3)]',
    iconBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.35)]',
    progressBar: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 animate-pulse',
    titleColor: 'text-indigo-300',
    defaultTitle: 'Processing...',
    icon: <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />,
  },
  custom: {
    bg: 'bg-slate-950/95 border-purple-500/40 shadow-[0_10px_35px_-5px_rgba(168,85,247,0.3)]',
    iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.35)]',
    progressBar: 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-400',
    titleColor: 'text-purple-300',
    defaultTitle: 'Notification',
    icon: <Sparkles className="w-5 h-5 text-purple-400" />,
  },
};

/**
 * Individual Interactive Toast Card Component
 */
const ToastCard = ({ toast, onRemove }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = toast.duration ?? 4500;
  const isInfinite = duration <= 0 || toast.variant === 'loading';

  useEffect(() => {
    if (isInfinite || isPaused) return;

    const intervalTime = 40;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onRemove(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [duration, isInfinite, isPaused, onRemove, toast.id]);

  const config = toastVariants[toast.variant] || toastVariants.info;
  const displayTitle = toast.title || (toast.message ? null : config.defaultTitle);
  const displayMessage = toast.message || (typeof toast.title === 'string' ? '' : '');

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`
        group relative overflow-hidden pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl border backdrop-blur-2xl transition-all duration-300 ease-out shadow-2xl hover:scale-[1.02] sm:w-[380px] w-[calc(100vw-2.5rem)]
        ${config.bg}
      `.trim()}
      role="alert"
    >
      {/* Top Glass Accent Highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Icon Badge Container */}
      <div className={`p-2.5 rounded-xl border shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 ${config.iconBg}`}>
        {toast.icon || config.icon}
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0 pr-1 pt-0.5 space-y-1">
        {displayTitle && (
          <h4 className={`text-xs font-bold tracking-wider uppercase font-mono ${config.titleColor}`}>
            {displayTitle}
          </h4>
        )}
        {displayMessage && (
          <p className="text-xs text-slate-200 font-medium leading-relaxed break-words">
            {displayMessage}
          </p>
        )}

        {/* Optional Action CTA Button */}
        {toast.action && (
          <div className="pt-1.5">
            <button
              type="button"
              onClick={() => {
                toast.action.onClick?.();
                onRemove(toast.id);
              }}
              className="px-3 py-1 text-[11px] font-bold text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-indigo-500/20"
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Dynamic Animated Timer Progress Bar */}
      {!isInfinite && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900/90">
          <div
            className={`h-full transition-all duration-75 ease-linear ${config.progressBar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Toast Provider & Toaster Viewport
 */
export const ToastProvider = ({ children, position = 'bottom-right' }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((options, variant = 'info', duration) => {
    const id = Date.now() + Math.random();
    let toastObj = {};

    if (typeof options === 'string') {
      toastObj = { id, message: options, variant, duration };
    } else {
      toastObj = { id, variant: options.variant || variant, duration: options.duration ?? duration, ...options };
    }

    setToasts((prev) => [...prev, toastObj]);
    return id;
  }, []);

  const updateToast = useCallback((id, newOptions) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...newOptions } : t))
    );
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const positionClasses = {
    'top-right': 'top-5 right-5 items-end',
    'top-left': 'top-5 left-5 items-start',
    'bottom-right': 'bottom-5 right-5 items-end',
    'bottom-left': 'bottom-5 left-5 items-start',
    'top-center': 'top-5 left-1/2 -translate-x-1/2 items-center',
    'bottom-center': 'bottom-5 left-1/2 -translate-x-1/2 items-center',
  }[position] || 'bottom-5 right-5 items-end';

  return (
    <ToastContext.Provider value={{ addToast, updateToast, removeToast }}>
      {children}
      {/* Toast Notification Floating Container */}
      <div className={`fixed z-[9999] flex flex-col gap-3 pointer-events-none max-w-full p-2 ${positionClasses}`}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
