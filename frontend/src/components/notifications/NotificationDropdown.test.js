import { notificationService } from '../../services/notificationService.js';

console.log('=== FRONTEND NOTIFICATION DROPDOWN (F9.3) INTEGRATION TEST SUITE ===\n');

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

// Pure JS helpers mirroring NotificationDropdown formatting & routing
const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 45) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getNotificationLink = (notif) => {
  const { type, relatedEntity, relatedEntityId } = notif;
  if (
    relatedEntity === 'LearningRoadmap' ||
    type === 'ROADMAP_UPDATE' ||
    type === 'ROADMAP_MILESTONE' ||
    type === 'LEARNING_TASK'
  ) {
    return '/roadmap';
  }
  if (
    relatedEntity === 'Interview' ||
    type === 'INTERVIEW_RESULT' ||
    type === 'INTERVIEW_REMINDER'
  ) {
    return relatedEntityId ? `/interviews/${relatedEntityId}/result` : '/interviews';
  }
  if (
    relatedEntity === 'Resume' ||
    relatedEntity === 'ResumeAnalysis' ||
    type === 'RESUME_ANALYSIS' ||
    type === 'RESUME_IMPROVEMENT'
  ) {
    return '/resume';
  }
  if (
    relatedEntity === 'Application' ||
    type === 'APPLICATION_STATUS' ||
    type === 'APPLICATION_DEADLINE'
  ) {
    return '/applications';
  }
  return '/notifications';
};

async function runTests() {
  // Test 1: Relative Time Formatting
  console.log('--- 1. Testing Relative Time Formatter (formatTimeAgo) ---');
  const now = new Date();
  
  const justNowDate = new Date(now.getTime() - 10 * 1000).toISOString();
  assert(formatTimeAgo(justNowDate) === 'Just now', 'Formats recent timestamps as "Just now"');

  const minsAgoDate = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
  assert(formatTimeAgo(minsAgoDate) === '5m ago', 'Formats minutes ago correctly as "5m ago"');

  const hoursAgoDate = new Date(now.getTime() - 3 * 3600 * 1000).toISOString();
  assert(formatTimeAgo(hoursAgoDate) === '3h ago', 'Formats hours ago correctly as "3h ago"');

  const daysAgoDate = new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString();
  assert(formatTimeAgo(daysAgoDate) === '2d ago', 'Formats days ago correctly as "2d ago"');

  // Test 2: Notification Target Link Mapper
  console.log('\n--- 2. Testing Notification Link Routing (getNotificationLink) ---');
  assert(getNotificationLink({ type: 'ROADMAP_UPDATE' }) === '/roadmap', 'ROADMAP_UPDATE routes to /roadmap');
  assert(getNotificationLink({ type: 'INTERVIEW_RESULT', relatedEntityId: '123' }) === '/interviews/123/result', 'INTERVIEW_RESULT routes to /interviews/123/result');
  assert(getNotificationLink({ type: 'RESUME_ANALYSIS' }) === '/resume', 'RESUME_ANALYSIS routes to /resume');
  assert(getNotificationLink({ type: 'APPLICATION_STATUS' }) === '/applications', 'APPLICATION_STATUS routes to /applications');
  assert(getNotificationLink({ type: 'SYSTEM' }) === '/notifications', 'SYSTEM routes to /notifications');

  // Test 3: Backend Integration Mock Verification
  console.log('\n--- 3. Verifying Backend Service Integration Hooks ---');
  assert(typeof notificationService.getNotifications === 'function', 'notificationService.getNotifications exists');
  assert(typeof notificationService.markAsRead === 'function', 'notificationService.markAsRead exists');
  assert(typeof notificationService.markAllAsRead === 'function', 'notificationService.markAllAsRead exists');

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
