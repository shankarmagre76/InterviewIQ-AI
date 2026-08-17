import { notificationService } from '../../services/notificationService.js';

console.log('=== FRONTEND NOTIFICATION ACTIONS (F9.7) INTEGRATION TEST SUITE ===\n');

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

// Pure JS implementation of resolveNotificationRoute mirroring NotificationDropdown.jsx
const resolveNotificationRoute = (notif) => {
  if (!notif) return null;

  const { relatedEntity, relatedEntityId, type } = notif;

  // 1. Resume / ATS Analysis
  if (
    relatedEntity === 'ResumeAnalysis' ||
    type === 'RESUME_ANALYSIS'
  ) {
    return '/resume/analysis';
  }
  if (relatedEntity === 'Resume' || type === 'RESUME_IMPROVEMENT') {
    return '/resume';
  }

  // 2. Mock Interview
  if (
    relatedEntity === 'Interview' ||
    type === 'INTERVIEW_RESULT' ||
    type === 'INTERVIEW_REMINDER'
  ) {
    return relatedEntityId ? `/interviews/${relatedEntityId}/result` : '/interviews';
  }

  // 3. Job Application
  if (
    relatedEntity === 'Application' ||
    type === 'APPLICATION_STATUS' ||
    type === 'APPLICATION_DEADLINE'
  ) {
    return relatedEntityId ? `/applications/${relatedEntityId}` : '/applications';
  }

  // 4. Job Posting
  if (relatedEntity === 'Job') {
    return relatedEntityId ? `/jobs/${relatedEntityId}` : '/jobs';
  }

  // 5. Learning Roadmap & Tasks
  if (
    relatedEntity === 'LearningRoadmap' ||
    type === 'ROADMAP_UPDATE' ||
    type === 'ROADMAP_MILESTONE'
  ) {
    return relatedEntityId ? `/roadmap/${relatedEntityId}` : '/roadmap';
  }
  if (relatedEntity === 'LearningTask' || type === 'LEARNING_TASK') {
    return '/roadmap';
  }

  // 6. System Events or no related resource
  if (relatedEntity === 'System' || type === 'SYSTEM' || !relatedEntity) {
    return null; // Do not attempt navigation for pure system alerts
  }

  return null;
};

async function runTests() {
  const mockId = '65a1b2c3d4e5f6a7b8c9d999';

  // Test 1: Resume Analysis Route Resolution
  console.log('--- 1. Testing Resume Notification Route Resolution ---');
  const resumeNotif = { relatedEntity: 'ResumeAnalysis', relatedEntityId: mockId, type: 'RESUME_ANALYSIS' };
  assert(resolveNotificationRoute(resumeNotif) === '/resume/analysis', 'Resume Analysis notification resolves to /resume/analysis');

  // Test 2: Interview Result Route Resolution
  console.log('\n--- 2. Testing Interview Notification Route Resolution ---');
  const interviewNotif = { relatedEntity: 'Interview', relatedEntityId: mockId, type: 'INTERVIEW_RESULT' };
  assert(resolveNotificationRoute(interviewNotif) === `/interviews/${mockId}/result`, 'Interview notification resolves to /interviews/:id/result');

  // Test 3: Application Status Route Resolution
  console.log('\n--- 3. Testing Application Notification Route Resolution ---');
  const appNotif = { relatedEntity: 'Application', relatedEntityId: mockId, type: 'APPLICATION_STATUS' };
  assert(resolveNotificationRoute(appNotif) === `/applications/${mockId}`, 'Application notification resolves to /applications/:id');

  // Test 4: Learning Roadmap Route Resolution
  console.log('\n--- 4. Testing Roadmap Notification Route Resolution ---');
  const roadmapNotif = { relatedEntity: 'LearningRoadmap', relatedEntityId: mockId, type: 'ROADMAP_MILESTONE' };
  assert(resolveNotificationRoute(roadmapNotif) === `/roadmap/${mockId}`, 'Roadmap notification resolves to /roadmap/:id');

  // Test 5: Job Route Resolution
  console.log('\n--- 5. Testing Job Notification Route Resolution ---');
  const jobNotif = { relatedEntity: 'Job', relatedEntityId: mockId, type: 'SYSTEM' };
  assert(resolveNotificationRoute(jobNotif) === `/jobs/${mockId}`, 'Job notification resolves to /jobs/:id');

  // Test 6: System Event Route Resolution (No Navigation)
  console.log('\n--- 6. Testing System Alert Route Resolution (No Navigation) ---');
  const systemNotif = { relatedEntity: 'System', relatedEntityId: null, type: 'SYSTEM' };
  assert(resolveNotificationRoute(systemNotif) === null, 'System alert with no related resource resolves to null (marks read without navigation)');

  const nullEntityNotif = { relatedEntity: null, relatedEntityId: null, type: 'SYSTEM' };
  assert(resolveNotificationRoute(nullEntityNotif) === null, 'Notification with null relatedEntity resolves to null');

  // Test 7: Simulated Click Action Workflow (Mark Read + Conditional Navigation)
  console.log('\n--- 7. Simulating Click Action Workflow ---');
  async function simulateNotificationClick(notif, markReadFn, navigateFn) {
    let markedRead = false;
    let navigatedPath = null;

    if (!notif.isRead) {
      await markReadFn(notif._id);
      markedRead = true;
    }

    const route = resolveNotificationRoute(notif);
    if (route) {
      navigateFn(route);
      navigatedPath = route;
    }

    return { markedRead, navigatedPath };
  }

  let testMarked = false;
  let testPath = null;

  const clickResult = await simulateNotificationClick(
    { _id: mockId, isRead: false, relatedEntity: 'Interview', relatedEntityId: mockId, type: 'INTERVIEW_RESULT' },
    async () => { testMarked = true; },
    (path) => { testPath = path; }
  );

  assert(clickResult.markedRead && testMarked, 'Clicking unread notification triggers markAsRead');
  assert(clickResult.navigatedPath === `/interviews/${mockId}/result` && testPath === `/interviews/${mockId}/result`, 'Clicking related notification navigates to exact target route');

  // System alert click simulation
  let systemMarked = false;
  let systemPath = null;

  const systemClickResult = await simulateNotificationClick(
    { _id: mockId, isRead: false, relatedEntity: 'System', type: 'SYSTEM' },
    async () => { systemMarked = true; },
    (path) => { systemPath = path; }
  );

  assert(systemClickResult.markedRead && systemMarked, 'Clicking unread system alert triggers markAsRead');
  assert(systemClickResult.navigatedPath === null && systemPath === null, 'System alert click does not attempt navigation');

  console.log('\n==================================================');
  console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('==================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled test runner error:', err);
  process.exit(1);
});
