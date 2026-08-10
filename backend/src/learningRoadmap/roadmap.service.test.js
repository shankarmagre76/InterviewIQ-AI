import mongoose from 'mongoose';
import roadmapService from './roadmap.service.js';
import {
  learningRoadmapRepository,
  learningTaskRepository,
} from './learningRoadmap.repository.js';
import learningRoadmapAiService from './learningRoadmapAi.service.js';

console.log('=== INTERVIEWIQ AI - PHASE 9.7 ROADMAP SERVICE TEST SUITE ===\n');

async function runRoadmapServiceTests() {
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

    // 1. Method Existence Assertions
    assert(typeof roadmapService.generateRoadmap === 'function', '1. generateRoadmap method exists');
    assert(typeof roadmapService.getActiveRoadmap === 'function', '2. getActiveRoadmap method exists');
    assert(typeof roadmapService.getRoadmap === 'function', '3. getRoadmap method exists');
    assert(typeof roadmapService.getRoadmapHistory === 'function', '4. getRoadmapHistory method exists');
    assert(typeof roadmapService.recalculateProgress === 'function', '5. recalculateProgress method exists');
    assert(typeof roadmapService.updateRoadmap === 'function', '6. updateRoadmap method exists');
    assert(typeof roadmapService.archiveRoadmap === 'function', '7. archiveRoadmap method exists');
    assert(typeof roadmapService.deleteRoadmap === 'function', '8. deleteRoadmap method exists');

    // 2. Mock Repositories & Services
    const origGetActiveRepo = learningRoadmapRepository.getActiveRoadmap;
    const origGetTasksRepo = learningTaskRepository.getRoadmapTasks;
    const origGetRoadmapByIdRepo = learningRoadmapRepository.getRoadmapById;
    const origUpdateRoadmapRepo = learningRoadmapRepository.updateRoadmap;
    const origDeleteRoadmapRepo = learningRoadmapRepository.deleteRoadmap;
    const origDeleteTasksRepo = learningTaskRepository.deleteTasksByRoadmap;
    const origGenerateAi = learningRoadmapAiService.generateRoadmap;

    const mockPhase = {
      _id: testPhaseId,
      title: 'Phase 1: Foundations',
      progress: 0,
      status: 'NOT_STARTED',
    };

    const mockRoadmap = {
      _id: testRoadmapId,
      user: testUserId,
      title: 'Test Roadmap',
      status: 'ACTIVE',
      isActive: true,
      overallProgress: 0,
      phases: [mockPhase],
      toObject: function () {
        return { ...this };
      },
    };

    learningRoadmapRepository.getActiveRoadmap = async () => mockRoadmap;
    learningRoadmapRepository.getRoadmapById = async () => mockRoadmap;
    learningTaskRepository.getRoadmapTasks = async () => [
      { _id: new mongoose.Types.ObjectId(), phase: testPhaseId, status: 'COMPLETED' },
      { _id: new mongoose.Types.ObjectId(), phase: testPhaseId, status: 'COMPLETED' },
    ];
    learningRoadmapRepository.updateRoadmap = async (id, userId, data) => ({
      ...mockRoadmap,
      ...data,
    });
    learningRoadmapAiService.generateRoadmap = async () => ({
      roadmap: mockRoadmap,
      tasks: [],
    });

    // 3. Test getActiveRoadmap with Embedded Tasks
    const activeResult = await roadmapService.getActiveRoadmap(testUserId);
    assert(activeResult.roadmap._id === testRoadmapId, '9. getActiveRoadmap returns roadmap document');
    assert(activeResult.roadmap.phases[0].tasks.length === 2, '10. getActiveRoadmap embeds tasks inside phase');

    // 4. Test Task Completion & Progress Recalculation (2/2 tasks completed -> 100% phase -> 100% roadmap)
    const recalculated = await roadmapService.recalculateProgress(testRoadmapId, testUserId);
    assert(recalculated.overallProgress === 100, `11. Recalculates overallProgress to 100% (Got ${recalculated.overallProgress}%)`);
    assert(recalculated.phases[0].status === 'COMPLETED', '12. Updates phase status to COMPLETED when tasks hit 100%');

    // 5. Test AI Generation Delegate
    const aiGenResult = await roadmapService.generateRoadmap(testUserId);
    assert(aiGenResult.roadmap._id === testRoadmapId, '13. generateRoadmap delegates to LearningRoadmapAiService');

    // 6. Test Cascade Delete
    let deleteRoadmapCalled = false;
    let deleteTasksCalled = false;
    learningRoadmapRepository.deleteRoadmap = async () => { deleteRoadmapCalled = true; return mockRoadmap; };
    learningTaskRepository.deleteTasksByRoadmap = async () => { deleteTasksCalled = true; return { deletedCount: 2 }; };

    const deleteResult = await roadmapService.deleteRoadmap(testRoadmapId, testUserId);
    assert(deleteRoadmapCalled && deleteTasksCalled, '14. deleteRoadmap cascade-deletes roadmap and associated child tasks');

    // Restore original methods
    learningRoadmapRepository.getActiveRoadmap = origGetActiveRepo;
    learningTaskRepository.getRoadmapTasks = origGetTasksRepo;
    learningRoadmapRepository.getRoadmapById = origGetRoadmapByIdRepo;
    learningRoadmapRepository.updateRoadmap = origUpdateRoadmapRepo;
    learningRoadmapRepository.deleteRoadmap = origDeleteRoadmapRepo;
    learningTaskRepository.deleteTasksByRoadmap = origDeleteTasksRepo;
    learningRoadmapAiService.generateRoadmap = origGenerateAi;

  } catch (err) {
    assert(false, 'Roadmap Service test exception', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runRoadmapServiceTests();
