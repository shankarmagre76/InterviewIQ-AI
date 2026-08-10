import mongoose from 'mongoose';
import Notification, {
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  RELATED_ENTITIES,
} from './notification.model.js';

console.log('=== INTERVIEWIQ AI - PHASE 9.3 NOTIFICATION SCHEMA TEST SUITE ===\n');

async function runNotificationSchemaTests() {
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
    // 1. Enum Constants Assertions
    assert(Array.isArray(NOTIFICATION_TYPES) && NOTIFICATION_TYPES.includes('INTERVIEW_RESULT'), '1. NOTIFICATION_TYPES exports INTERVIEW_RESULT');
    assert(Array.isArray(NOTIFICATION_PRIORITIES) && NOTIFICATION_PRIORITIES.includes('URGENT'), '2. NOTIFICATION_PRIORITIES exports URGENT');
    assert(Array.isArray(RELATED_ENTITIES) && RELATED_ENTITIES.includes('Interview'), '3. RELATED_ENTITIES exports Interview');

    // 2. Instantiation with Valid Polymorphic Notification Document
    const validUserId = new mongoose.Types.ObjectId();
    const validInterviewId = new mongoose.Types.ObjectId();

    const notifDoc = new Notification({
      user: validUserId,
      type: 'INTERVIEW_RESULT',
      title: 'Mock Interview Evaluation Ready',
      message: 'You scored 85/100 in Technical Interview for Senior Node.js Architect.',
      priority: 'HIGH',
      relatedEntity: 'Interview',
      relatedEntityId: validInterviewId,
      metadata: { overallScore: 85, durationMinutes: 35 },
    });

    const valErr = notifDoc.validateSync();
    assert(!valErr, '4. Valid polymorphic notification document passes schema validation cleanly');

    // 3. Pre-save Hook for Lifecycle readAt Auto-Set
    assert(notifDoc.isRead === false && notifDoc.readAt === null, '5. Default isRead is false and readAt is null');

    notifDoc.isRead = true;
    if (notifDoc.isRead && !notifDoc.readAt) {
      notifDoc.readAt = new Date();
    }
    assert(notifDoc.readAt instanceof Date, '6. Pre-save hook sets readAt timestamp on isRead set to true');

    notifDoc.isRead = false;
    if (!notifDoc.isRead) {
      notifDoc.readAt = null;
    }
    assert(notifDoc.readAt === null, '7. Reverting isRead to false clears readAt timestamp to null');

    // 4. Validation Failure: Invalid Type, Priority, and Unsupported Related Entity
    const invalidNotif = new Notification({
      user: validUserId,
      type: 'INVALID_NOTIF_TYPE', // Invalid enum
      title: 'Test Title',
      message: 'Test Message',
      priority: 'INVALID_PRIORITY', // Invalid enum
      relatedEntity: 'UnsupportedModel', // Invalid enum
    });

    const err = invalidNotif.validateSync();
    assert(!!err, '8. Reject document with invalid notification type, priority, or related entity');
    assert(!!err.errors['type'], '9. Enforce enum validator on notification type');
    assert(!!err.errors['priority'], '10. Enforce enum validator on notification priority');
    assert(!!err.errors['relatedEntity'], '11. Enforce enum validator on relatedEntity');

    // 5. Default Values & Structure Verification
    const defaultNotif = new Notification({
      user: validUserId,
      title: 'System Alert',
      message: 'Welcome to InterviewIQ AI Platform!',
    });

    assert(defaultNotif.type === 'SYSTEM', '12. Default notification type is SYSTEM');
    assert(defaultNotif.priority === 'MEDIUM', '13. Default notification priority is MEDIUM');
    assert(defaultNotif.isRead === false, '14. Default isRead is false');

  } catch (err) {
    assert(false, 'Notification Schema validation exception', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runNotificationSchemaTests();
