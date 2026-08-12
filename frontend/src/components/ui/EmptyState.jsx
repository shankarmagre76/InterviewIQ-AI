import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon = <Inbox className="w-10 h-10 text-slate-500" />,
  title = 'No Data Found',
  description = 'There are no items to display at this moment.',
  primaryAction,
  secondaryAction,
  className = '',
}) => {
  return (
    <div className={`rounded-2xl glass-panel p-10 text-center flex flex-col items-center justify-center border border-slate-800/80 ${className}`.trim()}>
      <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mb-4 shadow-inner">
        {icon}
      </div>

      <h3 className="text-lg font-bold text-slate-100 mb-1.5 tracking-tight">{title}</h3>
      <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">{description}</p>

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {secondaryAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={secondaryAction.onClick}
              leftIcon={secondaryAction.icon}
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              variant="primary"
              size="sm"
              onClick={primaryAction.onClick}
              leftIcon={primaryAction.icon}
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
