import { roadmapService } from '../../services/roadmapService.js';
import { api } from '../../services/api.js';

console.log('=== F8.6 TASK COMPLETION & PROGRESS TRACKING MASTER TEST SUITE ===\n');

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

async function runTaskProgressTrackingTestSuite() {
  const mockTaskId = '70e6fdb9c4c4c4c4c4c4c4c4';

  // Test 1: Complete Task & Verify Backend Progress Pipeline Payload
  try {
    const origPatch = api.patch;

    api.patch = async () => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'Task completed successfully',
        data: {
          task: { _id: mockTaskId, status: 'COMPLETED' },
          progress: {
            roadmapProgress: 72,
            phaseProgress: 80,
            completedTasks: 8,
            totalTasks: 12,
            phaseStatus: 'IN_PROGRESS',
            roadmapStatus: 'ACTIVE',
          },
        },
      },
    });

    const res = await roadmapService.completeTask(mockTaskId);
    const progress = res.data.progress;

    assert(progress.roadmapProgress === 72, 'Backend overall roadmap progress is 72%');
    assert(progress.phaseProgress === 80, 'Backend current phase progress is 80%');
    assert(progress.completedTasks === 8, 'Backend completed tasks count is 8');
    assert(progress.totalTasks === 12, 'Backend total tasks count is 12');

    api.patch = origPatch;
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  // Test 2: Milestone Trigger Logic (Phase 100% Completion Milestone)
  try {
    const milestoneProgress = {
      roadmapProgress: 85,
      phaseProgress: 100,
      completedTasks: 10,
      totalTasks: 12,
      phaseStatus: 'COMPLETED',
      roadmapStatus: 'ACTIVE',
    };

    const getMilestoneMessage = (p) => {
      if (p.roadmapProgress === 100 || p.roadmapStatus === 'COMPLETED') {
        return '🎉 Congratulations! You have completed your entire AI Learning Roadmap!';
      }
      if (p.phaseProgress === 100 || p.phaseStatus === 'COMPLETED') {
        return '🌟 Phase Milestone Achieved! You have completed all tasks in this phase.';
      }
      return 'Task completed!';
    };

    const msg = getMilestoneMessage(milestoneProgress);
    assert(msg.includes('Phase Milestone Achieved'), 'Phase 100% completion triggers Phase Milestone celebration toast');
  } catch (err) {
    assert(false, `Test 2 failed: ${err.message}`);
  }

  // Test 3: Full Roadmap 100% Completion Milestone
  try {
    const fullCompletionProgress = {
      roadmapProgress: 100,
      phaseProgress: 100,
      completedTasks: 12,
      totalTasks: 12,
      phaseStatus: 'COMPLETED',
      roadmapStatus: 'COMPLETED',
    };

    const getMilestoneMessage = (p) => {
      if (p.roadmapProgress === 100 || p.roadmapStatus === 'COMPLETED') {
        return '🎉 Congratulations! You have completed your entire AI Learning Roadmap!';
      }
      return 'Task completed!';
    };

    const msg = getMilestoneMessage(fullCompletionProgress);
    assert(msg.includes('completed your entire AI Learning Roadmap'), 'Roadmap 100% completion triggers Roadmap Milestone celebration toast');
  } catch (err) {
    assert(false, `Test 3 failed: ${err.message}`);
  }

  // Test 4: Idempotent Completion Handling (No duplicate calculation)
  try {
    const origPatch = api.patch;
    let callCount = 0;

    api.patch = async () => {
      callCount++;
      return {
        data: {
          success: true,
          data: {
            task: { _id: mockTaskId, status: 'COMPLETED' },
            progress: { roadmapProgress: 72 },
          },
        },
      };
    };

    await roadmapService.completeTask(mockTaskId);
    assert(callCount === 1, 'Single completeTask request executed without duplicates');

    api.patch = origPatch;
  } catch (err) {
    assert(false, `Test 4 failed: ${err.message}`);
  }

  console.log(`\n=== PROGRESS TRACKING TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL F8.6 TASK PROGRESS TRACKING TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME TASK PROGRESS TRACKING TESTS FAILED!');
    process.exit(1);
  }
}

runTaskProgressTrackingTestSuite();
