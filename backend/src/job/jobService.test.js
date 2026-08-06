import jobService, { JobService } from './job.service.js';

console.log('=== INTERVIEWIQ AI - JOB SERVICE TEST SUITE ===\n');

function runJobServiceTests() {
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
    assert(jobService instanceof JobService, '1. Default export is singleton instance of JobService');
    assert(typeof jobService.createJob === 'function', '2. createJob business method defined');
    assert(typeof jobService.getJobDetails === 'function', '3. getJobDetails business method defined');
    assert(typeof jobService.updateJob === 'function', '4. updateJob business method defined');
    assert(typeof jobService.deleteJob === 'function', '5. deleteJob business method defined');
    assert(typeof jobService.searchJobs === 'function', '6. searchJobs business method defined');
  } catch (err) {
    assert(false, 'Job service interface verification', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runJobServiceTests();
