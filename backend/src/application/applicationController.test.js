import applicationController, {
  applyJob,
  getApplicationDetails,
  getCandidateApplications,
  getJobApplications,
  updateApplicationStatus,
} from './application.controller.js';

console.log('=== INTERVIEWIQ AI - APPLICATION CONTROLLER TEST SUITE ===\n');

function runApplicationControllerTests() {
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
    assert(typeof applyJob === 'function', '1. applyJob endpoint handler defined');
    assert(typeof getApplicationDetails === 'function', '2. getApplicationDetails endpoint handler defined');
    assert(typeof updateApplicationStatus === 'function', '3. updateApplicationStatus endpoint handler defined');
    assert(typeof getCandidateApplications === 'function', '4. getCandidateApplications endpoint handler defined');
    assert(typeof getJobApplications === 'function', '5. getJobApplications endpoint handler defined');
    assert(typeof applicationController === 'object', '6. Default applicationController object exported');
  } catch (err) {
    assert(false, 'Application controller verification', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runApplicationControllerTests();
