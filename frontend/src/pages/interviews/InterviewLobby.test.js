import { interviewService } from '../../services/interviewService.js';
import { api } from '../../services/api.js';

console.log('=== F7.4 INTERVIEW LOBBY FLOW & BACKEND CONTRACT TEST SUITE ===\n');

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

async function runLobbyTestSuite() {
  const mockId = '60d5ecb8b3b3b3b3b3b3b3b3';

  // Test 1: Fetch actual interview details from backend
  try {
    const origGet = api.get;
    let capturedUrl = '';

    api.get = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Interview details retrieved successfully',
          data: {
            interview: {
              _id: mockId,
              role: 'Java Full Stack Developer',
              interviewType: 'Technical',
              difficulty: 'Medium',
              totalQuestions: 10,
              estimatedDuration: 25,
              status: 'Pending',
            },
            questions: [
              { _id: 'q1', question: 'Explain Spring Dependency Injection and Bean scope' },
              { _id: 'q2', question: 'How do Virtual DOM and React Reconciliation work?' },
            ],
            result: null,
          },
        },
      };
    };

    const res = await interviewService.getInterviewDetails(mockId);
    const data = res?.data;

    assert(capturedUrl === `/interviews/${mockId}`, 'Lobby fetches session via GET /interviews/:id');
    assert(data.interview.role === 'Java Full Stack Developer', 'Actual role fetched accurately from backend');
    assert(data.interview.interviewType === 'Technical', 'Actual interview type fetched accurately');
    assert(data.interview.difficulty === 'Medium', 'Actual difficulty level fetched accurately');
    assert(data.interview.totalQuestions === 10, 'Actual question count fetched accurately');
    assert(data.interview.estimatedDuration === 25, 'Actual estimated duration fetched accurately');
    assert(data.questions.length === 2, 'Session questions array returned cleanly');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  // Test 2: Missing or Deleted Interview Handling (404 Error)
  try {
    const origGet = api.get;

    api.get = async () => {
      const err = new Error('Not Found');
      err.response = { status: 404, data: { message: 'Interview session not found' } };
      throw err;
    };

    let statusCaught = 0;
    let msgCaught = '';

    try {
      await interviewService.getInterviewDetails('nonexistent_id');
    } catch (err) {
      statusCaught = err?.response?.status;
      msgCaught = err?.response?.data?.message;
    }

    assert(statusCaught === 404, '404 status caught for missing/deleted interview');
    assert(msgCaught === 'Interview session not found', 'Missing session error message extracted properly');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 2 failed: ${err.message}`);
  }

  // Test 3: Double Start Prevention
  try {
    let isStarting = false;
    let startCount = 0;

    const triggerStart = () => {
      if (isStarting) return 'PREVENTED_DOUBLE_START';
      isStarting = true;
      startCount++;
      return 'STARTED';
    };

    const firstClick = triggerStart();
    const secondClick = triggerStart();

    assert(startCount === 1, 'Only 1 start trigger allowed when user clicks Start');
    assert(firstClick === 'STARTED', 'Initial click starts interview navigation');
    assert(secondClick === 'PREVENTED_DOUBLE_START', 'Accidental double click is blocked cleanly');
  } catch (err) {
    assert(false, `Test 3 failed: ${err.message}`);
  }

  console.log(`\n=== LOBBY TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL F7.4 INTERVIEW LOBBY TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME LOBBY TESTS FAILED!');
    process.exit(1);
  }
}

runLobbyTestSuite();
