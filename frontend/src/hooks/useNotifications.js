import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '../services/notificationService.js';

/**
 * useNotifications Hook (F9.5)
 * Centralized state management for candidate notifications supporting optimistic updates,
 * automatic rollback on API failure, anti-duplicate request guards, and live event syncing.
 *
 * @param {Object} [options]
 * @param {number} [options.initialPage=1]
 * @param {number} [options.initialLimit=10]
 * @param {string} [options.initialType='']
 * @param {boolean|null} [options.initialIsRead=null]
 * @param {boolean} [options.autoFetch=true]
 */
export const useNotifications = (options = {}) => {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialType = '',
    initialIsRead = null,
    autoFetch = true,
  } = options;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    total: 0,
    page: initialPage,
    limit: initialLimit,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set of notification IDs currently undergoing API mutation to prevent duplicate requests
  const pendingRequestsRef = useRef(new Set());

  // Current query parameters ref for refetching
  const paramsRef = useRef({
    page: initialPage,
    limit: initialLimit,
    type: initialType,
    isRead: initialIsRead,
  });

  /**
   * Fetch notifications from backend
   */
  const fetchNotifications = useCallback(async (overrideParams = {}) => {
    setIsLoading(true);
    setError(null);

    const queryParams = {
      ...paramsRef.current,
      ...overrideParams,
    };
    paramsRef.current = queryParams;

    try {
      const res = await notificationService.getNotifications(queryParams);
      if (res?.success && res?.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount ?? 0);
        setPagination(
          res.data.pagination || {
            total: (res.data.notifications || []).length,
            page: queryParams.page,
            limit: queryParams.limit,
            totalPages: 1,
          }
        );
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('[useNotifications] Fetch error:', err);
      setError(
        err.response?.data?.message || 'Failed to load notifications. Please try again.'
      );
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
    }
  }, [autoFetch, fetchNotifications]);

  // Listen for global notification update events to keep hook state synchronized
  useEffect(() => {
    const handleGlobalUpdate = () => {
      fetchNotifications();
    };

    window.addEventListener('interviewiq:notifications:updated', handleGlobalUpdate);
    return () => {
      window.removeEventListener('interviewiq:notifications:updated', handleGlobalUpdate);
    };
  }, [fetchNotifications]);

  /**
   * 1. Mark single notification as read with Optimistic UI Update & Rollback
   *
   * @param {string} id - Notification MongoId
   */
  const markAsRead = useCallback(
    async (id) => {
      if (!id) return;

      // Prevent duplicate concurrent requests for the same ID
      if (pendingRequestsRef.current.has(id)) {
        return;
      }

      pendingRequestsRef.current.add(id);

      // Snapshot previous state for rollback
      let targetWasUnread = false;
      let prevNotifications = [];
      let prevUnreadCount = 0;

      setNotifications((prev) => {
        prevNotifications = [...prev];
        const target = prev.find((n) => n._id === id);
        if (target && !target.isRead) {
          targetWasUnread = true;
        }
        return prev.map((n) =>
          n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        );
      });

      if (targetWasUnread) {
        setUnreadCount((prev) => {
          prevUnreadCount = prev;
          return Math.max(0, prev - 1);
        });
      }

      // Notify global bell count listeners of optimistic update
      window.dispatchEvent(new CustomEvent('interviewiq:notifications:updated'));

      try {
        await notificationService.markAsRead(id);
      } catch (err) {
        console.error(`[useNotifications] Mark as read failed for ${id}, rolling back:`, err);
        // Rollback state on mutation failure
        setNotifications(prevNotifications);
        if (targetWasUnread) {
          setUnreadCount(prevUnreadCount);
        }
        window.dispatchEvent(new CustomEvent('interviewiq:notifications:updated'));
        throw err;
      } finally {
        pendingRequestsRef.current.delete(id);
      }
    },
    []
  );

  /**
   * 2. Bulk mark all unread notifications as read with Optimistic UI Update & Rollback
   */
  const markAllAsRead = useCallback(async () => {
    if (pendingRequestsRef.current.has('MARK_ALL')) return;
    pendingRequestsRef.current.add('MARK_ALL');

    const prevNotifications = [...notifications];
    const prevUnreadCount = unreadCount;

    // Optimistic Update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
    setUnreadCount(0);
    window.dispatchEvent(new CustomEvent('interviewiq:notifications:updated'));

    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error('[useNotifications] Mark all as read failed, rolling back:', err);
      // Rollback
      setNotifications(prevNotifications);
      setUnreadCount(prevUnreadCount);
      window.dispatchEvent(new CustomEvent('interviewiq:notifications:updated'));
      throw err;
    } finally {
      pendingRequestsRef.current.delete('MARK_ALL');
    }
  }, [notifications, unreadCount]);

  /**
   * 3. Delete notification with Optimistic UI Update & Rollback
   *
   * @param {string} id - Notification MongoId
   */
  const deleteNotification = useCallback(
    async (id) => {
      if (!id) return;
      if (pendingRequestsRef.current.has(id)) return;

      pendingRequestsRef.current.add(id);

      let targetWasUnread = false;
      const prevNotifications = [...notifications];
      const prevUnreadCount = unreadCount;
      const prevTotal = pagination.total;

      // Optimistic Delete
      setNotifications((prev) => {
        const target = prev.find((n) => n._id === id);
        if (target && !target.isRead) {
          targetWasUnread = true;
        }
        return prev.filter((n) => n._id !== id);
      });

      if (targetWasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      window.dispatchEvent(new CustomEvent('interviewiq:notifications:updated'));

      try {
        await notificationService.deleteNotification(id);
      } catch (err) {
        console.error(`[useNotifications] Delete failed for ${id}, rolling back:`, err);
        // Rollback
        setNotifications(prevNotifications);
        setUnreadCount(prevUnreadCount);
        setPagination((prev) => ({ ...prev, total: prevTotal }));
        window.dispatchEvent(new CustomEvent('interviewiq:notifications:updated'));
        throw err;
      } finally {
        pendingRequestsRef.current.delete(id);
      }
    },
    [notifications, unreadCount, pagination.total]
  );

  /**
   * 4. Mark unread safeguard stub
   */
  const markAsUnread = useCallback(async () => {
    return await notificationService.markAsUnread();
  }, []);

  return {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    markAsUnread,
    setPage: (newPage) => fetchNotifications({ page: newPage }),
    setLimit: (newLimit) => fetchNotifications({ page: 1, limit: newLimit }),
    setType: (newType) => fetchNotifications({ page: 1, type: newType }),
    setIsReadFilter: (isReadVal) => fetchNotifications({ page: 1, isRead: isReadVal }),
  };
};

export default useNotifications;
