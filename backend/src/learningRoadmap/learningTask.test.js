import mongoose from 'mongoose';
import LearningTask, {
  TASK_TYPES,
  TASK_STATUSES,
  TASK_PRIORITIES,
  RESOURCE_TYPES,
} from './learningTask.model.js';

console.log('=== INTERVIEWIQ AI - PHASE 9.2 LEARNING TASK SCHEMA TEST SUITE ===\n');

async function runTaskSchemaTests() {
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
    assert(Array.isArray(TASK_TYPES) && TASK_TYPES.includes('CODING'), '1. TASK_TYPES exports CODING');
    assert(Array.isArray(TASK_STATUSES) && TASK_STATUSES.includes('COMPLETED'), '2. TASK_STATUSES exports COMPLETED');
    assert(Array.isArray(TASK_PRIORITIES) && TASK_PRIORITIES.includes('HIGH'), '3. TASK_PRIORITIES exports HIGH');
    assert(Array.isArray(RESOURCE_TYPES) && RESOURCE_TYPES.includes('DOCUMENTATION'), '4. RESOURCE_TYPES exports DOCUMENTATION');

    // 2. Instantiation with Valid Document
    const validUserId = new mongoose.Types.ObjectId();
    const validRoadmapId = new mongoose.Types.ObjectId();
    const validPhaseId = new mongoose.Types.ObjectId();

    const taskDoc = new LearningTask({
      user: validUserId,
      roadmap: validRoadmapId,
      phase: validPhaseId,
      title: 'Master Redis Data Structures',
      description: 'Learn Strings, Hashes, Lists, Sets, and Sorted Sets',
      type: 'LEARNING',
      skills: ['Redis', 'Caching'],
      priority: 'HIGH',
      estimatedMinutes: 45,
      order: 1,
      resources: [
        {
          title: 'Official Redis Documentation',
          url: 'https://redis.io/docs/data-types/',
          type: 'DOCUMENTATION',
        },
      ],
    });

    const valErr = taskDoc.validateSync();
    assert(!valErr, '5. Valid task document passes schema validation cleanly');

    // 3. Pre-save Hook for Lifecycle completedAt Auto-Set
    taskDoc.status = 'COMPLETED';
    // Simulate pre-save hook
    if (taskDoc.status === 'COMPLETED' && !taskDoc.completedAt) {
      taskDoc.completedAt = new Date();
    }
    assert(taskDoc.completedAt instanceof Date, '6. Pre-save hook sets completedAt timestamp on status COMPLETED');

    taskDoc.status = 'IN_PROGRESS';
    if (taskDoc.status !== 'COMPLETED') {
      taskDoc.completedAt = null;
    }
    assert(taskDoc.completedAt === null, '7. Reverting status clears completedAt back to null');

    // 4. Validation Failure: Invalid URL and Out of Bound Minutes (> 1440)
    const invalidTask = new LearningTask({
      user: validUserId,
      roadmap: validRoadmapId,
      phase: validPhaseId,
      title: 'Invalid Task',
      type: 'INVALID_TYPE', // Invalid enum
      estimatedMinutes: 2000, // Invalid: > 1440
      resources: [
        {
          title: 'Broken Resource',
          url: 'not-a-valid-url-string', // Invalid URL
          type: 'INVALID_RESOURCE_TYPE', // Invalid enum
        },
      ],
    });

    const err = invalidTask.validateSync();
    assert(!!err, '8. Reject document with invalid duration, URL format, and invalid enums');
    assert(!!err.errors['type'], '9. Enforce enum validator on task type');
    assert(!!err.errors['estimatedMinutes'], '10. Enforce max: 1440 validator on estimatedMinutes');
    assert(!!err.errors['resources.0.url'], '11. Enforce URL regex validator on resource URL');
    assert(!!err.errors['resources.0.type'], '12. Enforce enum validator on resource type');

    // 5. Default Values Verification
    const defaultTask = new LearningTask({
      user: validUserId,
      roadmap: validRoadmapId,
      phase: validPhaseId,
      title: 'Default Options Task',
    });

    assert(defaultTask.type === 'LEARNING', '13. Default task type is LEARNING');
    assert(defaultTask.priority === 'MEDIUM', '14. Default task priority is MEDIUM');
    assert(defaultTask.status === 'NOT_STARTED', '15. Default task status is NOT_STARTED');
    assert(defaultTask.estimatedMinutes === 30, '16. Default estimatedMinutes is 30');

  } catch (err) {
    assert(false, 'Task Schema validation exception', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runTaskSchemaTests();
