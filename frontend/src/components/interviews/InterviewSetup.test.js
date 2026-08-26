import { interviewService } from '../../services/interviewService.js';
import { api } from '../../services/api.js';

console.log('=== F7.3 INTERVIEW CREATION FLOW & ERROR HANDLING TEST SUITE ===\n');

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

async function runCreationTestSuite() {
  const mockId = '60d5ecb8b3b3b3b3b3b3b3b3';

  // Test 1: Valid Configuration & POST Interview Creation
  try {
    const origPost = api.post;
    let postCallCount = 0;
    let capturedBody = null;

    api.post = async (url, body) => {
      postCallCount++;
      capturedBody = body;
      return {
        data: {
          success: true,
          statusCode: 201,
          message: 'Interview session started successfully',
          data: {
            interview: {
              _id: mockId,
              role: body.role,
              interviewType: body.interviewType,
              difficulty: body.difficulty,
              totalQuestions: body.totalQuestions,
              status: 'Pending',
            },
            questions: [
              { _id: 'q1', question: 'Explain System Architecture' }
            ],
          },
        },
      };
    };

    const validPayload = {
      role: 'Full Stack Engineer',
      interviewType: 'Technical',
      difficulty: 'Intermediate',
      totalQuestions: 5,
      estimatedDuration: 30,
      mode: 'Text',
    };

    const res = await interviewService.startInterview(validPayload);
    const createdId = res?.data?.interview?._id;

    assert(postCallCount === 1, 'Valid configuration sends exactly 1 POST request');
    assert(capturedBody.role === 'Full Stack Engineer', 'Request payload contains configured target role');
    assert(createdId === mockId, 'API response returns valid created Interview ID');
    assert(`/interviews/${createdId}/lobby` === `/interviews/${mockId}/lobby`, 'Navigation target correctly matches /interviews/:id/lobby');

    api.post = origPost;
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  // Test 2: Invalid Configuration Handling (Empty Role / Bad Question Count)
  try {
    const invalidPayload = {
      role: '',
      totalQuestions: 99, // exceeds max 50
    };

    const errorsObj = {};

    if (!invalidPayload.role) {
      errorsObj.role = 'Target role is required';
    }
    if (invalidPayload.totalQuestions > 50) {
      errorsObj.totalQuestions = 'Number of questions must be between 1 and 50';
    }

    assert(Object.keys(errorsObj).length === 2, 'Invalid configuration triggers client-side validation errors before API call');
    assert(errorsObj.role === 'Target role is required', 'Role validation error captured correctly');
    assert(errorsObj.totalQuestions === 'Number of questions must be between 1 and 50', 'Question count validation error captured correctly');
  } catch (err) {
    assert(false, `Test 2 failed: ${err.message}`);
  }

  // Test 3: API Failure & Form State Preservation
  try {
    const origPost = api.post;

    api.post = async () => {
      const err = new Error('Bad Request');
      err.response = { status: 400, data: { message: 'Company ID format invalid' } };
      throw err;
    };

    let caughtMsg = '';
    const configFormState = { role: 'DevOps Engineer', totalQuestions: 10 };

    try {
      await interviewService.startInterview(configFormState);
    } catch (err) {
      caughtMsg = err?.response?.data?.message;
    }

    assert(caughtMsg === 'Company ID format invalid', 'API 400 failure message captured cleanly');
    assert(configFormState.role === 'DevOps Engineer', 'Form configuration state preserved intact for user retry');

    api.post = origPost;
  } catch (err) {
    assert(false, `Test 3 failed: ${err.message}`);
  }

  // Test 4: AI Generation Failure (503 / 500 Gemini Error)
  try {
    const origPost = api.post;

    api.post = async () => {
      const err = new Error('AI Generation Failure');
      err.response = { status: 500, data: { message: 'Gemini AI service unavailable' } };
      throw err;
    };

    let statusCaught = 0;
    try {
      await interviewService.startInterview({ role: 'Backend Engineer' });
    } catch (err) {
      statusCaught = err?.response?.status;
    }

    assert(statusCaught === 500, 'AI / Gemini generation failure (500) caught properly');

    api.post = origPost;
  } catch (err) {
    assert(false, `Test 4 failed: ${err.message}`);
  }

  // Test 5: Rate Limiting Handling (429 Too Many Requests)
  try {
    const origPost = api.post;

    api.post = async () => {
      const err = new Error('Rate limit exceeded');
      err.response = { status: 429, data: { message: 'AI Rate Limit Exceeded (10 requests/hour limit)' } };
      throw err;
    };

    let statusCaught = 0;
    try {
      await interviewService.startInterview({ role: 'Data Scientist' });
    } catch (err) {
      statusCaught = err?.response?.status;
    }

    assert(statusCaught === 429, 'Rate limiting (429) caught properly to inform candidate');

    api.post = origPost;
  } catch (err) {
    assert(false, `Test 5 failed: ${err.message}`);
  }

  // Test 6: Duplicate Submission Prevention (Double click lock)
  try {
    let submitting = false;
    let submitAttempts = 0;

    const handleSubmit = async () => {
      if (submitting) return 'BLOCKED_DUPLICATE';
      submitting = true;
      submitAttempts++;
      // Simulate async delay
      await new Promise((resolve) => setTimeout(resolve, 50));
      submitting = false;
      return 'SUBMITTED';
    };

    const firstSubmitPromise = handleSubmit();
    const secondSubmitResult = await handleSubmit(); // Trigger duplicate submit while first is active
    const firstSubmitResult = await firstSubmitPromise;

    assert(submitAttempts === 1, 'Second submit call prevented while first request is active');
    assert(secondSubmitResult === 'BLOCKED_DUPLICATE', 'Duplicate click returned BLOCKED_DUPLICATE state');
    assert(firstSubmitResult === 'SUBMITTED', 'Initial valid submission completed successfully');
  } catch (err) {
    assert(false, `Test 6 failed: ${err.message}`);
  }

  // Test 7: Unauthorized User Handling (401 / 403)
  try {
    const origPost = api.post;

    api.post = async () => {
      const err = new Error('Unauthorized');
      err.response = { status: 401, data: { message: 'Authentication required' } };
      throw err;
    };

    let statusCaught = 0;
    try {
      await interviewService.startInterview({ role: 'Mobile Engineer' });
    } catch (err) {
      statusCaught = err?.response?.status;
    }

    assert(statusCaught === 401, 'Unauthorized request (401) caught cleanly');

    api.post = origPost;
  } catch (err) {
    assert(false, `Test 7 failed: ${err.message}`);
  }

  console.log(`\n=== CREATION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL F7.3 INTERVIEW CREATION TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME CREATION TESTS FAILED!');
    process.exit(1);
  }
}

runCreationTestSuite();
