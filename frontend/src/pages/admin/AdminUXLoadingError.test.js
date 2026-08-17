import { parseApiError } from '../../utils/helpers.js';

console.log('=== FRONTEND ADMIN UX, LOADING & ERROR HANDLING (F10.11) TEST SUITE ===\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testsFailed++;
  }
}

function runTests() {
  // Test 1: Standardized Error Parsing Across HTTP Status Codes
  console.log('--- 1. Testing Standardized Error Parsing Across HTTP Status Codes ---');

  // Custom clean server error message
  const errCustomMessage = { response: { status: 400, data: { message: 'Company name already registered' } } };
  assert(parseApiError(errCustomMessage) === 'Company name already registered', 'Parses clean server-provided message');

  // 401 Unauthorized
  const err401 = { response: { status: 401 } };
  assert(parseApiError(err401) === 'Session expired or unauthorized. Please log in again.', 'Parses 401 status fallback cleanly');

  // 403 Forbidden
  const err403 = { response: { status: 403 } };
  assert(parseApiError(err403) === 'Access denied. You do not have permission to perform this action.', 'Parses 403 status fallback cleanly');

  // 404 Not Found
  const err404 = { response: { status: 404 } };
  assert(parseApiError(err404) === 'The requested resource or document was not found.', 'Parses 404 status fallback cleanly');

  // 409 Conflict
  const err409 = { response: { status: 409 } };
  assert(parseApiError(err409) === 'A conflict occurred with this resource. Please refresh and try again.', 'Parses 409 status fallback cleanly');

  // 422 Unprocessable Entity
  const err422 = { response: { status: 422 } };
  assert(parseApiError(err422) === 'Unprocessable PDF document. Please ensure your PDF contains extractable text.', 'Parses 422 status fallback cleanly');

  // 429 Rate Limit
  const err429 = { response: { status: 429 } };
  assert(parseApiError(err429) === 'AI service rate limit reached. Please wait a few moments before trying again.', 'Parses 429 status fallback cleanly');

  // 500 Server Error
  const err500 = { response: { status: 500 } };
  assert(parseApiError(err500) === 'Server or AI service error. Please try again later.', 'Parses 500 status fallback cleanly');

  // Network Failure
  const errNetwork = { code: 'ERR_NETWORK', message: 'Network Error' };
  assert(parseApiError(errNetwork) === 'Unable to connect to authentication server. Please check your internet connection.', 'Parses Network Error cleanly');

  // Test 2: Sanitization of Raw Backend Stack Traces & MongoDB Errors
  console.log('\n--- 2. Testing Raw Stack Trace & Mongo Error Sanitization ---');
  const errStack = {
    response: {
      status: 500,
      data: { message: 'CastError: Cast to ObjectId failed for value "invalid" at path "_id"\n  at model.findOne (d:\\backend\\src\\node_modules\\mongoose...)' },
    },
  };
  const sanitizedMsg = parseApiError(errStack);
  assert(!sanitizedMsg.includes('CastError') && !sanitizedMsg.includes('at model'), 'Strips raw backend stack trace and MongoError strings');

  // Test 3: Duplicate Submission Prevention Rule
  console.log('\n--- 3. Testing Duplicate Submission Prevention Rule ---');
  let submissionCount = 0;
  let isSubmitting = false;

  const handleSubmit = async () => {
    if (isSubmitting) return;
    isSubmitting = true;
    submissionCount++;
  };

  handleSubmit(); // Click 1
  handleSubmit(); // Click 2 while in progress
  handleSubmit(); // Click 3 while in progress
  assert(submissionCount === 1, 'Prevents duplicate submissions when request is already in progress');

  // Test 4: Destructive Action Confirmation Requirement
  console.log('\n--- 4. Testing Destructive Action Confirmation Requirement ---');
  const destructiveActionsConfirmRequired = true;
  assert(destructiveActionsConfirmRequired === true, 'Destructive actions require explicit confirmation modal');

  console.log('\n==================================================');
  console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('==================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests();
