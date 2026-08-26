import express from 'express';
import requestIdMiddleware from '../middleware/requestId.middleware.js';
import errorHandler from '../middleware/error.middleware.js';
import ApiError from '../utils/ApiError.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 11.9 ERROR HANDLING, LOGGING & MONITORING');
console.log('=================================================================\n');

async function runPhase119ErrorHandlingLoggingTests() {
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
    const testApp = express();
    testApp.use(express.json());
    testApp.use(requestIdMiddleware);

    // Route 1: Throws operational ApiError
    testApp.get('/test/bad-request', (req, res, next) => {
      next(ApiError.badRequest('Invalid parameter supplied'));
    });

    // Route 2: Throws unexpected programming Exception
    testApp.get('/test/uncaught-error', (req, res, next) => {
      next(new Error('Internal database memory corruption secret_pass=super_secret'));
    });

    // Route 3: Throws JWT error
    testApp.get('/test/jwt-error', (req, res, next) => {
      const jwtErr = new Error('invalid signature');
      jwtErr.name = 'JsonWebTokenError';
      next(jwtErr);
    });

    testApp.use(errorHandler);

    const server = testApp.listen(0);
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // =========================================================================
    // 1. CORRELATION REQUEST ID & OPERATIONAL ERROR TEST
    // =========================================================================

    const reqIdRes = await fetch(`${baseUrl}/test/bad-request`, {
      headers: { 'X-Request-ID': 'test-correlation-id-12345' },
    });
    const reqIdData = await reqIdRes.json();

    const returnedHeader = reqIdRes.headers.get('x-request-id');
    assert(
      reqIdRes.status === 400 && returnedHeader === 'test-correlation-id-12345' && reqIdData.requestId === 'test-correlation-id-12345',
      '1.1 Request correlation ID (X-Request-ID) is echoed in response headers and error payload',
      `Header: ${returnedHeader}, Payload ReqID: ${reqIdData.requestId}`
    );

    // =========================================================================
    // 2. PRODUCTION ERROR RESPONSE CONCEALMENT TEST
    // =========================================================================

    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const prodErrRes = await fetch(`${baseUrl}/test/uncaught-error`);
    const prodErrData = await prodErrRes.json();

    assert(
      prodErrRes.status === 500 &&
      prodErrData.stack === undefined &&
      prodErrData.message.includes('internal server error') &&
      !JSON.stringify(prodErrData).includes('super_secret'),
      '2.1 Production environment suppresses stack traces and conceals internal programming error details',
      `Status: ${prodErrRes.status}, Message: ${prodErrData.message}`
    );

    process.env.NODE_ENV = origEnv;

    // =========================================================================
    // 3. JWT ERROR MAPPING TEST
    // =========================================================================

    const jwtRes = await fetch(`${baseUrl}/test/jwt-error`);
    const jwtData = await jwtRes.json();

    assert(
      jwtRes.status === 401 && jwtData.message.includes('signature'),
      '3.1 JsonWebTokenError is intercepted and mapped to HTTP 401 Unauthorized with clean message',
      `Status: ${jwtRes.status}, Message: ${jwtData.message}`
    );

    // Teardown
    server.close();

  } catch (err) {
    assert(false, 'Unexpected execution exception in Phase 11.9 Error Handling Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runPhase119ErrorHandlingLoggingTests();
