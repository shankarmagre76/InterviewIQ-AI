import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon = Inbox,
  title = 'No Data Found',
  description = 'There are no items to display at this moment.',
  primaryAction,
  secondaryAction,
  actionLabel,
  onAction,
  className = '',
}) => {
  const effectivePrimaryAction =
    primaryAction || (actionLabel && onAction ? { label: actionLabel, onClick: onAction } : null);

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (
      typeof icon === 'function' ||
      (typeof icon === 'object' && icon !== null && (icon.$$typeof || icon.render))
    ) {
      const IconComponent = icon;
      return <IconComponent className="w-8 h-8 text-slate-400" />;
    }
    return <Inbox className="w-8 h-8 text-slate-400" />;
  };

  return (
    <div
      className={`rounded-2xl glass-panel p-10 text-center flex flex-col items-center justify-center border border-slate-800/80 ${className}`.trim()}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mb-4 shadow-inner">
        {renderIcon()}
      </div>

      <h3 className="text-lg font-bold text-slate-100 mb-1.5 tracking-tight">{title}</h3>
      <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">{description}</p>

      {(effectivePrimaryAction || secondaryAction) && (
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
          {effectivePrimaryAction && (
            <Button
              variant="primary"
              size="sm"
              onClick={effectivePrimaryAction.onClick}
              leftIcon={effectivePrimaryAction.icon}
            >
              {effectivePrimaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
