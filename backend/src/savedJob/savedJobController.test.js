import savedJobController, {
  checkIsJobSaved,
  getUserSavedJobs,
  saveJob,
  unsaveJob,
} from './savedJob.controller.js';

console.log('=== INTERVIEWIQ AI - SAVED JOB CONTROLLER TEST SUITE ===\n');

function runSavedJobControllerTests() {
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
    assert(typeof saveJob === 'function', '1. saveJob endpoint handler defined');
    assert(typeof unsaveJob === 'function', '2. unsaveJob endpoint handler defined');
    assert(typeof getUserSavedJobs === 'function', '3. getUserSavedJobs endpoint handler defined');
    assert(typeof checkIsJobSaved === 'function', '4. checkIsJobSaved endpoint handler defined');
    assert(typeof savedJobController === 'object', '5. Default savedJobController object exported');
  } catch (err) {
    assert(false, 'SavedJob controller verification', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runSavedJobControllerTests();
