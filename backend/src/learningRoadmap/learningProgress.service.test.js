import mongoose from 'mongoose';
import learningProgressService from './learningProgress.service.js';
import {
  learningRoadmapRepository,
  learningTaskRepository,
} from './learningRoadmap.repository.js';

console.log('=== INTERVIEWIQ AI - PHASE 9.8 LEARNING PROGRESS TRACKING TEST SUITE ===\n');

async function runProgressTrackingTests() {
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
    const testRoadmapId = new mongoose.Types.ObjectId().toString();
    const testPhaseId = new mongoose.Types.ObjectId();
    const testTaskId = new mongoose.Types.ObjectId().toString();

    // 1. Phase Progress Algorithm Helper Assertions
    const phaseTasks = [
      { status: 'COMPLETED' },
      { status: 'COMPLETED' },
      { status: 'IN_PROGRESS' },
      { status: 'NOT_STARTED' },
    ];
    const phaseRes = learningProgressService.calculatePhaseProgress(phaseTasks);
    assert(phaseRes.progress === 50, `1. Phase progress ratio calculated correctly (Expected 50%, Got ${phaseRes.progress}%)`);
    assert(phaseRes.status === 'IN_PROGRESS', '2. Phase status categorized as IN_PROGRESS');

    // 2. Full Phase Completion Assertions
    const completedPhaseTasks = [{ status: 'COMPLETED' }, { status: 'SKIPPED' }];
    const fullPhaseRes = learningProgressService.calculatePhaseProgress(completedPhaseTasks);
    assert(fullPhaseRes.progress === 100, '3. Full phase progress reaches 100%');
    assert(fullPhaseRes.status === 'COMPLETED', '4. Full phase status categorizes as COMPLETED');

    // 3. Overall Roadmap Progress Helper Assertions
    const phases = [{ progress: 100, status: 'COMPLETED' }, { progress: 50, status: 'IN_PROGRESS' }];
    const roadmapRes = learningProgressService.calculateRoadmapProgress(phases);
    assert(roadmapRes.overallProgress === 75, `5. Overall roadmap progress calculated (Expected 75%, Got ${roadmapRes.overallProgress}%)`);
    assert(roadmapRes.isFullyCompleted === false, '6. Partial roadmap completion yields isFullyCompleted = false');

    // 4. Mock Repositories for Task Lifecycle Operations
    const mockTaskNotStarted = {
      _id: testTaskId,
      user: testUserId,
      roadmap: testRoadmapId,
      phase: testPhaseId,
      status: 'NOT_STARTED',
      completedAt: null,
    };

    const mockRoadmap = {
      _id: testRoadmapId,
      user: testUserId,
      overallProgress: 0,
      status: 'ACTIVE',
      phases: [{ _id: testPhaseId, progress: 0, status: 'NOT_STARTED' }],
    };

    learningTaskRepository.getTaskById = async () => mockTaskNotStarted;
    learningRoadmapRepository.getRoadmapById = async () => mockRoadmap;
    learningTaskRepository.getRoadmapTasks = async () => [{ ...mockTaskNotStarted, status: 'COMPLETED' }];
    learningRoadmapRepository.updateRoadmap = async (id, uId, data) => ({ ...mockRoadmap, ...data });

    // 5. Test completeTask Operation
    learningTaskRepository.completeTask = async () => ({
      ...mockTaskNotStarted,
      status: 'COMPLETED',
      completedAt: new Date(),
    });

    const completeResult = await learningProgressService.completeTask(testTaskId, testUserId);
    assert(completeResult.task.status === 'COMPLETED', '7. completeTask updates task status to COMPLETED');
    assert(completeResult.progress.roadmapProgress === 100, '8. completeTask syncs roadmapProgress to 100%');
    assert(completeResult.progress.completedTasks === 1, '9. completeTask returns correct completedTasks count (1)');

    // 6. Test reopenTask Operation (Reset downwards)
    learningTaskRepository.getTaskById = async () => ({
      ...mockTaskNotStarted,
      status: 'COMPLETED',
      completedAt: new Date(),
    });
    learningTaskRepository.updateTask = async (id, uId, data) => ({
      ...mockTaskNotStarted,
      ...data,
    });
    learningTaskRepository.getRoadmapTasks = async () => [
      { ...mockTaskNotStarted, status: 'IN_PROGRESS', completedAt: null },
    ];

    const reopenResult = await learningProgressService.reopenTask(testTaskId, testUserId);
    assert(reopenResult.task.status === 'IN_PROGRESS', '10. reopenTask resets task status to IN_PROGRESS');
    assert(reopenResult.task.completedAt === null, '11. reopenTask resets completedAt timestamp to null');
    assert(reopenResult.progress.roadmapProgress === 0, '12. reopenTask adjusts roadmap progress downwards to 0%');

  } catch (err) {
    assert(false, 'Learning Progress Tracking test exception', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runProgressTrackingTests();
