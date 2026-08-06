import companyController, {
  createCompany,
  deleteCompany,
  getCompany,
  listCompanies,
  updateCompany,
} from './company.controller.js';

console.log('=== INTERVIEWIQ AI - COMPANY CONTROLLER TEST SUITE ===\n');

function runCompanyControllerTests() {
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
    assert(typeof createCompany === 'function', '1. createCompany endpoint handler defined');
    assert(typeof getCompany === 'function', '2. getCompany endpoint handler defined');
    assert(typeof updateCompany === 'function', '3. updateCompany endpoint handler defined');
    assert(typeof deleteCompany === 'function', '4. deleteCompany endpoint handler defined');
    assert(typeof listCompanies === 'function', '5. listCompanies endpoint handler defined');
    assert(typeof companyController === 'object', '6. Default companyController object exported');
  } catch (err) {
    assert(false, 'Company controller verification', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runCompanyControllerTests();
