import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  }[size] || 'w-6 h-6';

  return (
    <Loader2 className={`animate-spin text-indigo-400 ${sizeClasses} ${className}`.trim()} />
  );
};

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-800/60 border border-slate-800 ${className}`.trim()}
      {...props}
    />
  );
};

export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2.5 ${className}`.trim()}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          className={`h-4 ${idx === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`rounded-2xl glass-panel p-6 space-y-4 border border-slate-800 ${className}`.trim()}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="pt-2 flex justify-between items-center">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
};

export const ChartSkeleton = ({ height = 260, className = '' }) => {
  return (
    <div className={`rounded-2xl glass-panel p-6 space-y-4 border border-slate-800 ${className}`.trim()}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="flex items-end justify-between gap-3 pt-4" style={{ height }}>
        <Skeleton className="w-full h-1/3 rounded-t-lg" />
        <Skeleton className="w-full h-2/3 rounded-t-lg" />
        <Skeleton className="w-full h-1/2 rounded-t-lg" />
        <Skeleton className="w-full h-4/5 rounded-t-lg" />
        <Skeleton className="w-full h-3/4 rounded-t-lg" />
        <Skeleton className="w-full h-full rounded-t-lg" />
      </div>
    </div>
  );
};

export const ActivitySkeleton = ({ count = 4, className = '' }) => {
  return (
    <div className={`rounded-2xl glass-panel p-6 space-y-4 border border-slate-800 ${className}`.trim()}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      <div className="space-y-3 pt-2">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-14 rounded-md shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 5, className = '' }) => {
  return (
    <div className={`rounded-2xl glass-panel border border-slate-800 p-4 space-y-4 shadow-xl ${className}`.trim()}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center justify-between gap-4 py-2 border-b border-slate-800/40">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                className={`h-4 ${cIdx === 0 ? 'w-1/3' : 'w-1/6'} ${cIdx > 2 ? 'hidden sm:block' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonProfile = ({ className = '' }) => {
  return (
    <div className={`rounded-3xl glass-panel border border-slate-800 overflow-hidden space-y-6 ${className}`.trim()}>
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="px-6 pb-6 space-y-6 -mt-12">
        <div className="flex items-end justify-between gap-4">
          <Skeleton className="w-24 h-24 rounded-full border-4 border-slate-950" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/60">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonList = ({ count = 4, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`.trim()}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 flex-1">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
};

export const PageLoader = ({ message = 'Loading InterviewIQ AI...', className = '' }) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading page content"
      className={`min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4 ${className}`.trim()}
    >
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 opacity-20 animate-ping absolute" />
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-indigo-500/25 relative z-10">
          <Spinner size="lg" className="text-white" />
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white tracking-wide">{message}</h4>
        <p className="text-xs text-slate-400 font-mono">Gemini AI Engine Connecting</p>
      </div>
    </div>
  );
};

export const LoadingState = ({ message = 'Loading details...', size = 'lg', className = '' }) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={message}
      className={`flex flex-col items-center justify-center p-8 text-center space-y-3 ${className}`.trim()}
    >
      <Spinner size={size} />
      {message && <p className="text-xs font-semibold text-slate-400 animate-pulse">{message}</p>}
    </div>
  );
};

export default LoadingState;



