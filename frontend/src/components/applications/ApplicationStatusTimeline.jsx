import React from 'react';
import {
  Send,
  Clock,
  Video,
  Award,
  XCircle,
  CheckCircle2,
} from 'lucide-react';

export const TIMELINE_STAGES = [
  { id: 'Applied', label: 'Applied', icon: Send },
  { id: 'Under Review', label: 'Under Review', icon: Clock },
  { id: 'Interview', label: 'Interview Stage', icon: Video },
  { id: 'Decision', label: 'Final Decision', icon: Award },
];

export const ApplicationStatusTimeline = ({ status = 'Applied', className = '' }) => {
  const isRejected = status === 'Rejected';
  const isWithdrawn = status === 'Withdrawn';
  const isOffered = status === 'Offered';

  // Determine current active stage index (0 to 3)
  const getStageIndex = (currentStatus) => {
    if (currentStatus === 'Applied') return 0;
    if (currentStatus === 'Under Review') return 1;
    if (
      currentStatus === 'Interview Scheduled' ||
      currentStatus === 'Technical Round' ||
      currentStatus === 'HR Round'
    )
      return 2;
    if (currentStatus === 'Offered' || currentStatus === 'Rejected' || currentStatus === 'Withdrawn')
      return 3;
    return 0;
  };

  const activeIndex = getStageIndex(status);

  return (
    <div className={`p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl ${className}`.trim()}>
      <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider text-[11px] font-mono">
        Application Status Timeline
      </h3>

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-2 pt-2">
        {/* Background Connecting Line for Desktop */}
        <div className="hidden sm:block absolute top-1/2 left-8 right-8 h-1 bg-slate-800 -translate-y-1/2 z-0" />

        {TIMELINE_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isPassed = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          let stepBg = 'bg-slate-900 border-slate-800 text-slate-500';
          let labelColor = 'text-slate-400';

          if (isPassed) {
            stepBg = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400';
            labelColor = 'text-slate-200';
          } else if (isCurrent) {
            if (isRejected) {
              stepBg = 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/10';
              labelColor = 'text-rose-300 font-bold';
            } else if (isWithdrawn) {
              stepBg = 'bg-slate-800 border-slate-700 text-slate-300';
              labelColor = 'text-slate-300 font-bold';
            } else if (isOffered) {
              stepBg = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10';
              labelColor = 'text-emerald-300 font-bold';
            } else {
              stepBg = 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10';
              labelColor = 'text-indigo-300 font-bold';
            }
          }

          let stageLabel = stage.label;
          if (isCurrent) {
            if (isRejected) stageLabel = 'Rejected';
            else if (isWithdrawn) stageLabel = 'Withdrawn';
            else if (isOffered) stageLabel = 'Job Offered!';
            else if (
              status === 'Interview Scheduled' ||
              status === 'Technical Round' ||
              status === 'HR Round'
            ) {
              stageLabel = status;
            }
          }

          return (
            <div
              key={stage.id}
              className="relative z-10 flex sm:flex-col items-center gap-3 sm:gap-2 text-center w-full sm:w-auto"
            >
              {/* Step Circle */}
              <div
                className={`
                  w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0
                  ${stepBg}
                `.trim()}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isCurrent && isRejected ? (
                  <XCircle className="w-5 h-5 text-rose-400" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              {/* Step Title & Subtitle */}
              <div className="text-left sm:text-center space-y-0.5">
                <span className={`text-xs block ${labelColor}`}>{stageLabel}</span>
                {isCurrent && (
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">
                    Current Stage
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationStatusTimeline;
