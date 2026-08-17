import React from 'react';
import { NotificationCard } from './NotificationCard.jsx';
import { NotificationEmptyState } from './NotificationEmptyState.jsx';
import { ErrorState } from '../ui/ErrorState.jsx';

/**
 * NotificationList Component (F9.4 & F9.10)
 * Reusable list container rendering candidate notification cards or ErrorState / EmptyState / Skeleton states.
 *
 * @param {Object} props
 * @param {Array<Object>} props.notifications - Notification documents array
 * @param {boolean} props.isLoading - Loading state flag
 * @param {string|null} [props.error=null] - Error message
 * @param {Function} props.onMarkAsRead - Mark read handler
 * @param {Function} props.onDelete - Delete handler
 * @param {string} [props.activeTab='all'] - Filter tab name
 * @param {string} [props.filterType=''] - Filter type string
 * @param {Function} [props.onRefresh] - Refresh callback
 */
export const NotificationList = ({
  notifications = [],
  isLoading = false,
  error = null,
  onMarkAsRead,
  onDelete,
  activeTab = 'all',
  filterType = '',
  onRefresh,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3.5 my-4 min-h-[320px]">
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

  if (error) {
    return (
      <ErrorState
        title="Couldn't load your notifications."
        message="An issue occurred while retrieving your notifications. Please check your connection and try again."
        onRetry={onRefresh}
        className="my-4"
      />
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <NotificationEmptyState
        activeTab={activeTab}
        filterType={filterType}
        onRefresh={onRefresh}
      />
    );
  }

  return (
    <div className="space-y-3.5 my-4 min-h-[200px]">
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
