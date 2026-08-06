import savedJobRepository, { SavedJobRepository } from './savedJob.repository.js';

console.log('=== INTERVIEWIQ AI - SAVED JOB REPOSITORY TEST SUITE ===\n');

function runSavedJobRepositoryTests() {
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
    assert(savedJobRepository instanceof SavedJobRepository, '1. Default export is singleton instance of SavedJobRepository');
    assert(typeof savedJobRepository.saveJob === 'function', '2. saveJob method defined');
    assert(typeof savedJobRepository.unsaveJob === 'function', '3. unsaveJob method defined');
    assert(typeof savedJobRepository.getSavedJobs === 'function', '4. getSavedJobs method defined');
    assert(typeof savedJobRepository.isJobSaved === 'function', '5. isJobSaved method defined');
    assert(typeof savedJobRepository.countSavedJobsByUser === 'function', '6. countSavedJobsByUser method defined');
  } catch (err) {
    assert(false, 'SavedJob repository method verification', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runSavedJobRepositoryTests();
