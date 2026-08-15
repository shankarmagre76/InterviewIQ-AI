import { roadmapService } from './roadmapService.js';
import { api } from './api.js';

console.log('=== FRONTEND ROADMAP SERVICE API INTEGRATION TEST SUITE ===\n');

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

async function runRoadmapServiceTestSuite() {
  const mockRoadmapId = '60d5ecb8b3b3b3b3b3b3b3b3';
  const mockTaskId = '70e6fdb9c4c4c4c4c4c4c4c4';

  // 1. Test generateRoadmap
  try {
    let capturedUrl = '';
    let capturedBody = null;

    const origPost = api.post;
    api.post = async (url, body) => {
      capturedUrl = url;
      capturedBody = body;
      return {
        data: {
          success: true,
          statusCode: 201,
          message: 'AI Learning Roadmap generated successfully',
          data: {
            roadmap: { _id: mockRoadmapId, targetRole: 'Java Developer', overallProgress: 0, status: 'ACTIVE' },
            tasks: [],
          },
        },
      };
    };

    const res = await roadmapService.generateRoadmap({ targetRole: 'Java Developer', forceRegenerate: true });
    assert(capturedUrl === '/roadmaps/generate', 'generateRoadmap hits /roadmaps/generate');
    assert(capturedBody.targetRole === 'Java Developer', 'generateRoadmap passes targetRole');
    assert(capturedBody.forceRegenerate === true, 'generateRoadmap passes forceRegenerate');
    assert(res.data.roadmap._id === mockRoadmapId, 'generateRoadmap returns roadmap object');

    api.post = origPost;
  } catch (err) {
    assert(false, `1. generateRoadmap failed: ${err.message}`);
  }

  // 2. Test getActiveRoadmap
  try {
    let capturedUrl = '';
    const origGet = api.get;

    api.get = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Active Learning Roadmap retrieved successfully',
          data: {
            roadmap: { _id: mockRoadmapId, targetRole: 'Full Stack Engineer', overallProgress: 45 },
            tasks: [],
          },
        },
      };
    };

    const res = await roadmapService.getActiveRoadmap();
    assert(capturedUrl === '/roadmaps/active', 'getActiveRoadmap hits /roadmaps/active');
    assert(res.data.roadmap.overallProgress === 45, 'getActiveRoadmap returns active roadmap with progress');

    api.get = origGet;
  } catch (err) {
    assert(false, `2. getActiveRoadmap failed: ${err.message}`);
  }

  // 3. Test getRoadmapById & getRoadmap
  try {
    let capturedUrl = '';
    const origGet = api.get;

    api.get = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Learning Roadmap retrieved successfully',
          data: {
            roadmap: { _id: mockRoadmapId, title: 'DevOps Mastery' },
          },
        },
      };
    };

    const res1 = await roadmapService.getRoadmapById(mockRoadmapId);
    assert(capturedUrl === `/roadmaps/${mockRoadmapId}`, 'getRoadmapById hits /roadmaps/:id');
    assert(res1.data.roadmap.title === 'DevOps Mastery', 'getRoadmapById returns roadmap document');

    const res2 = await roadmapService.getRoadmap(mockRoadmapId);
    assert(res2.data.roadmap._id === mockRoadmapId, 'getRoadmap alias works properly');

    api.get = origGet;
  } catch (err) {
    assert(false, `3. getRoadmapById failed: ${err.message}`);
  }

  // 4. Test getRoadmapHistory & getHistory
  try {
    let capturedUrl = '';
    let capturedParams = null;
    const origGet = api.get;

    api.get = async (url, config) => {
      capturedUrl = url;
      capturedParams = config?.params;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Roadmap history retrieved successfully',
          data: {
            roadmaps: [{ _id: mockRoadmapId, status: 'COMPLETED' }],
            pagination: { total: 1, page: 1, limit: 10 },
          },
        },
      };
    };

    const res1 = await roadmapService.getRoadmapHistory({ page: 1, limit: 10, status: 'COMPLETED' });
    assert(capturedUrl === '/roadmaps', 'getRoadmapHistory hits /roadmaps');
    assert(capturedParams.status === 'COMPLETED', 'getRoadmapHistory passes status filter');
    assert(res1.data.roadmaps.length === 1, 'getRoadmapHistory returns roadmaps list');

    const res2 = await roadmapService.getHistory({ page: 1 });
    assert(res2.data.roadmaps.length === 1, 'getHistory alias works properly');

    api.get = origGet;
  } catch (err) {
    assert(false, `4. getRoadmapHistory failed: ${err.message}`);
  }

  // 5. Test updateRoadmap
  try {
    let capturedUrl = '';
    let capturedBody = null;
    const origPatch = api.patch;

    api.patch = async (url, body) => {
      capturedUrl = url;
      capturedBody = body;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Learning Roadmap updated successfully',
          data: { _id: mockRoadmapId, title: 'Updated Title' },
        },
      };
    };

    const res = await roadmapService.updateRoadmap(mockRoadmapId, { title: 'Updated Title' });
    assert(capturedUrl === `/roadmaps/${mockRoadmapId}`, 'updateRoadmap hits PATCH /roadmaps/:id');
    assert(capturedBody.title === 'Updated Title', 'updateRoadmap passes update body');
    assert(res.data.title === 'Updated Title', 'updateRoadmap returns updated roadmap');

    api.patch = origPatch;
  } catch (err) {
    assert(false, `5. updateRoadmap failed: ${err.message}`);
  }

  // 6. Test archiveRoadmap
  try {
    let capturedUrl = '';
    const origPatch = api.patch;

    api.patch = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Learning Roadmap archived successfully',
          data: { _id: mockRoadmapId, status: 'ARCHIVED' },
        },
      };
    };

    const res = await roadmapService.archiveRoadmap(mockRoadmapId);
    assert(capturedUrl === `/roadmaps/${mockRoadmapId}/archive`, 'archiveRoadmap hits PATCH /roadmaps/:id/archive');
    assert(res.data.status === 'ARCHIVED', 'archiveRoadmap updates status to ARCHIVED');

    api.patch = origPatch;
  } catch (err) {
    assert(false, `6. archiveRoadmap failed: ${err.message}`);
  }

  // 7. Test deleteRoadmap
  try {
    let capturedUrl = '';
    const origDelete = api.delete;

    api.delete = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Learning Roadmap deleted successfully',
          data: { _id: mockRoadmapId },
        },
      };
    };

    const res = await roadmapService.deleteRoadmap(mockRoadmapId);
    assert(capturedUrl === `/roadmaps/${mockRoadmapId}`, 'deleteRoadmap hits DELETE /roadmaps/:id');
    assert(res.data._id === mockRoadmapId, 'deleteRoadmap confirms deletion');

    api.delete = origDelete;
  } catch (err) {
    assert(false, `7. deleteRoadmap failed: ${err.message}`);
  }

  // 8. Test getRoadmapTasks & getTasks
  try {
    let capturedUrl = '';
    let capturedParams = null;
    const origGet = api.get;

    api.get = async (url, config) => {
      capturedUrl = url;
      capturedParams = config?.params;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Roadmap tasks retrieved successfully',
          data: [{ _id: mockTaskId, title: 'Learn Docker Containers' }],
        },
      };
    };

    const res1 = await roadmapService.getRoadmapTasks(mockRoadmapId, { status: 'PENDING' });
    assert(capturedUrl === `/roadmaps/${mockRoadmapId}/tasks`, 'getRoadmapTasks hits GET /roadmaps/:id/tasks');
    assert(capturedParams.status === 'PENDING', 'getRoadmapTasks passes status param');
    assert(res1.data.length === 1, 'getRoadmapTasks returns tasks array');

    const res2 = await roadmapService.getTasks(mockRoadmapId);
    assert(res2.data.length === 1, 'getTasks alias works properly');

    api.get = origGet;
  } catch (err) {
    assert(false, `8. getRoadmapTasks failed: ${err.message}`);
  }

  // 9. Test updateTask
  try {
    let capturedUrl = '';
    let capturedBody = null;
    const origPatch = api.patch;

    api.patch = async (url, body) => {
      capturedUrl = url;
      capturedBody = body;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Learning task updated successfully',
          data: { _id: mockTaskId, estimatedMinutes: 45 },
        },
      };
    };

    const res = await roadmapService.updateTask(mockTaskId, { estimatedMinutes: 45 });
    assert(capturedUrl === `/roadmaps/tasks/${mockTaskId}`, 'updateTask hits PATCH /roadmaps/tasks/:taskId');
    assert(capturedBody.estimatedMinutes === 45, 'updateTask passes body data');
    assert(res.data.estimatedMinutes === 45, 'updateTask returns updated task object');

    api.patch = origPatch;
  } catch (err) {
    assert(false, `9. updateTask failed: ${err.message}`);
  }

  // 10. Test startTask
  try {
    let capturedUrl = '';
    const origPatch = api.patch;

    api.patch = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Learning task started successfully',
          data: { _id: mockTaskId, status: 'IN_PROGRESS' },
        },
      };
    };

    const res = await roadmapService.startTask(mockTaskId);
    assert(capturedUrl === `/roadmaps/tasks/${mockTaskId}/start`, 'startTask hits PATCH /roadmaps/tasks/:taskId/start');
    assert(res.data.status === 'IN_PROGRESS', 'startTask returns IN_PROGRESS status');

    api.patch = origPatch;
  } catch (err) {
    assert(false, `10. startTask failed: ${err.message}`);
  }

  // 11. Test completeTask
  try {
    let capturedUrl = '';
    const origPatch = api.patch;

    api.patch = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Learning task completed successfully',
          data: { task: { _id: mockTaskId, status: 'COMPLETED' }, roadmapProgress: 60 },
        },
      };
    };

    const res = await roadmapService.completeTask(mockTaskId);
    assert(capturedUrl === `/roadmaps/tasks/${mockTaskId}/complete`, 'completeTask hits PATCH /roadmaps/tasks/:taskId/complete');
    assert(res.data.task.status === 'COMPLETED', 'completeTask returns COMPLETED status');
    assert(res.data.roadmapProgress === 60, 'completeTask returns recalculated roadmap progress');

    api.patch = origPatch;
  } catch (err) {
    assert(false, `11. completeTask failed: ${err.message}`);
  }

  // 12. Test skipTask
  try {
    let capturedUrl = '';
    const origPatch = api.patch;

    api.patch = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Learning task skipped',
          data: { task: { _id: mockTaskId, status: 'SKIPPED' } },
        },
      };
    };

    const res = await roadmapService.skipTask(mockTaskId);
    assert(capturedUrl === `/roadmaps/tasks/${mockTaskId}/skip`, 'skipTask hits PATCH /roadmaps/tasks/:taskId/skip');
    assert(res.data.task.status === 'SKIPPED', 'skipTask returns SKIPPED status');

    api.patch = origPatch;
  } catch (err) {
    assert(false, `12. skipTask failed: ${err.message}`);
  }

  // 13. Test reopenTask
  try {
    let capturedUrl = '';
    const origPatch = api.patch;

    api.patch = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Learning task reopened',
          data: { task: { _id: mockTaskId, status: 'PENDING' } },
        },
      };
    };

    const res = await roadmapService.reopenTask(mockTaskId);
    assert(capturedUrl === `/roadmaps/tasks/${mockTaskId}/reopen`, 'reopenTask hits PATCH /roadmaps/tasks/:taskId/reopen');
    assert(res.data.task.status === 'PENDING', 'reopenTask returns PENDING status');

    api.patch = origPatch;
  } catch (err) {
    assert(false, `13. reopenTask failed: ${err.message}`);
  }

  // 14. Test getProgress helper
  try {
    const origGet = api.get;

    api.get = async () => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'Active roadmap retrieved',
        data: {
          roadmap: {
            _id: mockRoadmapId,
            overallProgress: 75,
            status: 'ACTIVE',
            phases: [{ title: 'Phase 1', progress: 100 }, { title: 'Phase 2', progress: 50 }],
          },
        },
      },
    });

    const progressObj = await roadmapService.getProgress();
    assert(progressObj.overallProgress === 75, 'getProgress returns overallProgress = 75');
    assert(progressObj.phases.length === 2, 'getProgress returns phases array');

    api.get = origGet;
  } catch (err) {
    assert(false, `14. getProgress failed: ${err.message}`);
  }

  console.log(`\n=== SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL FRONTEND ROADMAP SERVICE TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME ROADMAP SERVICE TESTS FAILED!');
    process.exit(1);
  }
}

runRoadmapServiceTestSuite();
