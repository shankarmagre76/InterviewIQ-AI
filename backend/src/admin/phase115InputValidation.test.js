import app from '../app.js';
import User from '../models/User.js';
import jobRepository from '../job/job.repository.js';
import { generateAccessToken } from '../utils/jwt.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 11.5 INPUT VALIDATION & INJECTION TEST');
console.log('=================================================================\n');

async function runPhase115InputValidationTests() {
  let passedCount = 0;
  let failedCount = 0;

  const assert = (condition, testName, detail = '') => {
    if (condition) {
      passedCount++;
      console.log(`[PASS] ${testName}`);
    } else {
      failedCount++;
      console.error(`[FAIL] ${testName} - ${detail}`);
    }
  };

  try {
    const studentId = '6a7b77777777777777777777';
    const studentToken = generateAccessToken({ id: studentId, role: 'Student' });
    const mockStudent = { _id: studentId, id: studentId, role: 'Student', isActive: true, toJSON: () => ({ id: studentId }) };

    // Stub User.findById & jobRepository.searchJobs
    const origUserFindById = User.findById;
    const origJobRepoSearchJobs = jobRepository.searchJobs;

    User.findById = async (id) => (id?.toString() === studentId ? mockStudent : null);
    jobRepository.searchJobs = async (filter, options) => ({
      jobs: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    });

    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // =========================================================================
    // 1. NOSQL OPERATOR INJECTION IN BODY PAYLOADS ($ne, $gt)
    // =========================================================================

    const noSqlBodyRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: { $gt: '' }, password: { $ne: null } }),
    });

    // express-mongo-sanitize strips keys starting with $ from req.body, turning body into { email: {}, password: {} }, failing validation cleanly with 400
    assert(
      noSqlBodyRes.status === 400 || noSqlBodyRes.status === 401,
      '1.1 NoSQL operator payload ({ $gt: "", $ne: null }) is sanitized and rejected safely with 400/401',
      `Status: ${noSqlBodyRes.status}`
    );

    // =========================================================================
    // 2. UNESCAPED REGEX SEARCH INPUT (ReDoS & Special Regex Chars)
    // =========================================================================

    const regexAbuseRes = await fetch(`${baseUrl}/api/v1/jobs?search=${encodeURIComponent('.*.*.*.*.*(C++\\')}`);
    assert(
      regexAbuseRes.status === 200 || regexAbuseRes.status === 400,
      '2.1 Unescaped Regex search string (.*.*.*.*.*(C++\\) is safely sanitized without throwing server exceptions',
      `Status: ${regexAbuseRes.status}`
    );

    // =========================================================================
    // 3. MALFORMED MONGODB OBJECTID PARAMETERS
    // =========================================================================

    const invalidIdRes = await fetch(`${baseUrl}/api/v1/jobs/not-a-valid-mongo-id`);
    const invalidIdData = await invalidIdRes.json();

    assert(
      invalidIdRes.status === 400 && invalidIdData.message.includes('Invalid'),
      '3.1 Malformed MongoDB ObjectId is caught by validation middleware and returns 400 Bad Request',
      `Status: ${invalidIdRes.status}, Message: ${invalidIdData.message}`
    );

    // =========================================================================
    // 4. OVERSIZED STRING PAYLOADS (Length validation limits)
    // =========================================================================

    const longStringPayload = {
      firstName: 'A'.repeat(1000), // Max allowed 50
      lastName: 'User',
      email: 'testlong@example.com',
      password: 'Password123!',
    };

    const longStringRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(longStringPayload),
    });

    const longStringData = await longStringRes.json();
    assert(
      longStringRes.status === 400 && Array.isArray(longStringData.errors),
      '4.1 Oversized input string (>50 chars on firstName) is caught by express-validator with 400 Bad Request',
      `Status: ${longStringRes.status}`
    );

    // Teardown
    server.close();
    User.findById = origUserFindById;
    jobRepository.searchJobs = origJobRepoSearchJobs;

  } catch (err) {
    assert(false, 'Unexpected execution exception in Phase 11.5 Input Validation Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runPhase115InputValidationTests();
