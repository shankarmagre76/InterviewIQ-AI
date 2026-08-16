import React from 'react';
import { Card, CardContent } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';

/**
 * StatCard Component (F10.3)
 * Glassmorphic KPI metric display card for administrative dashboard metrics.
 *
 * @param {Object} props
 * @param {string} props.title - Card metric title
 * @param {string|number} props.value - Metric primary value
 * @param {React.ReactNode} props.icon - Lucide icon node
 * @param {string} [props.subtitle] - Secondary caption
 * @param {string} [props.badge] - Badge text
 * @param {'primary'|'success'|'warning'|'danger'|'neutral'} [props.variant='primary'] - Color theme
 * @param {boolean} [props.isLoading=false] - Skeleton loader state
 */
export const StatCard = ({
  title,
  value,
  icon,
  subtitle,
  badge,
  variant = 'primary',
  isLoading = false,
}) => {
  const getIconStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'danger':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'neutral':
        return 'bg-slate-800/80 text-slate-300 border-slate-700/80';
      case 'primary':
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
  };

  if (isLoading) {
    return (
      <Card variant="glass" className="p-5 animate-pulse">
        <CardContent className="p-0 flex items-center justify-between">
          <div className="space-y-2 flex-1 pr-4">
            <div className="h-3 bg-slate-800 rounded w-2/3" />
            <div className="h-6 bg-slate-800 rounded w-1/2" />
            <div className="h-2.5 bg-slate-800/60 rounded w-1/3" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-800 shrink-0" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="p-5 hover:border-slate-700/80 transition-all duration-200 shadow-lg">
      <CardContent className="p-0 flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-slate-400 truncate">{title}</p>
            {badge && (
              <Badge variant={variant} style="soft" size="sm" className="text-[10px] py-0 px-1.5">
                {badge}
              </Badge>
            )}
          </div>

          <h3 className="text-2xl font-extrabold text-white tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value ?? '0'}
          </h3>

          {subtitle && (
            <p className="text-[11px] text-slate-500 truncate leading-tight pt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-md ${getIconStyles()}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
