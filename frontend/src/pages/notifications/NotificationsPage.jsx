import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Inbox,
  ShieldAlert,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { NotificationList } from '../../components/notifications/index.js';
import { NOTIFICATION_TYPES } from '../../services/notificationService.js';
import { useNotifications } from '../../hooks/useNotifications.js';

export const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [selectedType, setSelectedType] = useState('');

  const {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setPage,
    setIsReadFilter,
    setType,
  } = useNotifications({
    initialPage: 1,
    initialLimit: 10,
    initialType: selectedType,
    initialIsRead: activeTab === 'unread' ? false : null,
  });

  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [actionError, setActionError] = useState(null);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setIsReadFilter(newTab === 'unread' ? false : null);
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setSelectedType(newType);
    setType(newType);
  };

  const handleMarkAsReadSingle = async (notifId) => {
    setActionError(null);
    try {
      await markAsRead(notifId);
    } catch (err) {
      setActionError('Failed to mark notification as read. Reverted change.');
    }
  };

  const handleMarkAll = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);
    setActionError(null);
    try {
      await markAllAsRead();
    } catch (err) {
      setActionError('Failed to mark all notifications as read.');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDelete = async (notifId) => {
    setActionError(null);
    try {
      await deleteNotification(notifId);
    } catch (err) {
      setActionError('Failed to delete notification. Reverted deletion.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Notification Center"
        description="Review AI evaluation feedback, ATS resume analysis alerts, and learning roadmap updates."
        action={
          unreadCount > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkAll}
              isLoading={isMarkingAll}
              className="flex items-center gap-2 text-xs cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-indigo-400" />
              <span>Mark all as read</span>
            </Button>
          ) : null
        }
      />

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="glass" className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Inbox Count</p>
            <h4 className="text-lg font-bold text-slate-100">{pagination.total || notifications.length}</h4>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Unread Notifications</p>
            <h4 className="text-lg font-bold text-rose-300">{unreadCount}</h4>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">High Priority Alerts</p>
            <h4 className="text-lg font-bold text-amber-300">
              {notifications.filter((n) => n.priority === 'HIGH' || n.priority === 'URGENT').length}
            </h4>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Filter Tabs: [ All ] [ Unread ] */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className={`
              px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2
              ${activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200'
              }
            `.trim()}
          >
            <span>All Notifications</span>
            <Badge variant={activeTab === 'all' ? 'primary' : 'neutral'} style="soft" size="sm">
              {pagination.total}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('unread')}
            className={`
              px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2
              ${activeTab === 'unread'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200'
              }
            `.trim()}
          >
            <span>Unread Only</span>
            {unreadCount > 0 && (
              <Badge variant="danger" style="soft" size="sm">
                {unreadCount}
              </Badge>
            )}
          </button>
        </div>

        {/* Type Filter & Refresh */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedType}
              onChange={handleTypeChange}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Types</option>
              {Object.keys(NOTIFICATION_TYPES).map((typeKey) => (
                <option key={typeKey} value={typeKey}>
                  {typeKey.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNotifications()}
            title="Refresh notifications"
            className="p-2 text-slate-400 hover:text-slate-100 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Error Banners */}
      {(error || actionError) && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="flex-1">{error || actionError}</p>
          <Button variant="ghost" size="sm" onClick={() => fetchNotifications()} className="text-xs text-rose-300 hover:underline">
            Retry
          </Button>
        </div>
      )}

      {/* Notifications List Component */}
      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        onMarkAsRead={handleMarkAsReadSingle}
        onDelete={handleDelete}
        activeTab={activeTab}
        onRefresh={() => fetchNotifications()}
      />

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Showing Page <span className="font-semibold text-slate-200">{pagination.page}</span> of{' '}
            <span className="font-semibold text-slate-200">{pagination.totalPages}</span> ({pagination.total} items)
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => setPage(pagination.page - 1)}
              className="flex items-center gap-1 text-xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pagination.totalPages || isLoading}
              onClick={() => setPage(pagination.page + 1)}
              className="flex items-center gap-1 text-xs cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
