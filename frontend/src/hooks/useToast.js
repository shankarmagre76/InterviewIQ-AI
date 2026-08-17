import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';


export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: (msg) => console.log('[Toast Success]:', msg),
      error: (msg) => console.error('[Toast Error]:', msg),
      warning: (msg) => console.warn('[Toast Warning]:', msg),
      info: (msg) => console.info('[Toast Info]:', msg),
    };
  }

  return {
    success: (msg, duration) => context.addToast(msg, 'success', duration),
    error: (msg, duration) => context.addToast(msg, 'error', duration),
    warning: (msg, duration) => context.addToast(msg, 'warning', duration),
    info: (msg, duration) => context.addToast(msg, 'info', duration),
  };
};

export default useToast;
