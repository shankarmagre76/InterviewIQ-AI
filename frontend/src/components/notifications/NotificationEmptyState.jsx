import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BellCheck, Bell, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

/**
 * NotificationEmptyState Component (F9.4)
 * Reusable empty state display for notification feeds.
 *
 * @param {Object} props
 * @param {'all' | 'unread' | string} [props.activeTab='all'] - Currently active filter tab
 * @param {Function} [props.onRefresh] - Refresh callback
 */
export const NotificationEmptyState = ({
  activeTab = 'all',
  onRefresh,
}) => {
  const navigate = useNavigate();

  const isUnreadTab = activeTab === 'unread';

  return (
    <div className="p-8 sm:p-12 rounded-2xl glass-panel border border-slate-800 bg-slate-950/60 text-center flex flex-col items-center justify-center space-y-4 my-4">
      <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-inner">
        {isUnreadTab ? (
          <BellCheck className="w-8 h-8 text-indigo-400" />
        ) : (
          <Bell className="w-8 h-8 text-slate-400" />
        )}
      </div>

      <div className="max-w-md space-y-1.5">
        <h3 className="text-base font-bold text-slate-100">
          {isUnreadTab ? "You're All Caught Up!" : 'No Notifications Yet'}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {isUnreadTab
            ? 'You have zero unread notifications. New alerts for ATS analysis, mock interview scores, and learning roadmaps will appear here.'
            : 'Your notification center is currently empty. Start mock interviews or analyze your resume to receive AI feedback updates.'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {onRefresh && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Inbox</span>
          </Button>
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explore Dashboard</span>
        </Button>
      </div>
    </div>
  );
};

export default NotificationEmptyState;
