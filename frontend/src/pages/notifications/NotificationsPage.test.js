import { notificationService } from '../../services/notificationService.js';

console.log('=== FRONTEND NOTIFICATION CENTER (F9.4) INTEGRATION TEST SUITE ===\n');

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

// Pure JS helpers mirroring component formatters
const formatType = (type) => {
  switch (type) {
    case 'LEARNING_TASK': return 'Learning Task';
    case 'ROADMAP_UPDATE': return 'Roadmap Update';
    case 'ROADMAP_MILESTONE': return 'Roadmap Milestone';
    case 'INTERVIEW_RESULT': return 'Interview Evaluation';
    case 'INTERVIEW_REMINDER': return 'Interview Reminder';
    case 'RESUME_ANALYSIS': return 'ATS Analysis';
    case 'RESUME_IMPROVEMENT': return 'ATS Score Improved';
    case 'APPLICATION_STATUS': return 'Application Update';
    case 'APPLICATION_DEADLINE': return 'Application Deadline';
    case 'SKILL_GAP': return 'Skill Gap Alert';
    case 'SYSTEM': return 'System Alert';
    default: return type ? type.replace(/_/g, ' ') : 'Notification';
  }
};

const formatFullDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  if (isToday) return `Today at ${timeStr}`;
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${timeStr}`;
};

async function runTests() {
  // Test 1: Type Formatter
  console.log('--- 1. Testing Notification Type Formatter ---');
  assert(formatType('ROADMAP_UPDATE') === 'Roadmap Update', 'Formats ROADMAP_UPDATE as "Roadmap Update"');
  assert(formatType('INTERVIEW_RESULT') === 'Interview Evaluation', 'Formats INTERVIEW_RESULT as "Interview Evaluation"');
  assert(formatType('RESUME_ANALYSIS') === 'ATS Analysis', 'Formats RESUME_ANALYSIS as "ATS Analysis"');
  assert(formatType('APPLICATION_STATUS') === 'Application Update', 'Formats APPLICATION_STATUS as "Application Update"');

  // Test 2: Date Formatter
  console.log('\n--- 2. Testing Date Formatter ---');
  const nowStr = new Date().toISOString();
  const formattedToday = formatFullDate(nowStr);
  assert(formattedToday.includes('Today at'), 'Formats today timestamp with "Today at"');

  // Test 3: Backend API Integration
  console.log('\n--- 3. Verifying Backend Notification Methods ---');
  assert(typeof notificationService.getNotifications === 'function', 'notificationService.getNotifications exists');
  assert(typeof notificationService.markAsRead === 'function', 'notificationService.markAsRead exists');
  assert(typeof notificationService.markAllAsRead === 'function', 'notificationService.markAllAsRead exists');
  assert(typeof notificationService.deleteNotification === 'function', 'notificationService.deleteNotification exists');

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
