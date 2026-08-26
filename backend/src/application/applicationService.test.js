import applicationService, { ApplicationService } from './application.service.js';

console.log('=== INTERVIEWIQ AI - APPLICATION SERVICE TEST SUITE ===\n');

function runApplicationServiceTests() {
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
    assert(applicationService instanceof ApplicationService, '1. Default export is singleton instance of ApplicationService');
    assert(typeof applicationService.applyJob === 'function', '2. applyJob business method defined');
    assert(typeof applicationService.getApplicationDetails === 'function', '3. getApplicationDetails business method defined');
    assert(typeof applicationService.updateApplicationStatus === 'function', '4. updateApplicationStatus business method defined');
    assert(typeof applicationService.getCandidateApplications === 'function', '5. getCandidateApplications business method defined');
    assert(typeof applicationService.getJobApplications === 'function', '6. getJobApplications business method defined');
  } catch (err) {
    assert(false, 'Application service interface verification', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runApplicationServiceTests();
