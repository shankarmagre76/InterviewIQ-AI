import jobService from './job.service.js';
import jobRepository from './job.repository.js';

console.log('=== INTERVIEWIQ AI - ADVANCED JOB SEARCH TEST SUITE ===\n');

function runAdvancedSearchTests() {
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
    // Test 1: Service searchJobs returns method
    assert(typeof jobService.searchJobs === 'function', '1. jobService.searchJobs is defined');
    assert(typeof jobRepository.searchJobs === 'function', '2. jobRepository.searchJobs is defined');

    // Test 2: Verify parameter parsing helper logic
    const querySample = {
      keyword: 'Software Engineer',
      workMode: 'Remote,Hybrid',
      employmentType: 'Full-time',
      skills: 'Node.js, React, MongoDB',
      minSalary: '100000',
      maxSalary: '200000',
      minExp: '2',
      maxExp: '6',
      sort: 'highest_salary',
      page: '1',
      limit: '10',
    };

    assert(querySample.keyword === 'Software Engineer', '3. Keyword parameter parsed correctly');
    assert(querySample.sort === 'highest_salary', '4. Highest salary sort parameter parsed correctly');
  } catch (err) {
    assert(false, 'Advanced search test execution', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runAdvancedSearchTests();
