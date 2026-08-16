import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { notificationService } from '../../services/notificationService.js';

// Reasonable background polling interval (60 seconds)
const POLL_INTERVAL_MS = 60000;

/**
 * NotificationBell Component (F9.2 & F9.9)
 * Renders an accessible notification bell badge powered by a smart, non-aggressive update strategy:
 * - Fetch on initial authentication mount
 * - Immediate refresh on notification mutations (mark read, delete)
 * - Refresh when window regains focus
 * - 60s background polling only when page is visible (document.visibilityState === 'visible')
 * - Anti-overlapping request protection & clean timer teardown
 *
 * @param {Object} props
 * @param {boolean} [props.isOpen=false] - State of notification dropdown
 * @param {Function} [props.onClick] - Click handler to toggle notification dropdown
 * @param {string} [props.className=''] - Additional class names
 * @param {number} [props.externalCount=null] - Optional unread count override
 */
export const NotificationBell = ({
  isOpen = false,
  onClick,
  className = '',
  externalCount = null,
}) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Ref tracking active HTTP request to prevent overlapping concurrent calls
  const isFetchingRef = useRef(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    // Overlap prevention guard
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setHasError(false);

    try {
      const res = await notificationService.getUnreadCount();
      if (res?.success) {
        setUnreadCount(res.unreadCount ?? 0);
      } else {
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('[NotificationBell] Failed to retrieve unread notification count:', err);
      setHasError(true);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnreadCount();

    // 1. Mutation event listener (Mark read, mark all read, delete)
    const handleNotificationUpdate = () => {
      fetchUnreadCount();
    };

    // 2. Window focus listener (Refreshes count when user switches back to tab)
    const handleWindowFocus = () => {
      fetchUnreadCount();
    };

    // 3. Document visibility listener for background polling
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
      }
    };

    window.addEventListener('interviewiq:notifications:updated', handleNotificationUpdate);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Non-aggressive background polling timer (60 seconds)
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        fetchUnreadCount();
      }
    }, POLL_INTERVAL_MS);

    // 5. Timer & event listener cleanup
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('interviewiq:notifications:updated', handleNotificationUpdate);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchUnreadCount, isAuthenticated]);

  const displayCount = externalCount !== null ? externalCount : unreadCount;

  if (!isAuthenticated) return null;

  const accessibleLabel = isLoading
    ? 'Loading notifications'
    : hasError
    ? 'Notifications (count unavailable)'
    : displayCount > 0
    ? `Notifications, ${displayCount} unread`
    : 'Notifications, no unread notifications';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={accessibleLabel}
      aria-expanded={isOpen}
      aria-haspopup="true"
      title={accessibleLabel}
      className={`
        relative p-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900/80
        transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
        focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer group ${className}
      `.trim()}
    >
      <Bell className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />

      {/* Pulse loading indicator when count is being requested initially */}
      {isLoading && displayCount === 0 && (
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500/80 animate-ping" />
      )}

      {/* Unread Count Badge */}
      {!isLoading && displayCount > 0 && (
        <span
          className="
            absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] px-1.5 rounded-full
            bg-gradient-to-r from-rose-500 to-red-600 text-white text-[11px] font-bold
            flex items-center justify-center shadow-lg shadow-rose-500/30 border border-slate-950
            animate-in fade-in zoom-in-75 duration-200
          "
        >
          {displayCount > 99 ? '99+' : displayCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
