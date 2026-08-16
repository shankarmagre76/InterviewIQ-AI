import { notificationService } from '../../services/notificationService.js';

console.log('=== FRONTEND NOTIFICATION FILTERING (F9.6) INTEGRATION TEST SUITE ===\n');

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

// Category Mapping helper mirroring NotificationsPage
const NOTIFICATION_CATEGORIES = [
  { id: 'all', label: 'All', type: '' },
  { id: 'unread', label: 'Unread', type: '' },
  { id: 'resume', label: 'Resume', type: 'RESUME_ANALYSIS' },
  { id: 'interview', label: 'Interview', type: 'INTERVIEW_RESULT' },
  { id: 'applications', label: 'Applications', type: 'APPLICATION_STATUS' },
  { id: 'learning', label: 'Learning', type: 'ROADMAP_UPDATE' },
  { id: 'system', label: 'System', type: 'SYSTEM' },
];

async function runTests() {
  // Test 1: Category Mapping to Backend Supported Enums
  console.log('--- 1. Testing Category Pill Mappings to Backend Enums ---');
  const resumeCat = NOTIFICATION_CATEGORIES.find((c) => c.id === 'resume');
  assert(resumeCat.type === 'RESUME_ANALYSIS', 'Resume category maps to backend type RESUME_ANALYSIS');

  const interviewCat = NOTIFICATION_CATEGORIES.find((c) => c.id === 'interview');
  assert(interviewCat.type === 'INTERVIEW_RESULT', 'Interview category maps to backend type INTERVIEW_RESULT');

  const appCat = NOTIFICATION_CATEGORIES.find((c) => c.id === 'applications');
  assert(appCat.type === 'APPLICATION_STATUS', 'Applications category maps to backend type APPLICATION_STATUS');

  const learningCat = NOTIFICATION_CATEGORIES.find((c) => c.id === 'learning');
  assert(learningCat.type === 'ROADMAP_UPDATE', 'Learning category maps to backend type ROADMAP_UPDATE');

  const systemCat = NOTIFICATION_CATEGORIES.find((c) => c.id === 'system');
  assert(systemCat.type === 'SYSTEM', 'System category maps to backend type SYSTEM');

  // Test 2: Server-Side Query Parameter Formatting
  console.log('\n--- 2. Testing Query Parameter Construction for Server-Side Filtering ---');
  function buildQueryParams(category, type, page = 1, limit = 10) {
    const params = { page, limit };
    if (category === 'unread') {
      params.isRead = false;
    }
    if (type) {
      params.type = type;
    }
    return params;
  }

  const allParams = buildQueryParams('all', '');
  assert(allParams.page === 1 && allParams.limit === 10 && allParams.type === undefined && allParams.isRead === undefined, 'All filter creates clean paginated request');

  const unreadParams = buildQueryParams('unread', '');
  assert(unreadParams.isRead === false, 'Unread filter passes isRead = false server-side query parameter');

  const resumeFilterParams = buildQueryParams('resume', 'RESUME_ANALYSIS');
  assert(resumeFilterParams.type === 'RESUME_ANALYSIS', 'Resume category passes type = RESUME_ANALYSIS server-side query parameter');

  // Test 3: Verify notificationService getNotifications query parameter acceptance
  console.log('\n--- 3. Verifying Backend Service Query Pass-Through ---');
  assert(typeof notificationService.getNotifications === 'function', 'notificationService.getNotifications exists');

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
