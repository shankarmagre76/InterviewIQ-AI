import applicationRepository, { ApplicationRepository } from './application.repository.js';

console.log('=== INTERVIEWIQ AI - APPLICATION REPOSITORY TEST SUITE ===\n');

function runApplicationRepositoryTests() {
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
    assert(applicationRepository instanceof ApplicationRepository, '1. Default export is singleton instance of ApplicationRepository');
    assert(typeof applicationRepository.applyJob === 'function', '2. applyJob method defined');
    assert(typeof applicationRepository.createApplication === 'function', '3. createApplication alias method defined');
    assert(typeof applicationRepository.getApplicationById === 'function', '4. getApplicationById method defined');
    assert(typeof applicationRepository.getApplications === 'function', '5. getApplications method defined');
    assert(typeof applicationRepository.updateStatus === 'function', '6. updateStatus method defined');
    assert(typeof applicationRepository.findExistingApplication === 'function', '7. findExistingApplication method defined');
    assert(typeof applicationRepository.countApplicationsByJob === 'function', '8. countApplicationsByJob method defined');
  } catch (err) {
    assert(false, 'Application repository method verification', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runApplicationRepositoryTests();
