import React from 'react';
import { AlertOctagon, RefreshCw, ShieldAlert, FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Failed to Load Data',
  message = 'An unexpected error occurred while fetching information. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`rounded-2xl glass-panel p-8 text-center flex flex-col items-center justify-center border border-rose-500/30 ${className}`.trim()}>
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-3.5 shadow-inner">
        <AlertOctagon className="w-7 h-7" />
      </div>

      <h3 className="text-base font-bold text-rose-200 mb-1 tracking-tight">{title}</h3>
      <p className="text-slate-400 text-xs max-w-md mb-5 leading-relaxed">{message}</p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export const NotFoundState = ({
  title = '404 — Page Not Found',
  message = 'The requested resource or page does not exist or has been relocated.',
  onGoHome,
  className = '',
}) => {
  return (
    <div className={`rounded-2xl glass-panel p-10 text-center flex flex-col items-center justify-center border border-slate-800 ${className}`.trim()}>
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
        <FileQuestion className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-white mb-1.5 tracking-tight">{title}</h3>
      <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">{message}</p>

      <Button
        variant="primary"
        size="sm"
        onClick={onGoHome || (() => window.location.href = '/dashboard')}
        leftIcon={<Home className="w-4 h-4" />}
      >
        Back to Dashboard
      </Button>
    </div>
  );
};

export const UnauthorizedState = ({
  title = '403 — Access Restricted',
  message = 'You do not have permission to view this administrative resource.',
  onBack,
  className = '',
}) => {
  return (
    <div className={`rounded-2xl glass-panel p-10 text-center flex flex-col items-center justify-center border border-amber-500/30 ${className}`.trim()}>
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 shadow-inner">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-amber-200 mb-1.5 tracking-tight">{title}</h3>
      <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">{message}</p>

      <Button
        variant="outline"
        size="sm"
        onClick={onBack || (() => window.location.href = '/dashboard')}
        leftIcon={<ArrowLeft className="w-4 h-4" />}
      >
        Return to Portal
      </Button>
    </div>
  );
};

export default ErrorState;

