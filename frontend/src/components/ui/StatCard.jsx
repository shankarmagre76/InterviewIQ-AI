import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';

export const StatCard = ({
  title,
  value,
  subtext,
  icon,
  trend,
  trendLabel,
  variant = 'glass',
  className = '',
}) => {
  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <Card variant={variant} className={className}>
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div className="space-y-1 overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</h3>
            {trend !== undefined && (
              <Badge
                variant={isPositive ? 'success' : isNegative ? 'danger' : 'neutral'}
                style="soft"
                size="sm"
                icon={isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : null}
              >
                {isPositive ? `+${trend}%` : `${trend}%`}
              </Badge>
            )}
          </div>
          {(subtext || trendLabel) && (
            <p className="text-[11px] text-slate-400 truncate">{subtext || trendLabel}</p>
          )}
        </div>

        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-inner">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
