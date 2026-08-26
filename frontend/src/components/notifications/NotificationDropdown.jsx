import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Check,
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
  X,
} from 'lucide-react';
import { notificationService } from '../../services/notificationService.js';
import { Badge } from '../ui/Badge.jsx';

/**
 * Returns icon element based on notification type
 */
const getNotificationIcon = (type) => {
  switch (type) {
    case 'ROADMAP_UPDATE':
      return <Sparkles className="w-4 h-4 text-indigo-400" />;
    case 'ROADMAP_MILESTONE':
      return <Trophy className="w-4 h-4 text-amber-400" />;
    case 'LEARNING_TASK':
      return <BookOpen className="w-4 h-4 text-cyan-400" />;
    case 'INTERVIEW_RESULT':
    case 'INTERVIEW_REMINDER':
      return <Video className="w-4 h-4 text-purple-400" />;
    case 'RESUME_ANALYSIS':
    case 'RESUME_IMPROVEMENT':
      return <FileText className="w-4 h-4 text-emerald-400" />;
    case 'APPLICATION_STATUS':
      return <Briefcase className="w-4 h-4 text-blue-400" />;
    case 'APPLICATION_DEADLINE':
      return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    case 'SKILL_GAP':
      return <Target className="w-4 h-4 text-orange-400" />;
    case 'SYSTEM':
    default:
      return <Bell className="w-4 h-4 text-slate-400" />;
  }
};

/**
 * Priority Badge Variant Mapping
 */
const getPriorityBadgeVariant = (priority) => {
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
 * Relative time formatter for notifications
 */
export const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 45) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Resolves target route for a notification based on backend polymorphic relationship
 * (relatedEntity and relatedEntityId) and notification type.
 *
 * @param {Object} notif - Notification document
 * @returns {string|null} Target URL path string or null if no navigation should occur
 */
export const resolveNotificationRoute = (notif) => {
  if (!notif) return null;

  const { relatedEntity, relatedEntityId, type } = notif;

  // 1. Resume / ATS Analysis
  if (
    relatedEntity === 'ResumeAnalysis' ||
    type === 'RESUME_ANALYSIS'
  ) {
    return '/resume/analysis';
  }
  if (relatedEntity === 'Resume' || type === 'RESUME_IMPROVEMENT') {
    return '/resume';
  }

  // 2. Mock Interview
  if (
    relatedEntity === 'Interview' ||
    type === 'INTERVIEW_RESULT' ||
    type === 'INTERVIEW_REMINDER'
  ) {
    return relatedEntityId ? `/interviews/${relatedEntityId}/result` : '/interviews';
  }

  // 3. Job Application
  if (
    relatedEntity === 'Application' ||
    type === 'APPLICATION_STATUS' ||
    type === 'APPLICATION_DEADLINE'
  ) {
    return relatedEntityId ? `/applications/${relatedEntityId}` : '/applications';
  }

  // 4. Job Posting
  if (relatedEntity === 'Job') {
    return relatedEntityId ? `/jobs/${relatedEntityId}` : '/jobs';
  }

  // 5. Learning Roadmap & Tasks
  if (
    relatedEntity === 'LearningRoadmap' ||
    type === 'ROADMAP_UPDATE' ||
    type === 'ROADMAP_MILESTONE'
  ) {
    return relatedEntityId ? `/roadmap/${relatedEntityId}` : '/roadmap';
  }
  if (relatedEntity === 'LearningTask' || type === 'LEARNING_TASK') {
    return '/roadmap';
  }

  // 6. System Events or no related resource
  if (relatedEntity === 'System' || type === 'SYSTEM' || !relatedEntity) {
    return null; // Do not attempt navigation for pure system alerts
  }

  return null;
};

export const getNotificationLink = resolveNotificationRoute;

/**
 * NotificationDropdown Component (F9.3 & F9.7)
 * Displays compact recent notifications inbox opened from Notification Bell.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Dropdown visibility state
 * @param {Function} props.onClose - Callback to close dropdown
 * @param {string} [props.align='right'] - Alignment ('right' or 'left')
 */
