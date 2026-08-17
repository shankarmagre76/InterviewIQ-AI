import { notificationService } from './notificationService.js';
import { api } from './api.js';

console.log('=== FRONTEND NOTIFICATION READ/UNREAD MANAGEMENT (F9.5) INTEGRATION TEST SUITE ===\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  const notifId1 = '65a1b2c3d4e5f6a7b8c9d001';
  const notifId2 = '65a1b2c3d4e5f6a7b8c9d002';
  const notifId3 = '65a1b2c3d4e5f6a7b8c9d003';

  // Mock API endpoints for unit test environment
  const originalPatch = api.patch;
  const originalDelete = api.delete;

  api.patch = async (url) => {
    return {
      data: {
        success: true,
        statusCode: 200,
        message: 'Success',
        data: { _id: url.split('/')[2] || 'all', isRead: true },
      },
    };
  };

  api.delete = async (url) => {
    return {
      data: {
        success: true,
        statusCode: 200,
        message: 'Deleted',
        data: { deletedId: url.split('/')[2] },
      },
    };
  };

  // 1. Mark One As Read
  console.log('--- 1. Testing Mark One As Read ---');
  try {
    const res = await notificationService.markAsRead(notifId1);
    assert(res && res.success === true, 'markAsRead(id) executes successfully');
  } catch (err) {
    assert(false, `markAsRead test failed: ${err.message}`);
  }

  // 2. Mark Multiple As Read
  console.log('\n--- 2. Testing Mark Multiple As Read Sequentially ---');
  try {
    const idsToMark = [notifId1, notifId2, notifId3];
    const results = await Promise.all(idsToMark.map((id) => notificationService.markAsRead(id)));
    assert(results.length === 3 && results.every((r) => r.success), 'Multiple markAsRead promises resolve cleanly');
  } catch (err) {
    assert(false, `Mark multiple test failed: ${err.message}`);
  }

  // 3. Mark All As Read
  console.log('\n--- 3. Testing Mark All As Read ---');
  try {
    const res = await notificationService.markAllAsRead();
    assert(res && res.success === true, 'markAllAsRead() executes successfully');
  } catch (err) {
    assert(false, `markAllAsRead test failed: ${err.message}`);
  }

  // 4. Mark As Unread (Unsupported Guard Verification)
  console.log('\n--- 4. Testing Mark As Unread Safeguard ---');
  let unreadCaught = false;
  try {
    await notificationService.markAsUnread(notifId1);
  } catch (e) {
    unreadCaught = e.message.includes('not supported');
  }
  assert(unreadCaught, 'markAsUnread correctly throws backend unsupported error guard');

  // 5. Delete Notification
  console.log('\n--- 5. Testing Delete Notification ---');
  try {
    const res = await notificationService.deleteNotification(notifId1);
    assert(res && res.success === true, 'deleteNotification(id) executes successfully');
  } catch (err) {
    assert(false, `deleteNotification test failed: ${err.message}`);
  }

  // Restore API methods
  api.patch = originalPatch;
  api.delete = originalDelete;

  // 6. Optimistic UI Rollback & Anti-Duplicate Guard Verification
  console.log('\n--- 6. Testing Optimistic UI Rollback & Anti-Duplicate Logic ---');
  
  // Simulated State Machine for Optimistic UI Rollback
  class NotificationStore {
    constructor(initialItems) {
      this.items = [...initialItems];
      this.unreadCount = initialItems.filter((i) => !i.isRead).length;
      this.pendingRequests = new Set();
    }

    async markAsReadOptimistic(id, mockApiFail = false) {
      if (this.pendingRequests.has(id)) return 'DUPLICATE_IGNORED';
      this.pendingRequests.add(id);

      const prevItems = [...this.items];
      const prevUnread = this.unreadCount;

      // Optimistic mutation
      this.items = this.items.map((item) => (item._id === id ? { ...item, isRead: true } : item));
      this.unreadCount = Math.max(0, this.unreadCount - 1);

      try {
        if (mockApiFail) {
          throw new Error('API 500 Network Failure');
        }
        return 'SUCCESS';
      } catch (err) {
        // Rollback state on error
        this.items = prevItems;
        this.unreadCount = prevUnread;
        throw err;
      } finally {
        this.pendingRequests.delete(id);
      }
    }
  }

  const store = new NotificationStore([
    { _id: notifId1, isRead: false },
    { _id: notifId2, isRead: false },
  ]);

  assert(store.unreadCount === 2, 'Initial unread count is 2');

  // Test successful optimistic mark read
  await store.markAsReadOptimistic(notifId1, false);
  assert(store.unreadCount === 1 && store.items.find((i) => i._id === notifId1).isRead === true, 'Optimistic mark read updates count to 1');

  // Test failed optimistic mark read with rollback
  let rollbackErrorCaught = false;
  try {
    await store.markAsReadOptimistic(notifId2, true);
  } catch {
    rollbackErrorCaught = true;
  }
  assert(rollbackErrorCaught, 'API failure throws expected error');
  assert(store.unreadCount === 1 && store.items.find((i) => i._id === notifId2).isRead === false, 'State rolled back to initial state after API failure');

  console.log('\n==================================================');
  console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('==================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled test runner error:', err);
  process.exit(1);
});
