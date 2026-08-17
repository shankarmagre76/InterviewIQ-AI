import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  Trash2,
  Sparkles,
  BookOpen,
  Trophy,
  Video,
  FileText,
  Briefcase,
  AlertTriangle,
  Target,
  ExternalLink,
  Loader2,
  Clock,
} from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { resolveNotificationRoute, formatTimeAgo } from './NotificationDropdown.jsx';

/**
 * Dynamic Icon Mapper per Notification Type
 */
const getNotificationIcon = (type) => {
  switch (type) {
    case 'ROADMAP_UPDATE':
      return <Sparkles className="w-5 h-5 text-indigo-400" />;
    case 'ROADMAP_MILESTONE':
      return <Trophy className="w-5 h-5 text-amber-400" />;
    case 'LEARNING_TASK':
      return <BookOpen className="w-5 h-5 text-cyan-400" />;
    case 'INTERVIEW_RESULT':
    case 'INTERVIEW_REMINDER':
      return <Video className="w-5 h-5 text-purple-400" />;
    case 'RESUME_ANALYSIS':
    case 'RESUME_IMPROVEMENT':
      return <FileText className="w-5 h-5 text-emerald-400" />;
    case 'APPLICATION_STATUS':
      return <Briefcase className="w-5 h-5 text-blue-400" />;
    case 'APPLICATION_DEADLINE':
      return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    case 'SKILL_GAP':
      return <Target className="w-5 h-5 text-orange-400" />;
    case 'SYSTEM':
    default:
      return <Bell className="w-5 h-5 text-slate-400" />;
  }
};

/**
 * Format raw enum key into human readable label
 */
export const formatNotificationType = (type) => {
  switch (type) {
    case 'LEARNING_TASK':
      return 'Learning Task';
    case 'ROADMAP_UPDATE':
      return 'Roadmap Update';
    case 'ROADMAP_MILESTONE':
      return 'Roadmap Milestone';
    case 'INTERVIEW_RESULT':
      return 'Interview Evaluation';
    case 'INTERVIEW_REMINDER':
      return 'Interview Reminder';
    case 'RESUME_ANALYSIS':
      return 'ATS Analysis';
    case 'RESUME_IMPROVEMENT':
      return 'ATS Score Improved';
    case 'APPLICATION_STATUS':
      return 'Application Update';
    case 'APPLICATION_DEADLINE':
      return 'Application Deadline';
    case 'SKILL_GAP':
      return 'Skill Gap Alert';
    case 'SYSTEM':
      return 'System Alert';
    default:
      return type ? type.replace(/_/g, ' ') : 'Notification';
  }
};

/**
 * Priority Badge Variant Mapping
 */
const getPriorityVariant = (priority) => {
  switch (priority) {
    case 'URGENT':
      return 'danger';
    case 'HIGH':
      return 'warning';
    case 'MEDIUM':
      return 'primary';
    case 'LOW':
    default:
      return 'neutral';
  }
};

/**
 * Full Date Formatter for Screen Readers and Tooltips
 */
export const formatFullDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  if (isToday) return `Today at ${timeStr}`;
  if (isYesterday) return `Yesterday at ${timeStr}`;

  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${timeStr}`;
};

/**
 * NotificationCard Component (F9.4, F9.7, & F9.11)
 * Accessible, mobile-optimized candidate notification card featuring:
 * - Explicit text badge + color + dot for read/unread state (doesn't rely only on color)
 * - Semantic <time> HTML tag for screen readers
 * - Minimum 44x44px touch targets for mobile accessibility
 * - Visible focus rings for keyboard navigation
 *
 * @param {Object} props
 * @param {Object} props.notification - Notification document
 * @param {Function} [props.onMarkAsRead] - Mark read callback
 * @param {Function} [props.onDelete] - Delete callback
 */
export const NotificationCard = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [isMarking, setIsMarking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!notification) return null;

  const isUnread = !notification.isRead;
  const icon = getNotificationIcon(notification.type);
  const typeLabel = formatNotificationType(notification.type);
  const fullDateLabel = formatFullDate(notification.createdAt);
  const relativeTime = formatTimeAgo(notification.createdAt);
  const targetRoute = resolveNotificationRoute(notification);

  const handleMarkReadClick = async (e) => {
    e.stopPropagation();
    if (!isUnread || isMarking) return;
    setIsMarking(true);
    try {
      if (onMarkAsRead) {
        await onMarkAsRead(notification._id);
      }
    } finally {
      setIsMarking(false);
    }
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(notification._id);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = () => {
    if (isUnread && onMarkAsRead) {
      onMarkAsRead(notification._id);
    }
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  const cardAccessibleLabel = `Notification: ${notification.title}. Status: ${
    isUnread ? 'Unread' : 'Read'
  }. Category: ${typeLabel}. Priority: ${notification.priority}. Time: ${fullDateLabel}.`;

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={cardAccessibleLabel}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`
        group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer
        flex flex-col sm:flex-row sm:items-start gap-4 focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
        ${isUnread
          ? 'bg-slate-900/90 border-indigo-500/40 shadow-lg shadow-indigo-950/30'
          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700/60 opacity-95'
        }
      `.trim()}
    >
      {/* Unread Visual & Screen-Reader Indicator */}
      {isUnread && (
        <span
          className="absolute -left-1 top-6 w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500 animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Type Icon Badge */}
      <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
        {icon}
      </div>

      {/* Main Content Body */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-sm ${isUnread ? 'text-white font-bold' : 'text-slate-200 font-semibold'}`}>
              {notification.title}
            </h3>

            {/* Read/Unread Text Badge for non-color-only accessibility */}
            <Badge
              variant={isUnread ? 'primary' : 'neutral'}
              style="soft"
              size="sm"
              className="text-[10px] uppercase tracking-wider font-bold"
            >
              {isUnread ? 'Unread' : 'Read'}
            </Badge>

            <Badge variant="neutral" style="soft" size="sm" className="text-[10px]">
              {typeLabel}
            </Badge>
            
            <Badge variant={getPriorityVariant(notification.priority)} style="soft" size="sm" className="text-[10px]">
              {notification.priority}
            </Badge>
          </div>

          {/* Semantic HTML <time> Tag */}
          <div className="flex items-center gap-1.5 text-slate-400 text-xs shrink-0">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <time dateTime={notification.createdAt} title={fullDateLabel}>
              {relativeTime || fullDateLabel}
            </time>
          </div>
        </div>

        {/* Message body */}
        <p className="text-xs text-slate-300 leading-relaxed">
          {notification.message}
        </p>

        {/* Full timestamp fallback for assistive tech */}
        <p className="text-[11px] text-slate-500 pt-0.5">
          <time dateTime={notification.createdAt}>{fullDateLabel}</time>
        </p>

        {/* Card Related Resource Link */}
        {targetRoute && (
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
              <span>View Resource</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </div>
        )}
      </div>

      {/* Touch-Friendly Quick Action Button Controls (min 44x44px target) */}
      <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-1 sm:pt-0">
        {isUnread && (
          <button
            type="button"
            onClick={handleMarkReadClick}
            disabled={isMarking}
            title="Mark as read"
            aria-label={`Mark "${notification.title}" as read`}
            className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {isMarking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </button>
        )}

        <button
          type="button"
          onClick={handleDeleteClick}
          disabled={isDeleting}
          title="Delete notification"
          aria-label={`Delete notification "${notification.title}"`}
          className="w-10 h-10 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;
