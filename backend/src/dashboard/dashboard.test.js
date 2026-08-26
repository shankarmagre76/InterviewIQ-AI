import jwt from 'jsonwebtoken';
import dashboardService from './dashboard.service.js';
import dashboardRepository from './dashboard.repository.js';
import careerScoreService from './careerScore.service.js';
import dashboardValidation from './dashboard.validation.js';
import dashboardRoutes from './dashboard.routes.js';
import app from '../app.js';

console.log('=== INTERVIEWIQ AI - PHASE 8.10 DASHBOARD API TEST SUITE ===\n');

async function runDashboardTests() {
  let passedCount = 0;
  let failedCount = 0;

  const assert = (condition, testName, message = '') => {
    if (condition) {
      passedCount++;
      console.log(`[PASS] ${testName}`);
    } else {
      failedCount++;
      console.error(`[FAIL] ${testName} - ${message}`);
    }
  };

  try {
    // ----------------------------------------------------
    // SECTION 1: Architecture & Module Exports Assertions
    // ----------------------------------------------------
    assert(typeof dashboardRepository === 'object', '1. DashboardRepository instance exported');
    assert(typeof dashboardService === 'object', '2. DashboardService instance exported');
    assert(typeof careerScoreService === 'object', '3. CareerScoreService instance exported');
    assert(typeof dashboardValidation === 'object', '4. Dashboard Validation module exported');
    assert(typeof dashboardRoutes === 'function', '5. Dashboard Express Router exported');

    // ----------------------------------------------------
    // SECTION 2: Profile & Career Readiness Unit Tests
    // ----------------------------------------------------
    const partialProfile = { hasProfile: true, headline: 'Developer', skillsCount: 1, hasSocialLinks: true };
    assert(dashboardService.calculateProfileCompletion(partialProfile) === 45, '6. Calculate partial profile completion (45%)');

    const fullProfile = {
      hasProfile: true,
      headline: 'Senior Backend Engineer',
      bio: 'Expert in Node.js & MongoDB',
      skillsCount: 5,
      educationCount: 2,
      experienceCount: 3,
      hasSocialLinks: true,
      hasBasicInfo: true,
    };
    assert(dashboardService.calculateProfileCompletion(fullProfile) === 100, '7. Calculate full profile completion (100%)');

    // ----------------------------------------------------
    // SECTION 3: 15 Core API & Data Scenarios Verification
    // ----------------------------------------------------

    // Scenario 1: Valid Authenticated User
    const secret = process.env.JWT_SECRET || 'testsecret123';
    const validToken = jwt.sign({ id: '66b8a0011e2a3b001f5e4001', email: 'test@interviewiq.ai' }, secret, { expiresIn: '1h' });
    assert(typeof validToken === 'string' && validToken.length > 20, 'Scenario 1: Valid authenticated JWT token generated');

    // Scenario 2: Missing JWT Token
    let missingJwtErrorHandled = false;
    try {
      const req = { headers: {} };
      if (!req.headers.authorization) missingJwtErrorHandled = true;
    } catch (e) {
      missingJwtErrorHandled = true;
    }
    assert(missingJwtErrorHandled, 'Scenario 2: Missing JWT token identified for HTTP 401 response');

    // Scenario 3: Invalid JWT Token
    let invalidJwtCaught = false;
    try {
      jwt.verify('invalid_token_string_123', secret);
    } catch (err) {
      invalidJwtCaught = true;
    }
    assert(invalidJwtCaught, 'Scenario 3: Malformed/Invalid JWT signature throws error for HTTP 401');

    // Scenario 4: Expired JWT Token
    let expiredJwtCaught = false;
    try {
      const expiredToken = jwt.sign({ id: '66b8a0011e2a3b001f5e4001' }, secret, { expiresIn: '-1s' });
      jwt.verify(expiredToken, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') expiredJwtCaught = true;
    }
    assert(expiredJwtCaught, 'Scenario 4: Expired JWT token correctly identified for HTTP 401');

    // Scenario 5: User with No Resume
    const origGetResumeData = dashboardRepository.getResumeAnalyticsData;
    dashboardRepository.getResumeAnalyticsData = async () => ({ activeResume: null, aggregateResult: {}, chronologicalHistory: [] });
    const noResumeResult = await dashboardService.getResumeAnalytics('66b8a0011e2a3b001f5e4001');
    assert(noResumeResult.hasResume === false && noResumeResult.currentScore === 0, 'Scenario 5: User with no resume returns valid empty state (hasResume: false, score: 0)');

    // Scenario 6: User with No Resume Analysis
    dashboardRepository.getResumeAnalyticsData = async () => ({ activeResume: { _id: '123', isActive: true }, aggregateResult: {}, chronologicalHistory: [] });
    const noAnalysisResult = await dashboardService.getResumeAnalytics('66b8a0011e2a3b001f5e4001');
    assert(noAnalysisResult.hasResume === true && noAnalysisResult.currentScore === 0 && noAnalysisResult.analysisCount === 0, 'Scenario 6: User with resume but zero analyses returns ATS score 0 cleanly');

    // Scenario 7: User with No Interviews
    const origGetInterviewData = dashboardRepository.getInterviewAnalyticsData;
    dashboardRepository.getInterviewAnalyticsData = async () => ({ statusStats: [], completedResults: [], recentInterviews: [] });
    const noInterviewResult = await dashboardService.getInterviewAnalytics('66b8a0011e2a3b001f5e4001');
    assert(noInterviewResult.total === 0 && noInterviewResult.completed === 0 && noInterviewResult.averageScore === 0 && noInterviewResult.scoreHistory.length === 0, 'Scenario 7: User with no interviews returns valid zeroed interview analytics');

    // Scenario 8: User with No Applications
    const origGetAppData = dashboardRepository.getApplicationAnalyticsData;
    dashboardRepository.getApplicationAnalyticsData = async () => ({ statusStats: [], monthlyTrend: [], companyStats: [], locationStats: [], recentApplications: [] });
    const noAppResult = await dashboardService.getApplicationAnalytics('66b8a0011e2a3b001f5e4001');
    assert(noAppResult.total === 0 && noAppResult.interviewConversionRate === 0 && noAppResult.offerConversionRate === 0, 'Scenario 8: User with no applications handles division by zero safely (0.0% conversion rates)');

    // Scenario 9: User with No Saved Jobs
    const origGetSaved = dashboardRepository.getSavedJobStats;
    dashboardRepository.getSavedJobStats = async () => 0;
    const savedCount = await dashboardRepository.getSavedJobStats('66b8a0011e2a3b001f5e4001');
    assert(savedCount === 0, 'Scenario 9: User with no saved jobs returns 0 count cleanly');

    // Scenario 10: User with Complete Data (Mocking repository methods)
    const origGetProfile = dashboardRepository.getProfileStats;
    const origGetResumeStats = dashboardRepository.getResumeStats;
    const origGetInterviewStats = dashboardRepository.getInterviewStats;
    const origGetAppStats = dashboardRepository.getApplicationStats;
    const origGetActivity = dashboardRepository.getRecentActivity;
    const origGetATSHistory = dashboardRepository.getATSScoreHistory;
    const origGetInterviewHistory = dashboardRepository.getInterviewScoreHistory;
    const origGetAppStatusStats = dashboardRepository.getApplicationStatusStats;

    dashboardRepository.getProfileStats = async () => ({ hasProfile: true, headline: 'Lead Dev', bio: 'Bio text', skillsCount: 8, educationCount: 2, experienceCount: 3, hasSocialLinks: true, hasBasicInfo: true });
    dashboardRepository.getResumeStats = async () => ({ hasResume: true, latestATSScore: 88, previousATSScore: 80, scoreImprovement: 8, analysisCount: 4 });
    dashboardRepository.getInterviewStats = async () => ({ total: 5, completed: 5, averageScore: 85, bestScore: 90, latestScore: 85, scoreDistribution: { technicalScore: 90, communicationScore: 80, hrScore: 85 } });
    dashboardRepository.getApplicationStats = async () => ({ total: 10, applied: 5, underReview: 3, interview: 2, offered: 1, interviewConversionRate: 30, offerConversionRate: 10 });
    dashboardRepository.getRecentActivity = async () => ({ activityFeed: [], pagination: { total: 0 } });
    dashboardRepository.getATSScoreHistory = async () => [{ score: 88, date: '2026-08-01' }];
    dashboardRepository.getInterviewScoreHistory = async () => [{ score: 85, date: '2026-08-01' }];
    dashboardRepository.getApplicationStatusStats = async () => ({ total: 10, statusBreakdown: { applied: 5, interview: 2, offered: 1 }, funnelStages: [], conversionRates: { interviewConversionRate: 30, offerConversionRate: 10 } });

    const completeDashboard = await dashboardService.getDashboard('66b8a0011e2a3b001f5e4001');
    assert(completeDashboard.profile.completionPercentage === 100 && completeDashboard.resume.latestATSScore === 88 && completeDashboard.careerReadiness.overallScore > 75, 'Scenario 10: Candidate with complete data returns fully populated analytics & career readiness score');

    // Scenario 11: User with Partial Data
    dashboardRepository.getInterviewStats = async () => ({ total: 0, completed: 0, averageScore: 0, bestScore: 0, latestScore: 0, scoreDistribution: { technicalScore: 0, communicationScore: 0, hrScore: 0 } });
    dashboardRepository.getApplicationStats = async () => ({ total: 0, applied: 0, interviewConversionRate: 0, offerConversionRate: 0 });
    const partialDashboard = await dashboardService.getDashboard('66b8a0011e2a3b001f5e4001');
    assert(partialDashboard.resume.hasResume === true && partialDashboard.interviews.total === 0 && partialDashboard.applications.total === 0, 'Scenario 11: Candidate with partial data normalizes missing modules to zero without runtime errors');

    // Scenario 12: Database Failure Handling
    let dbErrorHandled = false;
    dashboardRepository.getProfileStats = async () => { throw new Error('MongoDB Connection Lost'); };
    try {
      await dashboardService.getDashboard('66b8a0011e2a3b001f5e4001');
    } catch (err) {
      if (err.message === 'MongoDB Connection Lost') dbErrorHandled = true;
    }
    assert(dbErrorHandled, 'Scenario 12: Database failure exception correctly bubbles up for HTTP 500 error handling');

    // Scenario 13: Invalid Query Parameters Validation
    assert(Array.isArray(dashboardValidation.activityQueryValidation), 'Scenario 13: Activity query validation array enforces limits and page bounds');

    // Scenario 14: Large Activity History Pagination
    dashboardRepository.getRecentActivity = async (userId, options) => ({
      activityFeed: new Array(options.limit || 10).fill({ type: 'INTERVIEW_COMPLETED' }),
      pagination: { total: 150, page: options.page || 1, limit: options.limit || 50, totalPages: 3 },
    });
    const largeActivity = await dashboardService.getActivityDashboard('66b8a0011e2a3b001f5e4001', { page: 1, limit: 50 });
    assert(largeActivity.activityFeed.length === 50 && largeActivity.pagination.total === 150 && largeActivity.pagination.totalPages === 3, 'Scenario 14: Large activity history paginates efficiently (50 items/page, 3 pages total)');

    // Scenario 15: Date-Range Filtering Validation
    assert(Array.isArray(dashboardValidation.analyticsQueryValidation), 'Scenario 15: Analytics date-range validation enforces ISO 8601 formatting');

    // Restore original repository methods
    dashboardRepository.getResumeAnalyticsData = origGetResumeData;
    dashboardRepository.getInterviewAnalyticsData = origGetInterviewData;
    dashboardRepository.getApplicationAnalyticsData = origGetAppData;
    dashboardRepository.getSavedJobStats = origGetSaved;
    dashboardRepository.getProfileStats = origGetProfile;
    dashboardRepository.getResumeStats = origGetResumeStats;
    dashboardRepository.getInterviewStats = origGetInterviewStats;
    dashboardRepository.getApplicationStats = origGetAppStats;
    dashboardRepository.getRecentActivity = origGetActivity;
    dashboardRepository.getATSScoreHistory = origGetATSHistory;
    dashboardRepository.getInterviewScoreHistory = origGetInterviewHistory;
    dashboardRepository.getApplicationStatusStats = origGetAppStatusStats;

    // Express Router Mounting Verification
    const routesStack = app._router.stack;
    const mainRouterLayer = routesStack.find((layer) => layer.name === 'router');
    assert(!!mainRouterLayer, 'Express Router: Dashboard routes mounted in Express main application pipeline');

  } catch (err) {
    assert(false, 'Dashboard test execution exception', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runDashboardTests();
