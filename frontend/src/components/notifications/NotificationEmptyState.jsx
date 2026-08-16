import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BellCheck, Sparkles, RefreshCw } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState.jsx';

/**
 * NotificationEmptyState Component (F9.4, F9.6, & F9.10)
 * Reusable empty state display utilizing existing UI system EmptyState component.
 *
 * @param {Object} props
 * @param {'all' | 'unread' | string} [props.activeTab='all'] - Currently active filter tab
 * @param {string} [props.filterType=''] - Currently selected notification type filter
 * @param {Function} [props.onRefresh] - Refresh callback
 */
export const NotificationEmptyState = ({
  activeTab = 'all',
  filterType = '',
  onRefresh,
}) => {
  const navigate = useNavigate();
  const isUnreadTab = activeTab === 'unread';
  const filterLabel = filterType ? filterType.replace(/_/g, ' ') : '';

  return (
    <EmptyState
      icon={<BellCheck className="w-8 h-8 text-indigo-400" />}
      title="You're all caught up 🎉"
      description={
        isUnreadTab
          ? 'You have zero unread notifications. New alerts for ATS analysis, mock interview scores, and learning roadmaps will appear here.'
          : filterType
          ? `No notifications matching filter "${filterLabel}" were found in your inbox.`
          : 'Your candidate notification center is currently empty. Start mock interviews or analyze your resume to receive updates.'
      }
      primaryAction={{
        label: 'Explore Dashboard',
        icon: <Sparkles className="w-3.5 h-3.5" />,
        onClick: () => navigate('/dashboard'),
      }}
      secondaryAction={
        onRefresh
          ? {
              label: 'Refresh Inbox',
              icon: <RefreshCw className="w-3.5 h-3.5" />,
              onClick: onRefresh,
            }
          : undefined
      }
      className="my-4"
    />
  );
};

export default NotificationEmptyState;
