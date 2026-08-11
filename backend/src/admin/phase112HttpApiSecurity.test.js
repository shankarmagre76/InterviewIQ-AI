import express from 'express';
import app from '../app.js';
import User from '../models/User.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 11.2 HTTP & API SECURITY TEST SUITE');
console.log('=================================================================\n');

async function runPhase112HttpSecurityTests() {
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
    // Stub User.findOne for auth test
    const origUserFindOne = User.findOne;
    User.findOne = (query = {}) => ({
      select: () => null,
      then: (resolve) => resolve(null),
    });

    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // =========================================================================
    // 1. VERIFY SECURITY HTTP HEADERS
    // =========================================================================

    const healthRes = await fetch(`${baseUrl}/api/health`);
    const headers = healthRes.headers;

    // 1.1 X-Powered-By Header is disabled
    const xPoweredBy = headers.get('x-powered-by');
    assert(xPoweredBy === null, '1.1 X-Powered-By header is disabled and absent from responses');

    // 1.2 X-Content-Type-Options: nosniff
    const nosniff = headers.get('x-content-type-options');
    assert(nosniff === 'nosniff', '1.2 X-Content-Type-Options header is set to nosniff', `Header: ${nosniff}`);

    // 1.3 X-Frame-Options: SAMEORIGIN
    const frameOptions = headers.get('x-frame-options');
    assert(frameOptions === 'SAMEORIGIN', '1.3 X-Frame-Options header is set to SAMEORIGIN', `Header: ${frameOptions}`);

    // =========================================================================
    // 2. VERIFY CORS BEHAVIOR
    // =========================================================================

    const corsOriginHeader = { Origin: 'http://localhost:3000' };
    const corsRes = await fetch(`${baseUrl}/api/health`, { headers: corsOriginHeader });
    const allowOrigin = corsRes.headers.get('access-control-allow-origin');
    const allowCredentials = corsRes.headers.get('access-control-allow-credentials');

    assert(
      allowOrigin === 'http://localhost:3000' && allowCredentials === 'true',
      '2.1 Allowed origin returns matching CORS Access-Control-Allow-Origin & Credentials headers',
      `AllowOrigin: ${allowOrigin}, AllowCredentials: ${allowCredentials}`
    );

    // =========================================================================
    // 3. VERIFY OVERSIZED PAYLOAD BEHAVIOR (HTTP 413)
    // =========================================================================

    // Generate heavy JSON payload > 1MB
    const heavyString = 'A'.repeat(1.5 * 1024 * 1024); // 1.5MB
    const heavyPayload = JSON.stringify({ email: 'test@example.com', data: heavyString });

    const oversizedRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: heavyPayload,
    });

    const oversizedData = await oversizedRes.json().catch(() => ({}));
    assert(
      oversizedRes.status === 413 && oversizedData.message.includes('Payload Too Large'),
      '3.1 Oversized JSON payload (>1MB) returns HTTP 413 Payload Too Large',
      `Status: ${oversizedRes.status}, Message: ${oversizedData.message}`
    );

    // =========================================================================
    // 4. VERIFY NORMAL AUTHENTICATION & API REQUEST BEHAVIOR
    // =========================================================================

    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    assert(
      loginRes.status === 400 || loginRes.status === 401 || loginRes.status === 200,
      '4.1 Normal authentication API request responds with expected HTTP status code without server crash',
      `Status: ${loginRes.status}`
    );

    const normalHealthRes = await fetch(`${baseUrl}/api/health`);
    assert(normalHealthRes.status === 200, '4.2 Normal API request responds with HTTP 200 OK');

    // Teardown server & restore stubs
    server.close();
    User.findOne = origUserFindOne;

  } catch (err) {
    assert(false, 'Unexpected execution exception in Phase 11.2 Security Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runPhase112HttpSecurityTests();
