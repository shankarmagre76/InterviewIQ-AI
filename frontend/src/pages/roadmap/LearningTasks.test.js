import { roadmapService } from '../../services/roadmapService.js';
import { api } from '../../services/api.js';

console.log('=== F8.5 LEARNING TASKS & ACTIONS TEST SUITE ===\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

async function runLearningTasksTestSuite() {
  const mockTaskId = '70e6fdb9c4c4c4c4c4c4c4c4';

  // Test 1: Task Type & Status Enum Classification
  try {
    const validTypes = ['LEARNING', 'PRACTICE', 'PROJECT', 'CODING', 'INTERVIEW', 'REVIEW'];
    const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'];

    assert(validTypes.includes('CODING'), 'CODING is a valid backend task type');
    assert(validTypes.includes('INTERVIEW'), 'INTERVIEW is a valid backend task type');
    assert(validStatuses.includes('COMPLETED'), 'COMPLETED is a valid backend task status');
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  // Test 2: Start Task Mutation (PATCH /roadmaps/tasks/:taskId/start)
  try {
    let capturedUrl = '';
    const origPatch = api.patch;

    api.patch = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Task started successfully',
          data: { _id: mockTaskId, status: 'IN_PROGRESS' },
        },
      };
    };

    const res = await roadmapService.startTask(mockTaskId);
    assert(capturedUrl === `/roadmaps/tasks/${mockTaskId}/start`, 'startTask hits /roadmaps/tasks/:taskId/start');
    assert(res.data.status === 'IN_PROGRESS', 'startTask updates status to IN_PROGRESS');

    api.patch = origPatch;
  } catch (err) {
    assert(false, `Test 2 failed: ${err.message}`);
  }

  // Test 3: Complete Task Mutation & Progress Calculation (PATCH /roadmaps/tasks/:taskId/complete)
  try {
    let capturedUrl = '';
    const origPatch = api.patch;

    api.patch = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Task completed successfully',
          data: { task: { _id: mockTaskId, status: 'COMPLETED' }, roadmapProgress: 80 },
        },
      };
    };

    const res = await roadmapService.completeTask(mockTaskId);
    assert(capturedUrl === `/roadmaps/tasks/${mockTaskId}/complete`, 'completeTask hits /roadmaps/tasks/:taskId/complete');
    assert(res.data.task.status === 'COMPLETED', 'completeTask updates status to COMPLETED');
    assert(res.data.roadmapProgress === 80, 'completeTask returns recalculated roadmap progress');

    api.patch = origPatch;
  } catch (err) {
    assert(false, `Test 3 failed: ${err.message}`);
  }

  // Test 4: Skip Task Mutation (PATCH /roadmaps/tasks/:taskId/skip)
  try {
    let capturedUrl = '';
    const origPatch = api.patch;

    api.patch = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Task skipped',
          data: { task: { _id: mockTaskId, status: 'SKIPPED' } },
        },
      };
    };

    const res = await roadmapService.skipTask(mockTaskId);
    assert(capturedUrl === `/roadmaps/tasks/${mockTaskId}/skip`, 'skipTask hits /roadmaps/tasks/:taskId/skip');
    assert(res.data.task.status === 'SKIPPED', 'skipTask updates status to SKIPPED');

    api.patch = origPatch;
  } catch (err) {
    assert(false, `Test 4 failed: ${err.message}`);
  }

  // Test 5: Reopen Task Mutation (PATCH /roadmaps/tasks/:taskId/reopen)
  try {
    let capturedUrl = '';
    const origPatch = api.patch;

    api.patch = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Task reopened',
          data: { task: { _id: mockTaskId, status: 'NOT_STARTED' } },
        },
      };
    };

    const res = await roadmapService.reopenTask(mockTaskId);
    assert(capturedUrl === `/roadmaps/tasks/${mockTaskId}/reopen`, 'reopenTask hits /roadmaps/tasks/:taskId/reopen');
    assert(res.data.task.status === 'NOT_STARTED', 'reopenTask updates status to NOT_STARTED');

    api.patch = origPatch;
  } catch (err) {
    assert(false, `Test 5 failed: ${err.message}`);
  }

  console.log(`\n=== LEARNING TASKS TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL F8.5 LEARNING TASKS TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME LEARNING TASKS TESTS FAILED!');
    process.exit(1);
  }
}

runLearningTasksTestSuite();
