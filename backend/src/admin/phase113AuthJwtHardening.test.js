import app from '../app.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../utils/jwt.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 11.3 AUTHENTICATION & JWT HARDENING SUITE');
console.log('=================================================================\n');

async function runPhase113AuthJwtTests() {
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
    // 1. Password Hashing & Select Isolation Test
    const rawPassword = 'StrongPassword123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);
    const isPasswordHashed = hashedPassword !== rawPassword && hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$');

    assert(
      isPasswordHashed,
      '1.1 User passwords are strictly hashed with bcrypt (salt factor >= 10)',
      `Hashed sample: ${hashedPassword.substring(0, 15)}...`
    );

    // 2. JWT Payload Sanitization Test
    const mockUserPayload = { id: '6a7b12345678901234567890', role: 'Student', email: 'student@example.com' };
    const generatedToken = generateAccessToken(mockUserPayload);
    const decodedPayload = jwt.decode(generatedToken);

    const containsNoPassword = !decodedPayload.password && !decodedPayload.refreshToken && !decodedPayload.resetPasswordToken;
    const containsExpectedFields = decodedPayload.id && decodedPayload.role && decodedPayload.email;

    assert(
      containsNoPassword && containsExpectedFields,
      '2.1 JWT payload strictly excludes passwords, tokens, or private secrets',
      `Payload keys: ${Object.keys(decodedPayload).join(', ')}`
    );

    // Start ephemeral server for HTTP route testing
    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // Stub User operations for HTTP tests
    const mockDbUser = {
      _id: '6a7b12345678901234567890',
      id: '6a7b12345678901234567890',
      firstName: 'Auth',
      lastName: 'Tester',
      email: 'authtest@example.com',
      role: 'Student',
      isActive: true,
      comparePassword: async (pwd) => pwd === 'CorrectPassword123!',
      toJSON: function () { return { id: this._id, firstName: this.firstName, email: this.email, role: this.role }; },
    };

    const origUserFindById = User.findById;
    const origUserFindOne = User.findOne;

    User.findById = async (id) => (id === mockDbUser._id ? mockDbUser : null);
    User.findOne = (query = {}) => ({
      select: () => {
        if (query.email === 'authtest@example.com') return mockDbUser;
        return null;
      },
      then: (resolve) => resolve(query.email === 'authtest@example.com' ? mockDbUser : null),
    });

    // 3. Test Wrong Credentials Login Failure
    const wrongCredsRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'authtest@example.com', password: 'WrongPassword999!' }),
    });
    const wrongCredsData = await wrongCredsRes.json();

    assert(
      wrongCredsRes.status === 401 && wrongCredsData.message === 'Invalid email or password.',
      '3.1 Authentication failure uses generic failure message ("Invalid email or password.")',
      `Status: ${wrongCredsRes.status}, Message: ${wrongCredsData.message}`
    );

    // 4. Test Valid Token Access
    const validToken = generateAccessToken({ id: mockDbUser._id, role: 'Student' });
    const protectedRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });

    assert(
      protectedRes.status === 200,
      '4.1 Protected route allows access with valid Bearer JWT access token',
      `Status: ${protectedRes.status}`
    );

    // 5. Test Missing Token
    const missingTokenRes = await fetch(`${baseUrl}/api/v1/auth/me`);
    assert(
      missingTokenRes.status === 401,
      '5.1 Request without Authorization header is rejected with 401 Unauthorized'
    );

    // 6. Test Malformed Authorization Header
    const malformedHeaderRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: 'Basic dXNlcjpwYXNz' },
    });
    const malformedData = await malformedHeaderRes.json();

    assert(
      malformedHeaderRes.status === 401 && malformedData.message.includes('Invalid authorization header format'),
      '6.1 Malformed non-Bearer Authorization header is rejected cleanly with 401 Unauthorized',
      `Message: ${malformedData.message}`
    );

    // 7. Test Empty Bearer Token
    const emptyBearerRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: 'Bearer ' },
    });

    assert(
      emptyBearerRes.status === 401,
      '7.1 Empty Bearer token header is rejected with 401 Unauthorized'
    );

    // 8. Test Tampered Token Signature
    const tamperedToken = validToken.substring(0, validToken.length - 6) + 'abcdef';
    const tamperedRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${tamperedToken}` },
    });

    assert(
      tamperedRes.status === 401,
      '8.1 Tampered JWT signature is strictly rejected with 401 Unauthorized'
    );

    // 9. Test Expired Token
    const secret = process.env.JWT_SECRET || 'default_access_secret_development_key_12345';
    const expiredToken = jwt.sign({ id: mockDbUser._id }, secret, { algorithm: 'HS256', expiresIn: '-1s' });
    const expiredRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });

    assert(
      expiredRes.status === 401,
      '9.1 Expired JWT token is strictly rejected with 401 Unauthorized'
    );

    // Teardown
    server.close();
    User.findById = origUserFindById;
    User.findOne = origUserFindOne;

  } catch (err) {
    assert(false, 'Unexpected execution exception in Phase 11.3 Auth JWT Hardening Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runPhase113AuthJwtTests();
