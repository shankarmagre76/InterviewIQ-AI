import React, { useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastContext } from '../../context/ToastContext';


const toastConfig = {
  success: {
    bg: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
  },
  error: {
    bg: 'bg-rose-950/90 border-rose-500/40 text-rose-200',
    icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
  },
  warning: {
    bg: 'bg-amber-950/90 border-amber-500/40 text-amber-200',
    icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
  },
  info: {
    bg: 'bg-sky-950/90 border-sky-500/40 text-sky-200',
    icon: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, variant = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Notification Floating Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const config = toastConfig[toast.variant] || toastConfig.info;
          return (
            <div
              key={toast.id}
              className={`
                pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-2xl shadow-black/80 text-xs font-medium transition-all animate-in slide-in-from-right-5
                ${config.bg}
              `.trim()}
            >
              <div className="flex items-center gap-2.5">
                {config.icon}
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
