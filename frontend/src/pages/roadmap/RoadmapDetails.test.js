import { roadmapService } from '../../services/roadmapService.js';
import { api } from '../../services/api.js';

console.log('=== F8.8 ROADMAP DETAILS TEST SUITE ===\n');

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

async function runRoadmapDetailsTestSuite() {
  const mockId = '60d5ecb8b3b3b3b3b3b3b3b3';

  // Test 1: Fetch Roadmap Details & Verify Hierarchy Tree
  try {
    const origGet = api.get;

    api.get = async () => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'Learning Roadmap retrieved successfully',
        data: {
          roadmap: {
            _id: mockId,
            targetRole: 'Senior Java Architect',
            title: 'Senior Java Architect Learning Roadmap',
            description: 'Advanced curriculum covering Spring Cloud & Microservices.',
            skillGaps: ['Kubernetes', 'Kafka', 'GraphQL'],
            overallProgress: 60,
            status: 'ACTIVE',
            phases: [
              {
                _id: 'p1',
                order: 1,
                title: 'Phase 1: Cloud Architecture',
                description: 'Microservices design & Docker containers',
                priority: 'HIGH',
                estimatedDays: 14,
                progress: 100,
                status: 'COMPLETED',
              },
            ],
          },
          tasks: [
            {
              _id: 't1',
              phase: 'p1',
              title: 'Learn Docker Multi-stage Builds',
              description: 'Create slim production container images',
              type: 'PRACTICE',
              priority: 'HIGH',
              estimatedMinutes: 60,
              status: 'COMPLETED',
              resources: [
                { title: 'Docker Official Documentation', url: 'https://docs.docker.com', type: 'DOCUMENTATION' },
              ],
            },
          ],
        },
      },
    });

    const res = await roadmapService.getRoadmapById(mockId);
    const data = res.data;
    const roadmap = data.roadmap;
    const tasks = data.tasks;

    assert(roadmap.title === 'Senior Java Architect Learning Roadmap', 'Roadmap title maps correctly');
    assert(roadmap.targetRole === 'Senior Java Architect', 'Target role maps correctly');
    assert(roadmap.skillGaps.length === 3, 'Skill gaps array contains 3 targeted items');
    assert(roadmap.phases.length === 1, 'Hierarchy level 2 (Phase) populated');
    assert(tasks.length === 1, 'Hierarchy level 3 (Task) populated');
    assert(tasks[0].resources.length === 1, 'Hierarchy level 4 (Resource) populated');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  // Test 2: Handle Invalid Roadmap ID (404 Error)
  try {
    const origGet = api.get;

    api.get = async () => {
      const err = new Error('Not Found');
      err.response = { status: 404, data: { message: 'Learning roadmap with ID invalidId not found' } };
      throw err;
    };

    let caughtStatus = 0;
    try {
      await roadmapService.getRoadmapById('invalidId');
    } catch (err) {
      caughtStatus = err?.response?.status;
    }

    assert(caughtStatus === 404, 'Invalid/deleted roadmap ID returns 404 status handled by ErrorState');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 2 failed: ${err.message}`);
  }

  // Test 3: Handle Archived Roadmap Status
  try {
    const origGet = api.get;

    api.get = async () => ({
      data: {
        success: true,
        data: {
          roadmap: { _id: mockId, title: 'Archived Roadmap', status: 'ARCHIVED' },
          tasks: [],
        },
      },
    });

    const res = await roadmapService.getRoadmapById(mockId);
    const isArchived = res.data.roadmap.status === 'ARCHIVED';

    assert(isArchived === true, 'Archived status detected triggering warning banner');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 3 failed: ${err.message}`);
  }

  console.log(`\n=== DETAILS TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL F8.8 ROADMAP DETAILS TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME DETAILS TESTS FAILED!');
    process.exit(1);
  }
}

runRoadmapDetailsTestSuite();
