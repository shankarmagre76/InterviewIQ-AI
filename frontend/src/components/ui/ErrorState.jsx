import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
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
