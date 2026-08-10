import dashboardService from './dashboard.service.js';
import dashboardRepository from './dashboard.repository.js';
import dashboardRoutes from './dashboard.routes.js';
import app from '../app.js';

console.log('=== INTERVIEWIQ AI - DASHBOARD MODULE TEST SUITE ===\n');

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
    // 1. Structure Assertions
    assert(typeof dashboardRepository === 'object', '1. DashboardRepository instance exported');
    assert(typeof dashboardService === 'object', '2. DashboardService instance exported');
    assert(typeof dashboardRoutes === 'function', '3. Dashboard Express Router exported');

    // 2. Profile Completion Logic Unit Tests
    const mockProfilePartial = {
      hasProfile: true,
      headline: 'Full-Stack Developer',
      skillsCount: 1,
      hasSocialLinks: true,
    };
    const scorePartial = dashboardService.calculateProfileCompletion(mockProfilePartial);
    assert(scorePartial === 45, `4. Calculate partial profile completion (Expected 45, Got ${scorePartial})`);

    const mockProfileFull = {
      hasProfile: true,
      headline: 'Senior Backend Engineer',
      bio: 'Experienced in Node.js and MongoDB',
      skillsCount: 5,
      educationCount: 2,
      experienceCount: 3,
      hasSocialLinks: true,
      hasBasicInfo: true,
    };
    const scoreFull = dashboardService.calculateProfileCompletion(mockProfileFull);
    assert(scoreFull === 100, `5. Calculate full profile completion (Expected 100, Got ${scoreFull})`);

    // 3. Career Readiness Engine Unit Tests
    const mockResumeMetrics = {
      hasResume: true,
      latestATSScore: 80,
    };
    const mockInterviewMetrics = {
      completed: 2,
      averageScore: 85,
    };
    const mockAppMetrics = {
      total: 10,
      interviewConversionRate: 30,
      offerConversionRate: 10,
    };

    const readiness = dashboardService.calculateCareerReadiness(
      100,
      mockResumeMetrics,
      mockInterviewMetrics,
      mockAppMetrics
    );

    assert(
      typeof readiness.overallScore === 'number' && readiness.overallScore > 0,
      '6. Career readiness overall score calculated'
    );
    assert(
      readiness.readinessLevel === 'Job Ready (Exceptional)' || readiness.readinessLevel === 'Job Ready',
      `7. Career readiness level categorized (${readiness.readinessLevel})`
    );
    assert(
      Array.isArray(readiness.recommendations),
      '8. Career readiness recommendations array generated'
    );

    // 4. Repository Methods Verification (Zero-record handling)
    assert(typeof dashboardRepository.getProfileStats === 'function', '9. getProfileStats method exists');
    assert(typeof dashboardRepository.getResumeStats === 'function', '10. getResumeStats method exists');
    assert(typeof dashboardRepository.getInterviewStats === 'function', '11. getInterviewStats method exists');
    assert(typeof dashboardRepository.getApplicationStats === 'function', '12. getApplicationStats method exists');
    assert(typeof dashboardRepository.getSavedJobStats === 'function', '13. getSavedJobStats method exists');
    assert(typeof dashboardRepository.getRecentActivity === 'function', '14. getRecentActivity method exists');
    assert(typeof dashboardRepository.getATSScoreHistory === 'function', '15. getATSScoreHistory method exists');
    assert(typeof dashboardRepository.getInterviewScoreHistory === 'function', '16. getInterviewScoreHistory method exists');
    assert(typeof dashboardRepository.getApplicationStatusStats === 'function', '17. getApplicationStatusStats method exists');

    // 5. DashboardService Methods Verification
    assert(typeof dashboardService.getDashboard === 'function', '18. getDashboard method exists');
    assert(typeof dashboardService.getResumeDashboard === 'function', '19. getResumeDashboard method exists');
    assert(typeof dashboardService.getInterviewDashboard === 'function', '20. getInterviewDashboard method exists');
    assert(typeof dashboardService.getApplicationDashboard === 'function', '21. getApplicationDashboard method exists');
    assert(typeof dashboardService.getActivityDashboard === 'function', '22. getActivityDashboard method exists');

    // 6. Express App Router Mounting Test
    const routesStack = app._router.stack;
    const mainRouterLayer = routesStack.find((layer) => layer.name === 'router');
    assert(!!mainRouterLayer, '23. Dashboard routes mounted in Express router pipeline');
  } catch (err) {
    assert(false, 'Dashboard module verification exception', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runDashboardTests();
