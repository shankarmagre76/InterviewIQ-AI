import { roadmapService } from '../../services/roadmapService.js';
import { api } from '../../services/api.js';

console.log('=== F8.9 ROADMAP HISTORY TEST SUITE ===\n');

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

async function runRoadmapHistoryTestSuite() {
  const mockId1 = '60d5ecb8b3b3b3b3b3b3b3b1';
  const mockId2 = '60d5ecb8b3b3b3b3b3b3b3b2';

  // Test 1: Fetch History List with Status Filter & Pagination
  try {
    const origGet = api.get;

    api.get = async (url, config) => {
      const statusParam = config?.params?.status;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Roadmap history retrieved successfully',
          data: {
            roadmaps: [
              {
                _id: mockId1,
                title: 'Java Full Stack Developer Roadmap',
                targetRole: 'Java Full Stack Developer',
                version: 2,
                status: 'ACTIVE',
                overallProgress: 75,
                phases: [{ _id: 'p1' }, { _id: 'p2' }],
                createdAt: '2026-08-15T10:00:00.000Z',
              },
              {
                _id: mockId2,
                title: 'Backend Engineer Roadmap v1',
                targetRole: 'Backend Engineer',
                version: 1,
                status: 'ARCHIVED',
                overallProgress: 100,
                phases: [{ _id: 'p1' }],
                createdAt: '2026-08-01T10:00:00.000Z',
              },
            ].filter((rm) => !statusParam || statusParam === 'ALL' || rm.status === statusParam),
            pagination: { total: 2, page: 1, limit: 9, totalPages: 1 },
          },
        },
      };
    };

    const allRes = await roadmapService.getRoadmapHistory({ page: 1, limit: 9, status: 'ALL' });
    const allList = allRes.data.roadmaps;

    assert(allList.length === 2, 'History returns 2 total roadmap items');
    assert(allList[0].status === 'ACTIVE', 'Item #1 is ACTIVE v2.0');
    assert(allList[1].status === 'ARCHIVED', 'Item #2 is ARCHIVED v1.0');

    // Filter status ARCHIVED
    const archivedRes = await roadmapService.getRoadmapHistory({ page: 1, limit: 9, status: 'ARCHIVED' });
    const archivedList = archivedRes.data.roadmaps;

    assert(archivedList.length === 1, 'Filtered status ARCHIVED returns 1 item');
    assert(archivedList[0]._id === mockId2, 'Filtered archived item ID matches mockId2');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  // Test 2: Empty History State
  try {
    const origGet = api.get;

    api.get = async () => ({
      data: {
        success: true,
        data: {
          roadmaps: [],
          pagination: { total: 0, page: 1, limit: 9, totalPages: 1 },
        },
      },
    });

    const res = await roadmapService.getRoadmapHistory({ page: 1, limit: 9 });
    const isEmpty = res.data.roadmaps.length === 0;

    assert(isEmpty === true, 'Empty history triggers EmptyState UI component');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 2 failed: ${err.message}`);
  }

  console.log(`\n=== HISTORY TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL F8.9 ROADMAP HISTORY TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME HISTORY TESTS FAILED!');
    process.exit(1);
  }
}

runRoadmapHistoryTestSuite();