export const NotificationDropdown = ({
  isOpen,
  onClose,
  align = 'right',
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [error, setError] = useState(null);

  // Fetch top 5 recent notifications
  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await notificationService.getNotifications({ page: 1, limit: 5 });
      if (res?.success && res?.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('[NotificationDropdown] Error fetching notifications:', err);
      setError('Unable to load recent notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Outside click & Escape key listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Mark single notification as read
  const handleMarkAsRead = async (e, notifId) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      window.dispatchEvent(new CustomEvent('interviewiq:notifications:updated'));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Bulk mark all unread as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent('interviewiq:notifications:updated'));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Item click action handler (F9.7)
  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif._id);
        window.dispatchEvent(new CustomEvent('interviewiq:notifications:updated'));
      } catch (err) {
        console.error('Error marking as read on item click:', err);
      }
    }
    onClose();

    // Resolve route and navigate if related resource exists
    const targetRoute = resolveNotificationRoute(notif);
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  if (!isOpen) return null;

  const alignClass = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div
      ref={dropdownRef}
      role="dialog"
      aria-label="Notifications inbox dropdown"
      tabIndex={-1}
      className={`
        absolute ${alignClass} mt-2 w-[calc(100vw-2rem)] max-w-[380px] sm:w-96 rounded-2xl glass-panel shadow-2xl
        shadow-black/80 border border-slate-800 bg-slate-950/95 backdrop-blur-xl z-50
        overflow-hidden flex flex-col transition-all animate-in fade-in zoom-in-95 duration-150
      `.trim()}
    >
      {/* Dropdown Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                {unreadCount} new
              </span>
            )}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              title="Mark all as read"
              aria-label="Mark all notifications as read"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 transition-colors text-xs flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {isMarkingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span className="text-[11px] font-medium hidden sm:inline">Mark read</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notification menu"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications Body List */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <p className="text-xs">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-400 text-xs">
            <p>{error}</p>
            <button
              type="button"
              onClick={fetchNotifications}
              className="mt-2 text-indigo-400 hover:underline font-semibold cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
              <Bell className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">All caught up!</p>
              <p className="text-[11px] text-slate-500 mt-0.5">No notifications available right now.</p>
            </div>
          </div>
        ) : (
          notifications.map((notif) => {
            const isUnread = !notif.isRead;
            const icon = getNotificationIcon(notif.type);
            const targetRoute = resolveNotificationRoute(notif);

            return (
              <div
                key={notif._id}
                onClick={() => handleItemClick(notif)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleItemClick(notif);
                  }
                }}
                className={`
                  group p-3.5 transition-all cursor-pointer flex items-start gap-3 relative
                  ${isUnread
                    ? 'bg-indigo-950/20 hover:bg-indigo-900/30'
                    : 'hover:bg-slate-900/60 opacity-90'
                  }
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                `.trim()}
              >
                {/* Unread indicator dot */}
                {isUnread && (
                  <span className="absolute left-1.5 top-4 w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500" />
                )}

                {/* Icon Container */}
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  {icon}
                </div>

                {/* Notification Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className={`text-xs leading-tight ${isUnread ? 'text-slate-100 font-bold' : 'text-slate-300 font-semibold'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap shrink-0">
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug mt-1 line-clamp-2">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getPriorityBadgeVariant(notif.priority)} style="soft" size="sm" className="text-[9px] px-1.5 py-0">
                      {notif.priority}
                    </Badge>

                    {targetRoute && (
                      <span className="text-[10px] text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1 font-medium ml-auto">
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button: Mark single as read */}
                {isUnread && (
                  <button
                    type="button"
                    onClick={(e) => handleMarkAsRead(e, notif._id)}
                    title="Mark as read"
                    aria-label="Mark notification as read"
                    className="absolute top-3.5 right-3 p-1 rounded-md text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer focus-visible:opacity-100"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Dropdown Footer */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-900/80 text-center">
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/notifications');
          }}
          className="w-full py-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span>View all notifications</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
