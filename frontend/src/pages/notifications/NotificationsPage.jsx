import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  FileText,
  Video,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { NotificationList } from '../../components/notifications/index.js';
import { NOTIFICATION_TYPES } from '../../services/notificationService.js';
import { useNotifications } from '../../hooks/useNotifications.js';

/**
 * Filter Categories mapped to supported backend notification query types
 */
export const NOTIFICATION_CATEGORIES = [
  { id: 'all', label: 'All', icon: Inbox, type: '' },
  { id: 'unread', label: 'Unread', icon: Bell, type: '' },
  { id: 'resume', label: 'Resume', icon: FileText, type: 'RESUME_ANALYSIS' },
  { id: 'interview', label: 'Interview', icon: Video, type: 'INTERVIEW_RESULT' },
  { id: 'applications', label: 'Applications', icon: Briefcase, type: 'APPLICATION_STATUS' },
  { id: 'learning', label: 'Learning', icon: Sparkles, type: 'ROADMAP_UPDATE' },
  { id: 'system', label: 'System', icon: ShieldAlert, type: 'SYSTEM' },
];

export const NotificationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query parameters to preserve filter state on refresh / deep link
  const categoryParam = searchParams.get('category') || 'all';
  const typeParam = searchParams.get('type') || '';
  const isReadParam = categoryParam === 'unread' ? false : null;

  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [selectedType, setSelectedType] = useState(typeParam);

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
    initialIsRead: isReadParam,
  });

  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Sync state when URL search params change
  useEffect(() => {
    const urlCategory = searchParams.get('category') || 'all';
    const urlType = searchParams.get('type') || '';

    setActiveCategory(urlCategory);
    setSelectedType(urlType);

    const isReadVal = urlCategory === 'unread' ? false : null;

    fetchNotifications({
      page: 1,
      type: urlType,
      isRead: isReadVal,
    });
  }, [searchParams, fetchNotifications]);

  // Category Tab Click Handler (updates URL params)
  const handleCategoryClick = (cat) => {
    setActiveCategory(cat.id);
    const newType = cat.type || '';
    setSelectedType(newType);

    const newParams = {};
    if (cat.id !== 'all') newParams.category = cat.id;
    if (newType) newParams.type = newType;

    setSearchParams(newParams);
  };

  // Specific Type Select Dropdown Change Handler
  const handleTypeSelect = (e) => {
    const typeVal = e.target.value;
    setSelectedType(typeVal);

    const newParams = {};
    if (activeCategory !== 'all') newParams.category = activeCategory;
    if (typeVal) newParams.type = typeVal;

    setSearchParams(newParams);
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
        description="Filter and manage your candidate notifications across resume analysis, mock interviews, applications, and learning roadmaps."
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
            <p className="text-xs text-slate-400 font-medium">Filtered Results Count</p>
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

      {/* Category Pills Filter Bar (F9.6 Server-Side Filtering) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {NOTIFICATION_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`
                px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border
                ${isActive
                  ? 'bg-indigo-600/90 text-white border-indigo-500 shadow-md shadow-indigo-500/20 font-bold'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-900/80 hover:text-slate-200'
                }
              `.trim()}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{cat.label}</span>
              {cat.id === 'unread' && unreadCount > 0 && (
                <Badge variant="danger" style="soft" size="sm" className="px-1.5 py-0 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Control Toolbar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Specific Backend Enum Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Filter by Backend Enum:</span>
          <select
            value={selectedType}
            onChange={handleTypeSelect}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer flex-1 sm:flex-initial"
          >
            <option value="">All Enum Types</option>
            {Object.keys(NOTIFICATION_TYPES).map((typeKey) => (
              <option key={typeKey} value={typeKey}>
                {typeKey.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNotifications()}
            title="Refresh notifications"
            className="p-2 text-slate-400 hover:text-slate-100 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-xs">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Action Error Banner if single mutation fails */}
      {actionError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="flex-1">{actionError}</p>
          <Button variant="ghost" size="sm" onClick={() => fetchNotifications()} className="text-xs text-rose-300 hover:underline">
            Retry
          </Button>
        </div>
      )}

      {/* Notifications List Component */}
      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        error={error ? "Couldn't load your notifications." : null}
        onMarkAsRead={handleMarkAsReadSingle}
        onDelete={handleDelete}
        activeTab={activeCategory}
        filterType={selectedType}
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
