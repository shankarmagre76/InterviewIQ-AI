import React from 'react';
import { Loader2 } from 'lucide-react';
import { NotificationCard } from './NotificationCard.jsx';
import { NotificationEmptyState } from './NotificationEmptyState.jsx';

/**
 * NotificationList Component (F9.4)
 * Reusable list container rendering candidate notification cards or loading/empty states.
 *
 * @param {Object} props
 * @param {Array<Object>} props.notifications - Notification documents array
 * @param {boolean} props.isLoading - Loading state flag
 * @param {Function} props.onMarkAsRead - Mark read handler
 * @param {Function} props.onDelete - Delete handler
 * @param {string} [props.activeTab='all'] - Filter tab name
 * @param {Function} [props.onRefresh] - Refresh callback
 */
export const NotificationList = ({
  notifications = [],
  isLoading = false,
  onMarkAsRead,
  onDelete,
  activeTab = 'all',
  onRefresh,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3.5 my-4">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-2xl bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-3 bg-slate-800 rounded w-1/6" />
              </div>
              <div className="h-3 bg-slate-800/80 rounded w-5/6" />
              <div className="h-3 bg-slate-800/60 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <NotificationEmptyState
        activeTab={activeTab}
        onRefresh={onRefresh}
      />
    );
  }

  return (
    <div className="space-y-3.5 my-4">
      {notifications.map((notif) => (
        <NotificationCard
          key={notif._id}
          notification={notif}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default NotificationList;
