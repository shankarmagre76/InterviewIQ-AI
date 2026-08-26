import { notificationService, NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from './notificationService.js';
import { api } from './api.js';

console.log('=== FRONTEND NOTIFICATION SERVICE API INTEGRATION TEST SUITE ===\n');

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
  const mockNotificationId = '65a1b2c3d4e5f6a7b8c9d0e1';

  // 1. Verify Exported Enums and Constants
  console.log('\n--- 1. Testing Notification Enums & Priorities ---');
  assert(NOTIFICATION_TYPES.ROADMAP_UPDATE === 'ROADMAP_UPDATE', 'NOTIFICATION_TYPES contains ROADMAP_UPDATE');
  assert(NOTIFICATION_TYPES.INTERVIEW_RESULT === 'INTERVIEW_RESULT', 'NOTIFICATION_TYPES contains INTERVIEW_RESULT');
  assert(NOTIFICATION_TYPES.APPLICATION_STATUS === 'APPLICATION_STATUS', 'NOTIFICATION_TYPES contains APPLICATION_STATUS');
  assert(NOTIFICATION_PRIORITIES.URGENT === 'URGENT', 'NOTIFICATION_PRIORITIES contains URGENT');

  // 2. Test getNotifications (Paginated & Filtered)
  console.log('\n--- 2. Testing getNotifications Endpoint ---');
  try {
    const originalGet = api.get;
    let capturedUrl = '';
    let capturedParams = null;

    api.get = async (url, config) => {
      capturedUrl = url;
      capturedParams = config?.params;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Notifications retrieved successfully',
          data: {
            notifications: [
              {
                _id: mockNotificationId,
                type: 'SYSTEM',
                title: 'Welcome to InterviewIQ AI',
                message: 'Your profile has been created successfully',
                priority: 'MEDIUM',
                isRead: false,
                createdAt: new Date().toISOString(),
              },
            ],
            unreadCount: 1,
            pagination: {
              total: 1,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          },
        },
      };
    };

    const res = await notificationService.getNotifications({ page: 1, limit: 10, type: 'SYSTEM', isRead: false });
    assert(capturedUrl === '/notifications', 'getNotifications calls GET /notifications');
    assert(capturedParams.page === 1 && capturedParams.limit === 10, 'getNotifications passes pagination params correctly');
    assert(capturedParams.type === 'SYSTEM', 'getNotifications passes type filter correctly');
    assert(capturedParams.isRead === false, 'getNotifications passes isRead filter correctly');
    assert(res.success === true, 'getNotifications returns success = true');
    assert(Array.isArray(res.data.notifications), 'getNotifications returns array of notifications');
    assert(res.data.unreadCount === 1, 'getNotifications includes unreadCount');
    assert(res.data.pagination.total === 1, 'getNotifications includes pagination metadata');

    api.get = originalGet;
  } catch (err) {
    assert(false, `getNotifications test threw error: ${err.message}`);
  }

  // 3. Test getUnreadNotifications
  console.log('\n--- 3. Testing getUnreadNotifications Endpoint ---');
  try {
    const originalGet = api.get;
    let capturedUrl = '';
    let capturedParams = null;

    api.get = async (url, config) => {
      capturedUrl = url;
      capturedParams = config?.params;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Unread notifications retrieved successfully',
          data: {
            notifications: [
              {
                _id: mockNotificationId,
                type: 'INTERVIEW_RESULT',
                title: 'Mock Interview Evaluation Ready',
                message: 'Score: 85/100',
                priority: 'HIGH',
                isRead: false,
              },
            ],
            unreadCount: 1,
            pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
          },
        },
      };
    };

    const res = await notificationService.getUnreadNotifications({ page: 1, limit: 5 });
    assert(capturedUrl === '/notifications/unread', 'getUnreadNotifications calls GET /notifications/unread');
    assert(capturedParams.limit === 5, 'getUnreadNotifications passes limit parameter');
    assert(res.data.notifications[0].type === 'INTERVIEW_RESULT', 'getUnreadNotifications matches response structure');

    api.get = originalGet;
  } catch (err) {
    assert(false, `getUnreadNotifications test threw error: ${err.message}`);
  }

  // 4. Test getUnreadCount Helper
  console.log('\n--- 4. Testing getUnreadCount Helper ---');
  try {
    const originalGet = api.get;
    let capturedParams = null;

    api.get = async (url, config) => {
      capturedParams = config?.params;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Unread notifications retrieved',
          data: {
            notifications: [],
            unreadCount: 4,
            pagination: { total: 4, page: 1, limit: 1, totalPages: 4 },
          },
        },
      };
    };

    const res = await notificationService.getUnreadCount();
    assert(capturedParams.limit === 1, 'getUnreadCount requests minimal limit=1');
    assert(res.unreadCount === 4 && res.count === 4, 'getUnreadCount extracts unread count integer correctly');
    assert(res.success === true, 'getUnreadCount returns success status');

    api.get = originalGet;
  } catch (err) {
    assert(false, `getUnreadCount test threw error: ${err.message}`);
  }

  // 5. Test markAsRead
  console.log('\n--- 5. Testing markAsRead Endpoint ---');
  try {
    const originalPatch = api.patch;
    let capturedUrl = '';

    api.patch = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Notification marked as read',
          data: {
            _id: mockNotificationId,
            isRead: true,
            readAt: new Date().toISOString(),
          },
        },
      };
    };

    const res = await notificationService.markAsRead(mockNotificationId);
    assert(capturedUrl === `/notifications/${mockNotificationId}/read`, 'markAsRead calls PATCH /notifications/:id/read');
    assert(res.data.isRead === true, 'markAsRead returns updated notification with isRead = true');

    // Test missing ID assertion
    let missingIdErrorCaught = false;
    try {
      await notificationService.markAsRead('');
    } catch (e) {
      missingIdErrorCaught = true;
    }
    assert(missingIdErrorCaught, 'markAsRead throws error when ID is missing');

    api.patch = originalPatch;
  } catch (err) {
    assert(false, `markAsRead test threw error: ${err.message}`);
  }

  // 6. Test markAllAsRead
  console.log('\n--- 6. Testing markAllAsRead Endpoint ---');
  try {
    const originalPatch = api.patch;
    let capturedUrl = '';

    api.patch = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'All notifications marked as read',
          data: {
            message: 'All unread notifications marked as read',
            modifiedCount: 3,
          },
        },
      };
    };

    const res = await notificationService.markAllAsRead();
    assert(capturedUrl === '/notifications/read-all', 'markAllAsRead calls PATCH /notifications/read-all');
    assert(res.data.modifiedCount === 3, 'markAllAsRead returns modifiedCount of updated items');

    api.patch = originalPatch;
  } catch (err) {
    assert(false, `markAllAsRead test threw error: ${err.message}`);
  }

  // 7. Test deleteNotification
  console.log('\n--- 7. Testing deleteNotification Endpoint ---');
  try {
    const originalDelete = api.delete;
    let capturedUrl = '';

    api.delete = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Notification deleted successfully',
          data: {
            message: 'Notification deleted successfully',
            deletedId: mockNotificationId,
          },
        },
      };
    };

    const res = await notificationService.deleteNotification(mockNotificationId);
    assert(capturedUrl === `/notifications/${mockNotificationId}`, 'deleteNotification calls DELETE /notifications/:id');
    assert(res.data.deletedId === mockNotificationId, 'deleteNotification returns deletedId matching target ID');

    // Test missing ID assertion
    let missingIdErrorCaught = false;
    try {
      await notificationService.deleteNotification(null);
    } catch (e) {
      missingIdErrorCaught = true;
    }
    assert(missingIdErrorCaught, 'deleteNotification throws error when ID is null/missing');

    api.delete = originalDelete;
  } catch (err) {
    assert(false, `deleteNotification test threw error: ${err.message}`);
  }

  // 8. Test Unsupported Endpoints
  console.log('\n--- 8. Testing Unsupported API Safeguards ---');
  let markUnreadError = false;
  try {
    await notificationService.markAsUnread(mockNotificationId);
  } catch (e) {
    markUnreadError = e.message.includes('not supported');
  }
  assert(markUnreadError, 'markAsUnread throws explicit unsupported error');

  let getPrefError = false;
  try {
    await notificationService.getPreferences();
  } catch (e) {
    getPrefError = e.message.includes('not supported');
  }
  assert(getPrefError, 'getPreferences throws explicit unsupported error');

  let updatePrefError = false;
  try {
    await notificationService.updatePreferences();
  } catch (e) {
    updatePrefError = e.message.includes('not supported');
  }
  assert(updatePrefError, 'updatePreferences throws explicit unsupported error');

  // 9. Test Error Handling (HTTP Status Codes 401, 403, 404, 429, 500)
  console.log('\n--- 9. Testing HTTP Error Code Propagation (401, 403, 404, 429, 500) ---');
  const errorCodes = [
    { status: 401, text: 'Unauthorized - Token expired' },
    { status: 403, text: 'Forbidden - Access denied' },
    { status: 404, text: 'Notification not found' },
    { status: 429, text: 'Too many requests' },
    { status: 500, text: 'Internal server error' },
  ];

  for (const errCase of errorCodes) {
    try {
      const originalGet = api.get;
      api.get = async () => {
        const error = new Error(errCase.text);
        error.response = { status: errCase.status, data: { message: errCase.text } };
        throw error;
      };

      let caught = false;
      try {
        await notificationService.getNotifications();
      } catch (e) {
        caught = e.response.status === errCase.status;
      }
      assert(caught, `Service propagates HTTP ${errCase.status} error correctly`);

      api.get = originalGet;
    } catch (err) {
      assert(false, `Error test for ${errCase.status} failed: ${err.message}`);
    }
  }

  // Summary
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
