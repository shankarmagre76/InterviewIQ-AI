import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Video,
  Briefcase,
  Compass,
  AlertCircle,
  Activity,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

/**
 * Format timestamps into consistent, human-readable relative/localized strings.
 */
const formatActivityDate = (rawDate) => {
  if (!rawDate) return 'Recently';

  try {
    const date = new Date(rawDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Recently';
  }
};

/**
 * Maps activity type to icon, theme color, and navigation path
 */
const getActivityConfig = (activityType, metadata = {}) => {
  const type = String(activityType || '').toUpperCase();

  if (type.includes('RESUME')) {
    return {
      icon: FileText,
      color: 'indigo',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      actionLabel: 'View ATS',
      path: '/resumes',
    };
  }

  if (type.includes('INTERVIEW')) {
    return {
      icon: Video,
      color: 'cyan',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      actionLabel: 'View Session',
      path: '/interviews',
    };
  }

  if (type.includes('APPLICATION') || type.includes('JOB')) {
    return {
      icon: Briefcase,
      color: 'emerald',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      actionLabel: 'View Application',
      path: '/applications',
    };
  }

  if (type.includes('ROADMAP') || type.includes('TASK')) {
    return {
      icon: Compass,
      color: 'amber',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      actionLabel: 'View Roadmap',
      path: '/roadmap',
    };
  }

  if (type.includes('SKILL') || type.includes('GAP')) {
    return {
      icon: AlertCircle,
      color: 'rose',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      actionLabel: 'Fix Skill Gap',
      path: '/profile',
    };
  }

  return {
    icon: Activity,
    color: 'purple',
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    actionLabel: 'View Details',
    path: '/dashboard',
  };
};

/**
 * ActivityItem Component
 * Renders individual candidate activity stream event card with icon, title, date, and navigation action.
 */
export const ActivityItem = ({ activity = {}, compact = false }) => {
  const navigate = useNavigate();

  const title = activity.title || activity.action || 'Candidate Activity Event';
  const dateStr = formatActivityDate(activity.date || activity.createdAt || activity.timestamp);
  const metadata = activity.metadata || {};
  const config = getActivityConfig(activity.activityType || activity.type, metadata);
  const Icon = config.icon;

  const atsScore = metadata.atsScore || activity.score;
  const status = metadata.status || activity.status;

  return (
    <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors text-left group">
      <div className="flex items-start gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 shadow-inner ${config.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs font-semibold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
              {title}
            </h4>

            {atsScore !== undefined && (
              <Badge variant="success" size="sm">
                ATS {atsScore}%
              </Badge>
            )}

            {status && (
              <Badge variant="neutral" size="sm">
                {status}
              </Badge>
            )}
          </div>

          <p className="text-[11px] text-slate-400 truncate">
            {activity.description || activity.details || `${dateStr}`}
          </p>
        </div>
      </div>

      {!compact && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(config.path)}
          className="shrink-0 text-slate-400 hover:text-white text-xs px-2 py-1"
          aria-label={`${config.actionLabel} for ${title}`}
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
};

export default ActivityItem;
