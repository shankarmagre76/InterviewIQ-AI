import { roadmapService } from '../../services/roadmapService.js';
import { api } from '../../services/api.js';

console.log('=== F8.2 ROADMAP OVERVIEW TEST SUITE ===\n');

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

async function runRoadmapOverviewTestSuite() {
  const mockRoadmapId = '60d5ecb8b3b3b3b3b3b3b3b3';

  // Test 1: Fetch Active Roadmap Data & Compute Overview Metrics
  try {
    const origGet = api.get;

    api.get = async () => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'Active Learning Roadmap retrieved successfully',
        data: {
          roadmap: {
            _id: mockRoadmapId,
            targetRole: 'Java Full Stack Developer',
            title: 'Your Java Full Stack Roadmap',
            description: 'AI-generated skill progression path.',
            overallProgress: 72,
            status: 'ACTIVE',
            phases: [
              { _id: 'p1', order: 1, title: 'Phase 1: Core Java', progress: 100, status: 'COMPLETED' },
              { _id: 'p2', order: 2, title: 'Phase 2: Spring Security', progress: 50, status: 'IN_PROGRESS' },
            ],
          },
          tasks: [
            { _id: 't1', title: 'Learn Java Fundamentals', status: 'COMPLETED' },
            { _id: 't2', title: 'Build JWT authentication with Spring Security', status: 'IN_PROGRESS', estimatedMinutes: 45 },
            { _id: 't3', title: 'Deploy Docker Containers', status: 'PENDING' },
          ],
        },
      },
    });

    const res = await roadmapService.getActiveRoadmap();
    const data = res.data;
    const roadmap = data.roadmap;
    const tasks = data.tasks;

    const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;
    const remainingTasksCount = tasks.length - completedTasksCount;
    const currentPhase = roadmap.phases.find((p) => p.status !== 'COMPLETED') || roadmap.phases[0];
    const nextTask = tasks.find((t) => t.status === 'IN_PROGRESS' || t.status === 'PENDING');

    assert(roadmap.title === 'Your Java Full Stack Roadmap', 'Roadmap title maps correctly');
    assert(roadmap.targetRole === 'Java Full Stack Developer', 'Target role maps correctly');
    assert(roadmap.overallProgress === 72, 'Overall progress equals 72%');
    assert(roadmap.phases.length === 2, 'Number of phases is 2');
    assert(completedTasksCount === 1, 'Completed tasks count is 1');
    assert(remainingTasksCount === 2, 'Remaining tasks count is 2');
    assert(currentPhase.title === 'Phase 2: Spring Security', 'Current focus phase identified as Phase 2: Spring Security');
    assert(nextTask.title === 'Build JWT authentication with Spring Security', 'Next recommended task identified properly');
    assert(roadmap.status === 'ACTIVE', 'Roadmap status maps to ACTIVE');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  // Test 2: Handle No Active Roadmap State
  try {
    const origGet = api.get;

    api.get = async () => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'No active roadmap found',
        data: null,
      },
    });

    const res = await roadmapService.getActiveRoadmap();
    const roadmap = res?.data?.roadmap || null;
    const showEmptyState = !roadmap;

    assert(showEmptyState === true, 'Empty state triggered when no active roadmap exists');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 2 failed: ${err.message}`);
  }

  console.log(`\n=== OVERVIEW TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL F8.2 ROADMAP OVERVIEW TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME OVERVIEW TESTS FAILED!');
    process.exit(1);
  }
}

runRoadmapOverviewTestSuite();
