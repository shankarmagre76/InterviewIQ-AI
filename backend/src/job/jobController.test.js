import jobController, {
  createJob,
  deleteJob,
  getJobDetails,
  searchJobs,
  updateJob,
} from './job.controller.js';

console.log('=== INTERVIEWIQ AI - JOB CONTROLLER TEST SUITE ===\n');

function runJobControllerTests() {
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
    assert(typeof createJob === 'function', '1. createJob endpoint handler defined');
    assert(typeof getJobDetails === 'function', '2. getJobDetails endpoint handler defined');
    assert(typeof updateJob === 'function', '3. updateJob endpoint handler defined');
    assert(typeof deleteJob === 'function', '4. deleteJob endpoint handler defined');
    assert(typeof searchJobs === 'function', '5. searchJobs endpoint handler defined');
    assert(typeof jobController === 'object', '6. Default jobController object exported');
  } catch (err) {
    assert(false, 'Job controller verification', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runJobControllerTests();
