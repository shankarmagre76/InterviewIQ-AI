import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

/**
 * Enhanced Custom useToast Hook
 * Provides intuitive, beautiful toast notifications across the entire app.
 */
export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    // Fallback if component is used outside ToastProvider
    const formatMsg = (msg) => (typeof msg === 'object' ? msg.message || msg.title : msg);
    return {
      success: (msg) => console.log('[Toast Success]:', formatMsg(msg)),
      error: (msg) => console.error('[Toast Error]:', formatMsg(msg)),
      warning: (msg) => console.warn('[Toast Warning]:', formatMsg(msg)),
      info: (msg) => console.info('[Toast Info]:', formatMsg(msg)),
      loading: (msg) => console.info('[Toast Loading]:', formatMsg(msg)),
      custom: (msg) => console.info('[Toast Custom]:', formatMsg(msg)),
      promise: (promise) => promise,
      dismiss: () => {},
    };
  }

  /**
   * Universal helper function to parse title, message, and options
   */
  const createToastHandler = (variant) => (titleOrMsg, descOrOpts, opts = {}) => {
    let options = {};
    if (typeof descOrOpts === 'string') {
      options = { title: titleOrMsg, message: descOrOpts, ...opts };
    } else if (typeof descOrOpts === 'object' && descOrOpts !== null) {
      options = { message: titleOrMsg, ...descOrOpts };
    } else {
      options = { message: titleOrMsg, duration: descOrOpts || opts.duration };
    }
    return context.addToast(options, variant);
  };

  return {
    toast: (msg, variant, opts) =>
      context.addToast(typeof msg === 'object' ? msg : { message: msg, ...opts }, variant),
    success: createToastHandler('success'),
    error: createToastHandler('error'),
    warning: createToastHandler('warning'),
    info: createToastHandler('info'),
    loading: createToastHandler('loading'),
    custom: createToastHandler('custom'),
    dismiss: context.removeToast,
    /**
     * Promise Toast Handler:
     * Automates Async operations by showing a loading toast that updates to success/error upon resolution/rejection.
     */
    promise: (promise, { loading, success, error }) => {
      const loadingOpts =
        typeof loading === 'string' ? { title: 'Processing', message: loading } : loading || { message: 'Loading...' };
      const toastId = context.addToast(loadingOpts, 'loading', 0);

      return promise
        .then((res) => {
          const successOpts =
            typeof success === 'function'
              ? success(res)
              : typeof success === 'string'
              ? { message: success }
              : success;
          context.updateToast(toastId, {
            ...successOpts,
            variant: 'success',
            duration: successOpts?.duration || 4500,
          });
          return res;
        })
        .catch((err) => {
          const errorOpts =
            typeof error === 'function'
              ? error(err)
              : typeof error === 'string'
              ? { message: error }
              : typeof err?.message === 'string'
              ? { title: 'Error Occurred', message: err.message }
              : error || { title: 'Error', message: 'Action failed. Please try again.' };
          context.updateToast(toastId, {
            ...errorOpts,
            variant: 'error',
            duration: errorOpts?.duration || 5500,
          });
          throw err;
        });
    },
  };
};

export default useToast;
