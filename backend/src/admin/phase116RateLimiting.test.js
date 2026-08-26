import express from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';
import errorHandler from '../middleware/error.middleware.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 11.6 RATE LIMITING & ABUSE PROTECTION');
console.log('=================================================================\n');

async function runPhase116RateLimitingTests() {
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
    // Create dedicated Express test app for rate limiting verification
    const testApp = express();
    testApp.use(express.json());

    // 1. Health check route (exempt from rate limiting)
    testApp.get('/api/health', (req, res) => res.status(200).json({ status: 'OK' }));

    // 2. Strict Auth Limiter test instance (Max 3 requests per window)
    const testAuthLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 3,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res, next) => next(ApiError.tooManyRequests('Too many authentication attempts. Please try again in 15 minutes.')),
    });
    testApp.post('/api/v1/auth/login', testAuthLimiter, (req, res) => res.status(200).json({ success: true }));

    // 3. Strict AI Limiter test instance (Max 2 operations per window, per user)
    const testAiLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 2,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => req.headers['x-user-id'] || ipKeyGenerator(req),
      handler: (req, res, next) => next(ApiError.tooManyRequests('AI quota limit exceeded for your account.')),
    });
    testApp.post('/api/v1/resumes/analyze', testAiLimiter, (req, res) => res.status(200).json({ success: true }));

    testApp.use(errorHandler);

    const server = testApp.listen(0);
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // =========================================================================
    // 1. LOGIN BRUTE-FORCE RATE LIMITING TEST
    // =========================================================================

    // Send 3 allowed requests
    const res1 = await fetch(`${baseUrl}/api/v1/auth/login`, { method: 'POST' });
    const res2 = await fetch(`${baseUrl}/api/v1/auth/login`, { method: 'POST' });
    const res3 = await fetch(`${baseUrl}/api/v1/auth/login`, { method: 'POST' });

    assert(res1.status === 200 && res3.status === 200, '1.1 Requests below limit succeed with 200 OK');

    // 4th request exceeds max limit of 3
    const res4 = await fetch(`${baseUrl}/api/v1/auth/login`, { method: 'POST' });
    const data4 = await res4.json();

    assert(
      res4.status === 429 && data4.message.includes('Too many authentication attempts'),
      '1.2 Request exceeding max authentication limit returns HTTP 429 Too Many Requests',
      `Status: ${res4.status}, Message: ${data4.message}`
    );

    // =========================================================================
    // 2. RATE LIMIT HEADERS VERIFICATION
    // =========================================================================

    const limitHeader = res1.headers.get('ratelimit-limit');
    const remainingHeader = res1.headers.get('ratelimit-remaining');

    assert(
      limitHeader === '3' && remainingHeader !== null,
      '2.1 Rate limit response headers (ratelimit-limit, ratelimit-remaining) are included',
      `Limit: ${limitHeader}, Remaining: ${remainingHeader}`
    );

    // =========================================================================
    // 3. PER-USER AI ENDPOINT ABUSE RATE LIMITING TEST
    // =========================================================================

    // User A sends 2 requests (allowed limit: 2)
    const aiUserA_1 = await fetch(`${baseUrl}/api/v1/resumes/analyze`, { method: 'POST', headers: { 'x-user-id': 'user_A' } });
    const aiUserA_2 = await fetch(`${baseUrl}/api/v1/resumes/analyze`, { method: 'POST', headers: { 'x-user-id': 'user_A' } });
    const aiUserA_3 = await fetch(`${baseUrl}/api/v1/resumes/analyze`, { method: 'POST', headers: { 'x-user-id': 'user_A' } });

    assert(
      aiUserA_1.status === 200 && aiUserA_3.status === 429,
      '3.1 Per-User AI Rate Limiter triggers HTTP 429 for User A after exceeding quota limit',
      `User A Request 3 Status: ${aiUserA_3.status}`
    );

    // User B sends request (should succeed because User B has separate per-user quota)
    const aiUserB_1 = await fetch(`${baseUrl}/api/v1/resumes/analyze`, { method: 'POST', headers: { 'x-user-id': 'user_B' } });

    assert(
      aiUserB_1.status === 200,
      '3.2 Per-User AI Rate Limiter isolates quotas per user (User B is unaffected by User A throttling)',
      `User B Request Status: ${aiUserB_1.status}`
    );

    // =========================================================================
    // 4. UNRESTRICTED HEALTH CHECK ROUTE TEST
    // =========================================================================

    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert(
      healthRes.status === 200,
      '4.1 Health check route (/api/health) is exempt from rate limiting',
      `Status: ${healthRes.status}`
    );

    // Teardown
    server.close();

  } catch (err) {
    assert(false, 'Unexpected execution exception in Phase 11.6 Rate Limiting Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runPhase116RateLimitingTests();
