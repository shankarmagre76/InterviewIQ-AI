import mongoose from 'mongoose';
import {
  learningRoadmapRepository,
  learningTaskRepository,
} from './learningRoadmap.repository.js';
import LearningRoadmap from './learningRoadmap.model.js';
import LearningTask from './learningTask.model.js';

console.log('=== INTERVIEWIQ AI - PHASE 9.6 ROADMAP REPOSITORY TEST SUITE ===\n');

async function runRepositoryTests() {
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
    // 1. LearningRoadmapRepository Method Existence Assertions
    assert(typeof learningRoadmapRepository.createRoadmap === 'function', '1. createRoadmap method exists');
    assert(typeof learningRoadmapRepository.getRoadmapById === 'function', '2. getRoadmapById method exists');
    assert(typeof learningRoadmapRepository.getActiveRoadmap === 'function', '3. getActiveRoadmap method exists');
    assert(typeof learningRoadmapRepository.getUserRoadmaps === 'function', '4. getUserRoadmaps method exists');
    assert(typeof learningRoadmapRepository.updateRoadmap === 'function', '5. updateRoadmap method exists');
    assert(typeof learningRoadmapRepository.archiveRoadmap === 'function', '6. archiveRoadmap method exists');
    assert(typeof learningRoadmapRepository.deleteRoadmap === 'function', '7. deleteRoadmap method exists');

    // 2. LearningTaskRepository Method Existence Assertions
    assert(typeof learningTaskRepository.createTask === 'function', '8. createTask method exists');
    assert(typeof learningTaskRepository.createManyTasks === 'function', '9. createManyTasks method exists');
    assert(typeof learningTaskRepository.getTaskById === 'function', '10. getTaskById method exists');
    assert(typeof learningTaskRepository.getRoadmapTasks === 'function', '11. getRoadmapTasks method exists');
    assert(typeof learningTaskRepository.updateTask === 'function', '12. updateTask method exists');
    assert(typeof learningTaskRepository.completeTask === 'function', '13. completeTask method exists');
    assert(typeof learningTaskRepository.deleteTask === 'function', '14. deleteTask method exists');

    // 3. Stub MongoDB Operations for Repository Logic Verification
    const testUserId = new mongoose.Types.ObjectId().toString();
    const testRoadmapId = new mongoose.Types.ObjectId().toString();
    const testTaskId = new mongoose.Types.ObjectId().toString();

    // Stub LearningRoadmap methods
    const origFindOneRoadmap = LearningRoadmap.findOne;
    const origFindRoadmap = LearningRoadmap.find;
    const origCountRoadmap = LearningRoadmap.countDocuments;
    const origFindOneAndUpdateRoadmap = LearningRoadmap.findOneAndUpdate;

    LearningRoadmap.findOne = (query) => ({
      sort: () => ({ _id: testRoadmapId, user: query.user, status: 'ACTIVE', version: 1 }),
      _id: testRoadmapId,
      user: query.user,
      status: 'ACTIVE',
    });

    LearningRoadmap.find = () => ({
      sort: () => ({
        skip: () => ({
          limit: () => ({
            lean: async () => [{ _id: testRoadmapId, title: 'Roadmap 1' }],
          }),
        }),
      }),
    });

    LearningRoadmap.countDocuments = async () => 1;

    LearningRoadmap.findOneAndUpdate = async (query, update) => ({
      _id: query._id,
      user: query.user,
      ...update,
    });

    const activeRoadmap = await learningRoadmapRepository.getActiveRoadmap(testUserId);
    assert(!!activeRoadmap && activeRoadmap.status === 'ACTIVE', '15. getActiveRoadmap returns active roadmap document');

    const userRoadmaps = await learningRoadmapRepository.getUserRoadmaps(testUserId, { page: 1, limit: 10 });
    assert(userRoadmaps.roadmaps.length === 1 && userRoadmaps.pagination.total === 1, '16. getUserRoadmaps returns paginated roadmaps payload');

    const archivedRoadmap = await learningRoadmapRepository.archiveRoadmap(testRoadmapId, testUserId);
    assert(archivedRoadmap.status === 'ARCHIVED' && archivedRoadmap.isActive === false, '17. archiveRoadmap updates status to ARCHIVED');

    // Stub LearningTask methods
    const origFindOneTask = LearningTask.findOne;
    const origFindTask = LearningTask.find;
    const origInsertManyTask = LearningTask.insertMany;
    const origFindOneAndUpdateTask = LearningTask.findOneAndUpdate;

    LearningTask.insertMany = async (arr) => arr.map((item, i) => ({ _id: new mongoose.Types.ObjectId(), ...item }));
    LearningTask.find = () => ({
      sort: () => ({
        lean: async () => [{ _id: testTaskId, roadmap: testRoadmapId, order: 1 }],
      }),
    });
    LearningTask.findOneAndUpdate = async (query, update) => ({
      _id: query._id,
      user: query.user,
      ...update,
    });

    const batchCreated = await learningTaskRepository.createManyTasks([
      { title: 'Task 1', order: 1 },
      { title: 'Task 2', order: 2 },
    ]);
    assert(batchCreated.length === 2, '18. createManyTasks batch inserts tasks in a single operation');

    const roadmapTasks = await learningTaskRepository.getRoadmapTasks(testRoadmapId, testUserId);
    assert(roadmapTasks.length === 1 && roadmapTasks[0].order === 1, '19. getRoadmapTasks returns roadmap tasks sorted by order');

    const completedTask = await learningTaskRepository.completeTask(testTaskId, testUserId);
    assert(completedTask.status === 'COMPLETED' && !!completedTask.completedAt, '20. completeTask marks task COMPLETED with timestamp');

    // Restore original Mongoose methods
    LearningRoadmap.findOne = origFindOneRoadmap;
    LearningRoadmap.find = origFindRoadmap;
    LearningRoadmap.countDocuments = origCountRoadmap;
    LearningRoadmap.findOneAndUpdate = origFindOneAndUpdateRoadmap;
    LearningTask.findOne = origFindOneTask;
    LearningTask.find = origFindTask;
    LearningTask.insertMany = origInsertManyTask;
    LearningTask.findOneAndUpdate = origFindOneAndUpdateTask;

  } catch (err) {
    assert(false, 'Roadmap Repository test exception', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runRepositoryTests();
