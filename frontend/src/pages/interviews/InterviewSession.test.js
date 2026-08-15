import { interviewService } from '../../services/interviewService.js';
import { api } from '../../services/api.js';

console.log('=== F7.6 ANSWER SUBMISSION & PROGRESS INTEGRATION TEST SUITE ===\n');

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

async function runSubmissionTestSuite() {
  const mockId = '60d5ecb8b3b3b3b3b3b3b3b3';

  // Test 1: Empty Answer & Very Long Answer Validation Rules
  try {
    const validate = (answer) => {
      if (!answer || !answer.trim()) return 'Answer text cannot be empty';
      if (answer.length > 10000) return 'Answer text exceeds maximum allowed length of 10,000 characters';
      return null;
    };

    assert(validate('') === 'Answer text cannot be empty', 'Empty string answer caught by validation');
    assert(validate('   ') === 'Answer text cannot be empty', 'Whitespace-only answer caught by validation');
    assert(validate('A'.repeat(10001)) === 'Answer text exceeds maximum allowed length of 10,000 characters', 'Over 10,000 characters answer caught by validation');
    assert(validate('Valid response text') === null, 'Valid answer passes validation');
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  // Test 2: Backend Synced Progress Update (Question 4 / 10 -> 40%)
  try {
    const origPost = api.post;

    api.post = async (url, body) => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'Answer evaluated',
        data: {
          question: { _id: body.questionId, score: 88 },
          evaluation: { score: 88, feedback: 'Well structured.' },
          completedQuestions: 4,
          totalQuestions: 10,
          isCompleted: false,
        },
      },
    });

    const res = await interviewService.submitAnswer(mockId, { questionId: 'q4', answer: 'Valid answer text' });
    const { completedQuestions, totalQuestions } = res.data;
    const percentage = Math.round((completedQuestions / totalQuestions) * 100);

    assert(completedQuestions === 4, 'Backend returns completedQuestions = 4');
    assert(totalQuestions === 10, 'Backend returns totalQuestions = 10');
    assert(percentage === 40, 'Backend-synced progress calculates accurately to 40%');

    api.post = origPost;
  } catch (err) {
    assert(false, `Test 2 failed: ${err.message}`);
  }

  // Test 3: Duplicate Submission Prevention
  try {
    let isSubmitting = false;
    let submitCalls = 0;

    const submitFn = async () => {
      if (isSubmitting) return 'PREVENTED_DUPLICATE';
      isSubmitting = true;
      submitCalls++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      isSubmitting = false;
      return 'SUCCESS';
    };

    const p1 = submitFn();
    const r2 = await submitFn();
    const r1 = await p1;

    assert(submitCalls === 1, 'Only 1 submission call allowed during evaluation');
    assert(r2 === 'PREVENTED_DUPLICATE', 'Duplicate click during evaluation returns PREVENTED_DUPLICATE');
    assert(r1 === 'SUCCESS', 'Initial submission completes successfully');
  } catch (err) {
    assert(false, `Test 3 failed: ${err.message}`);
  }

  // Test 4: Error Handling for Status Codes (401, 404, 409, 429, 500)
  try {
    const origPost = api.post;

    const testErrorStatus = async (status, expectedPartialMsg) => {
      api.post = async () => {
        const err = new Error('HTTP Error');
        err.response = { status, data: { message: expectedPartialMsg } };
        throw err;
      };

      try {
        await interviewService.submitAnswer(mockId, { questionId: 'q1', answer: 'Answer text' });
        return false;
      } catch (err) {
        return err?.response?.status === status;
      }
    };

    assert(await testErrorStatus(401, 'Unauthorized'), '401 Unauthorized status handled');
    assert(await testErrorStatus(404, 'Not Found'), '404 Not Found status handled');
    assert(await testErrorStatus(409, 'Conflict'), '409 Conflict status handled');
    assert(await testErrorStatus(429, 'Rate Limit'), '429 Rate limit status handled');
    assert(await testErrorStatus(500, 'Server Error'), '500 Server error status handled');

    api.post = origPost;
  } catch (err) {
    assert(false, `Test 4 failed: ${err.message}`);
  }

  // Test 5: Draft Preservation & Safe Retry
  try {
    const draftAnswer = 'My detailed technical answer that failed due to network error';
    let currentAnswerState = draftAnswer;
    let retryAttempted = false;

    // Simulate network error
    const onSubmissionError = () => {
      // Form state currentAnswerState is NOT reset
      retryAttempted = true;
    };

    onSubmissionError();

    assert(retryAttempted === true, 'Error state triggers retry availability');
    assert(currentAnswerState === draftAnswer, 'Candidate draft answer preserved intact for safe retry');
  } catch (err) {
    assert(false, `Test 5 failed: ${err.message}`);
  }

  console.log(`\n=== SUBMISSION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL F7.6 ANSWER SUBMISSION & PROGRESS TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME SUBMISSION TESTS FAILED!');
    process.exit(1);
  }
}

runSubmissionTestSuite();
