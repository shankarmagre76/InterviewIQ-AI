import companyRepository, { CompanyRepository } from './company.repository.js';

console.log('=== INTERVIEWIQ AI - COMPANY REPOSITORY TEST SUITE ===\n');

function runCompanyRepositoryTests() {
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
    assert(companyRepository instanceof CompanyRepository, '1. Default export is singleton instance of CompanyRepository');
    assert(typeof companyRepository.createCompany === 'function', '2. createCompany method defined');
    assert(typeof companyRepository.getCompany === 'function', '3. getCompany method defined');
    assert(typeof companyRepository.getCompanyByName === 'function', '4. getCompanyByName method defined');
    assert(typeof companyRepository.updateCompany === 'function', '5. updateCompany method defined');
    assert(typeof companyRepository.deleteCompany === 'function', '6. deleteCompany method defined');
    assert(typeof companyRepository.listCompanies === 'function', '7. listCompanies method defined');
  } catch (err) {
    assert(false, 'Company repository method verification', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runCompanyRepositoryTests();
