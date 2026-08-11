import express from 'express';
import mongoose from 'mongoose';
import routes from '../routes/index.js';
import errorHandler from '../middleware/error.middleware.js';
import { generateAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import ResumeAnalysis from '../resume/resumeAnalysis.model.js';
import Interview from '../interview/interview.model.js';
import LearningRoadmap from '../learningRoadmap/learningRoadmap.model.js';
import adminAiUsageRepository from './adminAiUsage.repository.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 10.6 ADMIN AI USAGE MONITORING TEST SUITE');
console.log('=================================================================\n');

async function runAdminAiUsageMonitoringTestSuite() {
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
    const adminId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();

    const adminToken = `Bearer ${generateAccessToken({ id: adminId })}`;
    const studentToken = `Bearer ${generateAccessToken({ id: studentId })}`;

    // Stub User model
    const origUserFindById = User.findById;
    const origUserFind = User.find;

    User.findById = async (id) => {
      const idStr = String(id);
      if (idStr === adminId) {
        return { _id: idStr, email: 'admin@interviewiq.ai', role: 'Admin', isActive: true };
      }
      if (idStr === studentId) {
        return { _id: idStr, email: 'student@example.com', role: 'Student', isActive: true };
      }
      return null;
    };

    User.find = (filter = {}) => ({
      select: () => ({
        lean: async () => [
          { _id: studentId, firstName: 'Alice', lastName: 'Student', email: 'alice@example.com', role: 'Student' },
        ],
      }),
    });

    // In-memory Mock Records
    const mockResumeAnalyses = [
      {
        _id: new mongoose.Types.ObjectId().toString(),
        user: studentId,
        atsScore: 85,
        tokenUsage: { promptTokens: 450, completionTokens: 300, totalTokens: 750 },
        createdAt: new Date('2026-02-01T10:00:00Z'),
      },
    ];

    const mockInterviews = [
      {
        _id: new mongoose.Types.ObjectId().toString(),
        user: studentId,
        role: 'Full Stack Engineer',
        type: 'Technical',
        difficulty: 'Intermediate',
        status: 'Completed',
        createdAt: new Date('2026-02-02T10:00:00Z'),
      },
    ];

    const mockRoadmaps = [
      {
        _id: new mongoose.Types.ObjectId().toString(),
        user: studentId,
        targetRole: 'DevOps Engineer',
        status: 'ACTIVE',
        createdAt: new Date('2026-02-03T10:00:00Z'),
      },
    ];

    // Stub Repository Methods
    const origGetOverall = adminAiUsageRepository.getOverallAiUsageStats;
    const origGetResumeUsage = adminAiUsageRepository.getResumeAnalysisUsage;
    const origGetInterviewUsage = adminAiUsageRepository.getInterviewUsage;
    const origGetRoadmapUsage = adminAiUsageRepository.getRoadmapUsage;

    adminAiUsageRepository.getOverallAiUsageStats = async () => ({
      totalAiOperations: 3,
      totalResumeAnalyses: 1,
      totalInterviews: 1,
      totalRoadmaps: 1,
      topAiUsers: [
        { userId: studentId, totalCount: 3, resumeCount: 1, interviewCount: 1, roadmapCount: 1 },
      ],
      recentActivities: [
        {
          _id: mockRoadmaps[0]._id,
          feature: 'Learning Roadmap',
          user: { firstName: 'Alice', lastName: 'Student', email: 'alice@example.com' },
          details: 'Roadmap for DevOps Engineer',
          createdAt: mockRoadmaps[0].createdAt,
        },
        {
          _id: mockInterviews[0]._id,
          feature: 'AI Mock Interview',
          user: { firstName: 'Alice', lastName: 'Student', email: 'alice@example.com' },
          details: 'Technical Interview (Full Stack Engineer)',
          createdAt: mockInterviews[0].createdAt,
        },
        {
          _id: mockResumeAnalyses[0]._id,
          feature: 'Resume Analysis',
          user: { firstName: 'Alice', lastName: 'Student', email: 'alice@example.com' },
          details: 'ATS Score: 85',
          createdAt: mockResumeAnalyses[0].createdAt,
        },
      ],
    });

    adminAiUsageRepository.getResumeAnalysisUsage = async () => ({
      items: mockResumeAnalyses,
      total: 1,
      page: 1,
      totalPages: 1,
      avgAtsScore: 85,
      tokenUsage: { promptTokens: 450, completionTokens: 300, totalTokens: 750 },
    });

    adminAiUsageRepository.getInterviewUsage = async () => ({
      items: mockInterviews,
      total: 1,
      page: 1,
      totalPages: 1,
      statusBreakdown: [{ status: 'Completed', count: 1 }],
      difficultyBreakdown: [{ difficulty: 'Intermediate', count: 1 }],
      typeBreakdown: [{ type: 'Technical', count: 1 }],
    });

    adminAiUsageRepository.getRoadmapUsage = async () => ({
      items: mockRoadmaps,
      total: 1,
      page: 1,
      totalPages: 1,
      statusBreakdown: [{ status: 'ACTIVE', count: 1 }],
      topTargetRoles: [{ targetRole: 'DevOps Engineer', count: 1 }],
    });

    // Setup Express App Instance
    const app = express();
    app.use(express.json());
    app.use(routes);
    app.use(errorHandler);

    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    const makeRequest = async (path, method = 'GET', body = null, token = adminToken) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = token;

      const opts = { method, headers };
      if (body) opts.body = JSON.stringify(body);

      const res = await fetch(`${baseUrl}${path}`, opts);
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    };

    // =========================================================================
    // EXECUTE ADMIN AI USAGE MONITORING TEST SCENARIOS
    // =========================================================================

    // 1. Overall AI Usage Metrics (GET /api/v1/admin/ai/usage)
    const usageRes = await makeRequest('/api/v1/admin/ai/usage', 'GET');
    assert(
      usageRes.status === 200 &&
        usageRes.data.success === true &&
        usageRes.data.data.overview.totalAiOperations === 3 &&
        usageRes.data.data.topAiUsers.length === 1 &&
        usageRes.data.data.failedOperationsNote.includes('Gemini API failure'),
      'Test 1: Admin can retrieve overall platform AI usage metrics and failure limitation note',
      `Total Ops: ${usageRes.data.data?.overview?.totalAiOperations}`
    );

    // 2. Resume Analysis AI Usage (GET /api/v1/admin/ai/resume-analysis)
    const resumeRes = await makeRequest('/api/v1/admin/ai/resume-analysis', 'GET');
    assert(
      resumeRes.status === 200 &&
        resumeRes.data.meta.avgAtsScore === 85 &&
        resumeRes.data.meta.tokenUsage.totalTokens === 750,
      'Test 2: Admin can retrieve resume analysis AI metrics and token usage telemetry',
      `Avg ATS Score: ${resumeRes.data.meta?.avgAtsScore}`
    );

    // 3. AI Mock Interview Usage (GET /api/v1/admin/ai/interviews)
    const interviewRes = await makeRequest('/api/v1/admin/ai/interviews', 'GET');
    assert(
      interviewRes.status === 200 &&
        interviewRes.data.meta.statusBreakdown[0].status === 'Completed' &&
        interviewRes.data.meta.typeBreakdown[0].type === 'Technical',
      'Test 3: Admin can retrieve AI interview metrics with status and difficulty breakdowns',
      `Status Breakdown: ${interviewRes.data.meta?.statusBreakdown?.[0]?.status}`
    );

    // 4. Learning Roadmap AI Usage (GET /api/v1/admin/ai/roadmaps)
    const roadmapRes = await makeRequest('/api/v1/admin/ai/roadmaps', 'GET');
    assert(
      roadmapRes.status === 200 &&
        roadmapRes.data.meta.topTargetRoles[0].targetRole === 'DevOps Engineer',
      'Test 4: Admin can retrieve learning roadmap AI metrics and top target roles',
      `Top Role: ${roadmapRes.data.meta?.topTargetRoles?.[0]?.targetRole}`
    );

    // 5. Security & Privacy Check: Verify no Gemini API Keys or raw system prompts are leaked
    const jsonStr = JSON.stringify(usageRes.data) + JSON.stringify(resumeRes.data);
    const leakedKey = jsonStr.includes('GEMINI_API_KEY') || jsonStr.includes('AIzaSy');
    assert(
      !leakedKey,
      'Test 5: Security check verifies Gemini API keys and raw system prompts are NOT exposed in API responses',
      'No keys leaked'
    );

    // 6. Authorization Check: Non-Admin Normal User (Student) -> 403 Forbidden
    const forbiddenRes = await makeRequest('/api/v1/admin/ai/usage', 'GET', null, studentToken);
    assert(
      forbiddenRes.status === 403,
      'Test 6: Normal non-admin user request returns HTTP 403 Forbidden',
      `Status: ${forbiddenRes.status}`
    );

    // 7. Authentication Check: Missing JWT -> 401 Unauthorized
    const unauthRes = await makeRequest('/api/v1/admin/ai/usage', 'GET', null, null);
    assert(
      unauthRes.status === 401,
      'Test 7: Unauthenticated request without JWT returns HTTP 401 Unauthorized',
      `Status: ${unauthRes.status}`
    );

    // Cleanup & Teardown
    server.close();
    User.findById = origUserFindById;
    User.find = origUserFind;
    adminAiUsageRepository.getOverallAiUsageStats = origGetOverall;
    adminAiUsageRepository.getResumeAnalysisUsage = origGetResumeUsage;
    adminAiUsageRepository.getInterviewUsage = origGetInterviewUsage;
    adminAiUsageRepository.getRoadmapUsage = origGetRoadmapUsage;

  } catch (err) {
    assert(false, 'Unexpected execution exception in Admin AI Usage Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runAdminAiUsageMonitoringTestSuite();
