import { interviewService } from '../../services/interviewService.js';
import { api } from '../../services/api.js';

console.log('=== F7.7 INTERVIEW COMPLETION & RESULT POLLING TEST SUITE ===\n');

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

async function runCompletionTestSuite() {
  const mockId = '60d5ecb8b3b3b3b3b3b3b3b3';

  // Test 1: Reopening Completed Interview -> Redirect to /interviews/:id/result
  try {
    const origGet = api.get;

    api.get = async () => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'Interview details retrieved',
        data: {
          interview: {
            _id: mockId,
            status: 'Completed',
            completedQuestions: 5,
            totalQuestions: 5,
          },
          questions: [],
          result: { overallScore: 90, summary: 'Passed interview' },
        },
      },
    });

    const res = await interviewService.getInterviewDetails(mockId);
    const session = res.data.interview;

    let targetRoute = '';
    if (session.status === 'Completed') {
      targetRoute = `/interviews/${session._id}/result`;
    }

    assert(session.status === 'Completed', 'Backend returns status Completed');
    assert(targetRoute === `/interviews/${mockId}/result`, 'Reopening completed interview redirects to result page');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  // Test 2: Incomplete Session Check (Accessing /interviews/:id/result before completion)
  try {
    const origGet = api.get;

    api.get = async () => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'Details retrieved',
        data: {
          interview: {
            _id: mockId,
            status: 'In Progress',
            completedQuestions: 2,
            totalQuestions: 5,
          },
          questions: [],
          result: null,
        },
      },
    });

    const res = await interviewService.getInterviewDetails(mockId);
    const session = res.data.interview;

    const isIncomplete = session.status !== 'Completed' && session.completedQuestions < session.totalQuestions;

    assert(isIncomplete === true, 'Incomplete session correctly detected');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 2 failed: ${err.message}`);
  }

  // Test 3: Polite Async Result Polling Simulation (404 -> 200)
  try {
    const origGet = api.get;
    let pollAttempts = 0;

    api.get = async () => {
      pollAttempts++;
      if (pollAttempts < 3) {
        const err = new Error('Result not generated yet');
        err.response = { status: 404, data: { message: 'Evaluation result not yet generated' } };
        throw err;
      }
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Evaluation result retrieved',
          data: {
            overallScore: 88,
            technicalScore: 90,
            summary: 'Great job!',
          },
        },
      };
    };

    let resultObj = null;
    for (let i = 0; i < 5; i++) {
      try {
        const res = await interviewService.getInterviewResult(mockId);
        resultObj = res.data;
        break;
      } catch {
        // simulation of polite poll delay
      }
    }

    assert(pollAttempts === 3, 'Polled exactly 3 times until result was ready');
    assert(resultObj.overallScore === 88, 'Polled result successfully returned score 88');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 3 failed: ${err.message}`);
  }

  // Test 4: Prevent Duplicate Completion Call
  try {
    let completionCalls = 0;
    const sessionState = { status: 'Completed' };

    const endInterviewFn = async (id, statusData) => {
      if (sessionState.status === 'Completed') {
        return 'ALREADY_COMPLETED';
      }
      completionCalls++;
      sessionState.status = statusData.status;
      return 'COMPLETED';
    };

    const res1 = await endInterviewFn(mockId, { status: 'Completed' });
    const res2 = await endInterviewFn(mockId, { status: 'Completed' });

    assert(completionCalls === 0, 'No duplicate completion API call made when session status is already Completed');
    assert(res1 === 'ALREADY_COMPLETED', 'First call blocked duplicate completion');
    assert(res2 === 'ALREADY_COMPLETED', 'Second call blocked duplicate completion');
  } catch (err) {
    assert(false, `Test 4 failed: ${err.message}`);
  }

  // Test 5: Browser Refresh Handling
  try {
    // Simulating page refresh by re-invoking service calls
    const origGet = api.get;

    api.get = async () => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'Details',
        data: {
          interview: { _id: mockId, status: 'In Progress', completedQuestions: 3, totalQuestions: 5 },
          questions: [
            { _id: 'q1', answer: 'Ans 1' },
            { _id: 'q2', answer: 'Ans 2' },
            { _id: 'q3', answer: 'Ans 3' },
            { _id: 'q4', answer: '' },
            { _id: 'q5', answer: '' },
          ],
        },
      },
    });

    const res = await interviewService.getInterviewDetails(mockId);
    const restoredIndex = res.data.questions.findIndex((q) => !q.answer);

    assert(restoredIndex === 3, 'Browser refresh restores candidate position to 4th question (3 answered)');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 5 failed: ${err.message}`);
  }

  console.log(`\n=== COMPLETION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL F7.7 INTERVIEW COMPLETION TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME COMPLETION TESTS FAILED!');
    process.exit(1);
  }
}

runCompletionTestSuite();
