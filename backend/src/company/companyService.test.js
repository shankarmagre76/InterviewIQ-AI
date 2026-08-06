import companyService, { CompanyService } from './company.service.js';

console.log('=== INTERVIEWIQ AI - COMPANY SERVICE TEST SUITE ===\n');

function runCompanyServiceTests() {
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
    assert(companyService instanceof CompanyService, '1. Default export is singleton instance of CompanyService');
    assert(typeof companyService.createCompany === 'function', '2. createCompany business method defined');
    assert(typeof companyService.getCompany === 'function', '3. getCompany business method defined');
    assert(typeof companyService.updateCompany === 'function', '4. updateCompany business method defined');
    assert(typeof companyService.deleteCompany === 'function', '5. deleteCompany business method defined');
    assert(typeof companyService.listCompanies === 'function', '6. listCompanies business method defined');
  } catch (err) {
    assert(false, 'Company service interface verification', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runCompanyServiceTests();
