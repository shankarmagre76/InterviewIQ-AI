import app from '../app.js';
import User from '../models/User.js';
import ResumeAnalysis from '../resume/resumeAnalysis.model.js';
import Interview from '../interview/interview.model.js';
import JobApplication from '../application/application.model.js';
import { generateAccessToken } from '../utils/jwt.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 11.4 AUTHORIZATION & ACCESS-CONTROL SUITE');
console.log('=================================================================\n');

async function runPhase114AuthAccessControlTests() {
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
    const userA_Id = '6a7b11111111111111111111';
    const userB_Id = '6a7b22222222222222222222';
    const adminId  = '6a7b99999999999999999999';

    const tokenUserA = generateAccessToken({ id: userA_Id, role: 'Student' });
    const tokenUserB = generateAccessToken({ id: userB_Id, role: 'Student' });
    const tokenAdmin = generateAccessToken({ id: adminId,  role: 'Admin' });

    const mockUserA = { _id: userA_Id, id: userA_Id, role: 'Student', isActive: true, toJSON: () => ({ id: userA_Id, role: 'Student' }) };
    const mockUserB = { _id: userB_Id, id: userB_Id, role: 'Student', isActive: true, toJSON: () => ({ id: userB_Id, role: 'Student' }) };
    const mockAdmin = { _id: adminId,  id: adminId,  role: 'Admin',   isActive: true, toJSON: () => ({ id: adminId,  role: 'Admin' }) };

    // Stub User.findById
    const origUserFindById = User.findById;
    User.findById = async (id) => {
      const idStr = id?.toString();
      if (idStr === userA_Id) return mockUserA;
      if (idStr === userB_Id) return mockUserB;
      if (idStr === adminId)  return mockAdmin;
      return null;
    };

    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // =========================================================================
    // 1. HORIZONTAL PRIVILEGE ESCALATION: RESUME ANALYSIS
    // =========================================================================

    const analysisIdUserA = '6a7b33333333333333333333';
    const origResumeAnalysisFindById = ResumeAnalysis.findById;
    ResumeAnalysis.findById = async (id) => {
      if (id.toString() === analysisIdUserA) {
        return {
          _id: analysisIdUserA,
          user: userA_Id,
          atsScore: 85,
        };
      }
      return null;
    };

    const analysisRes = await fetch(`${baseUrl}/api/v1/profile/resume/analysis/${analysisIdUserA}`, {
      headers: { Authorization: `Bearer ${tokenUserB}` },
    });

    assert(
      analysisRes.status === 403,
      '1.1 User B attempting to access User A\'s Resume Analysis report returns 403 Forbidden',
      `Status: ${analysisRes.status}`
    );

    // =========================================================================
    // 2. HORIZONTAL PRIVILEGE ESCALATION: AI INTERVIEW SESSION
    // =========================================================================

    const interviewIdUserA = '6a7b44444444444444444444';
    const origInterviewFindById = Interview.findById;
    Interview.findById = (id) => ({
      populate: () => ({
        populate: () => ({
          _id: interviewIdUserA,
          user: { _id: userA_Id, toString: () => userA_Id },
          status: 'In Progress',
        }),
      }),
    });

    const interviewRes = await fetch(`${baseUrl}/api/v1/interviews/${interviewIdUserA}`, {
      headers: { Authorization: `Bearer ${tokenUserB}` },
    });

    assert(
      interviewRes.status === 403,
      '2.1 User B attempting to access User A\'s Interview session details returns 403 Forbidden',
      `Status: ${interviewRes.status}`
    );

    // =========================================================================
    // 3. HORIZONTAL PRIVILEGE ESCALATION: APPLICATION MODIFICATION
    // =========================================================================

    const appIdUserA = '6a7b55555555555555555555';
    const origAppFindById = JobApplication.findById;
    JobApplication.findById = (id) => ({
      populate: () => ({
        _id: appIdUserA,
        user: { _id: userA_Id, toString: () => userA_Id },
        company: { _id: '6a7b66666666666666666666', toString: () => '6a7b66666666666666666666' },
        status: 'Applied',
      }),
    });

    const appModRes = await fetch(`${baseUrl}/api/v1/applications/${appIdUserA}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenUserB}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Shortlisted' }),
    });

    assert(
      appModRes.status === 403,
      '3.1 Candidate User B attempting to update status on User A\'s Job Application returns 403 Forbidden',
      `Status: ${appModRes.status}`
    );

    // =========================================================================
    // 4. VERTICAL PRIVILEGE ESCALATION: ADMIN ROUTE ACCESS
    // =========================================================================

    const adminAccessRes = await fetch(`${baseUrl}/api/v1/admin/health`, {
      headers: { Authorization: `Bearer ${tokenUserB}` },
    });

    assert(
      adminAccessRes.status === 403,
      '4.1 Normal non-admin Candidate accessing /api/v1/admin/health returns 403 Forbidden',
      `Status: ${adminAccessRes.status}`
    );

    // =========================================================================
    // 5. VALID ADMIN ACCESS TO PERMITTED ADMINISTRATIVE RESOURCE
    // =========================================================================

    const validAdminRes = await fetch(`${baseUrl}/api/v1/admin/health`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });

    assert(
      validAdminRes.status === 200,
      '5.1 Authenticated Admin user accessing /api/v1/admin/health returns 200 OK',
      `Status: ${validAdminRes.status}`
    );

    // =========================================================================
    // 6. INVALID RESOURCE MONGO OBJECTID PARAMETER VALIDATION
    // =========================================================================

    const invalidIdRes = await fetch(`${baseUrl}/api/v1/interviews/invalid-mongo-id`, {
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });

    assert(
      invalidIdRes.status === 400,
      '6.1 Malformed MongoDB ObjectId string parameter returns 400 Bad Request',
      `Status: ${invalidIdRes.status}`
    );

    // Teardown
    server.close();
    User.findById = origUserFindById;
    ResumeAnalysis.findById = origResumeAnalysisFindById;
    Interview.findById = origInterviewFindById;
    JobApplication.findById = origAppFindById;

  } catch (err) {
    assert(false, 'Unexpected execution exception in Phase 11.4 Auth & Access Control Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runPhase114AuthAccessControlTests();
