import savedJobService, { SavedJobService } from './savedJob.service.js';

console.log('=== INTERVIEWIQ AI - SAVED JOB SERVICE TEST SUITE ===\n');

function runSavedJobServiceTests() {
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
    assert(savedJobService instanceof SavedJobService, '1. Default export is singleton instance of SavedJobService');
    assert(typeof savedJobService.saveJob === 'function', '2. saveJob business method defined');
    assert(typeof savedJobService.unsaveJob === 'function', '3. unsaveJob business method defined');
    assert(typeof savedJobService.getUserSavedJobs === 'function', '4. getUserSavedJobs business method defined');
    assert(typeof savedJobService.checkIsJobSaved === 'function', '5. checkIsJobSaved business method defined');
  } catch (err) {
    assert(false, 'SavedJob service interface verification', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runSavedJobServiceTests();
