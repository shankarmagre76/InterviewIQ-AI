import jobRepository, { JobRepository } from './job.repository.js';

console.log('=== INTERVIEWIQ AI - JOB REPOSITORY TEST SUITE ===\n');

function runJobRepositoryTests() {
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
    assert(jobRepository instanceof JobRepository, '1. Default export is singleton instance of JobRepository');
    assert(typeof jobRepository.createJob === 'function', '2. createJob method defined');
    assert(typeof jobRepository.getJob === 'function', '3. getJob method defined');
    assert(typeof jobRepository.getJobById === 'function', '4. getJobById alias method defined');
    assert(typeof jobRepository.updateJob === 'function', '5. updateJob method defined');
    assert(typeof jobRepository.deleteJob === 'function', '6. deleteJob method defined');
    assert(typeof jobRepository.searchJobs === 'function', '7. searchJobs method defined');
  } catch (err) {
    assert(false, 'Job repository method verification', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runJobRepositoryTests();
