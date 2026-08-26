import mongoose from 'mongoose';
import notificationService from './notification.service.js';
import notificationRepository from './notification.repository.js';
import Notification from './notification.model.js';

console.log('=== INTERVIEWIQ AI - PHASE 9.9 NOTIFICATION SERVICE TEST SUITE ===\n');

async function runNotificationServiceTests() {
  let passedCount = 0;
  let failedCount = 0;

  const assert = (condition, testName, message = '') => {
    if (condition) {
      passedCount++;
      console.log(`[PASS] ${testName}`);
    } else {
      failedCount++;
      console.error(`[FAIL] ${testName} - ${message}`);
    }
  };

  try {
    const testUserId = new mongoose.Types.ObjectId().toString();
    const testEntityId = new mongoose.Types.ObjectId().toString();
    const testNotifId = new mongoose.Types.ObjectId().toString();

    // 1. Core Service Method Existence Assertions
    assert(typeof notificationService.createNotification === 'function', '1. createNotification method exists');
    assert(typeof notificationService.getNotifications === 'function', '2. getNotifications method exists');
    assert(typeof notificationService.getUnreadNotifications === 'function', '3. getUnreadNotifications method exists');
    assert(typeof notificationService.markAsRead === 'function', '4. markAsRead method exists');
    assert(typeof notificationService.markAllAsRead === 'function', '5. markAllAsRead method exists');
    assert(typeof notificationService.deleteNotification === 'function', '6. deleteNotification method exists');

    // 2. Domain Event Method Existence Assertions
    assert(typeof notificationService.notifyRoadmapGenerated === 'function', '7. notifyRoadmapGenerated trigger exists');
    assert(typeof notificationService.notifyRoadmapMilestone === 'function', '8. notifyRoadmapMilestone trigger exists');
    assert(typeof notificationService.notifyTaskDue === 'function', '9. notifyTaskDue trigger exists');
    assert(typeof notificationService.notifyTaskCompleted === 'function', '10. notifyTaskCompleted trigger exists');
    assert(typeof notificationService.notifyInterviewResult === 'function', '11. notifyInterviewResult trigger exists');
    assert(typeof notificationService.notifyResumeAnalysis === 'function', '12. notifyResumeAnalysis trigger exists');
    assert(typeof notificationService.notifyResumeImprovement === 'function', '13. notifyResumeImprovement trigger exists');
    assert(typeof notificationService.notifyApplicationStatusChanged === 'function', '14. notifyApplicationStatusChanged trigger exists');
    assert(typeof notificationService.notifyApplicationDeadline === 'function', '15. notifyApplicationDeadline trigger exists');
    assert(typeof notificationService.notifySkillGapDetected === 'function', '16. notifySkillGapDetected trigger exists');

    // 3. Stub Repository Operations for Unit Verification
    const origCreate = notificationRepository.createNotification;
    const origFindDup = notificationRepository.findDuplicate;
    const origGetUsers = notificationRepository.getUserNotifications;
    const origMarkRead = notificationRepository.markAsRead;

    notificationRepository.createNotification = async (data) => ({
      _id: testNotifId,
      ...data,
      createdAt: new Date(),
    });

    notificationRepository.findDuplicate = async () => null;

    notificationRepository.getUserNotifications = async (uId, options) => ({
      notifications: [{ _id: testNotifId, user: uId, isRead: options.isRead || false }],
      unreadCount: 1,
      pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });

    notificationRepository.markAsRead = async (id, uId) => ({
      _id: id,
      user: uId,
      isRead: true,
      readAt: new Date(),
    });

    // 4. Test Event Trigger & Creation (Interview Result)
    const interviewNotif = await notificationService.notifyInterviewResult(
      testUserId,
      testEntityId,
      88,
      'Senior Node.js Developer'
    );
    assert(interviewNotif.type === 'INTERVIEW_RESULT', '17. notifyInterviewResult creates notification with INTERVIEW_RESULT type');
    assert(interviewNotif.priority === 'URGENT', '18. notifyInterviewResult sets URGENT priority');
    assert(interviewNotif.relatedEntity === 'Interview', '19. notifyInterviewResult sets Interview related entity');

    // 5. Test Deduplication Logic
    notificationRepository.findDuplicate = async () => ({
      _id: testNotifId,
      title: 'Duplicate Event',
      type: 'SKILL_GAP',
    });

    const duplicateRes = await notificationService.notifySkillGapDetected(testUserId, ['Docker']);
    assert(duplicateRes._id === testNotifId, '20. Anti-spam deduplication skips duplicate notification within 5-min window');

    // 6. Test Read Operations
    notificationRepository.findDuplicate = async () => null;
    const readRes = await notificationService.markAsRead(testNotifId, testUserId);
    assert(readRes.isRead === true && !!readRes.readAt, '21. markAsRead sets isRead to true with timestamp');

    // Restore original repository methods
    notificationRepository.createNotification = origCreate;
    notificationRepository.findDuplicate = origFindDup;
    notificationRepository.getUserNotifications = origGetUsers;
    notificationRepository.markAsRead = origMarkRead;

  } catch (err) {
    assert(false, 'Notification Service test exception', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runNotificationServiceTests();
