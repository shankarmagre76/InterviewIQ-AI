import mongoose from 'mongoose';
import Company, { COMPANY_SIZES, HIRING_STATUSES, INDUSTRIES } from './company.model.js';
import {
  createCompanyValidation,
  updateCompanyValidation,
  companyIdParamValidation,
  validate,
} from './company.validation.js';

console.log('=== INTERVIEWIQ AI - COMPANY MODULE SCHEMA & VALIDATION TEST SUITE ===\n');

async function runCompanyTests() {
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

  const mockUserId = new mongoose.Types.ObjectId();

  // Test 1: Valid Company Creation (Mongoose Validation)
  try {
    const validCompany = new Company({
      companyName: 'TechCorp Solutions',
      companyLogo: 'https://cdn.example.com/logos/techcorp.png',
      website: 'https://techcorp.example.com',
      description: 'Leading provider of enterprise AI & cloud software solutions.',
      industry: 'Software Development',
      headquarters: 'San Francisco, CA, USA',
      locations: ['San Francisco', 'Bengaluru', 'London', '  Bengaluru  '],
      companySize: '51-200',
      foundedYear: 2018,
      email: 'contact@techcorp.example.com',
      phone: '+1-555-019-2834',
      socialLinks: {
        linkedin: 'https://linkedin.com/company/techcorp',
        github: 'https://github.com/techcorp',
      },
      hiringStatus: 'Actively Hiring',
      createdBy: mockUserId,
    });

    await validCompany.validate();
    assert(true, '1. Valid Company payload passes Mongoose validation');
    assert(
      validCompany.locations.length === 3 && validCompany.locations.includes('Bengaluru'),
      '2. Locations pre-validate hook trims & deduplicates elements correctly'
    );
  } catch (err) {
    assert(false, '1. Valid Company payload passes Mongoose validation', err.message);
  }

  // Test 2: Missing Required Fields Failure (Mongoose Validation)
  try {
    const emptyCompany = new Company({});
    const err = emptyCompany.validateSync();

    assert(!!err, '3. Empty payload triggers Mongoose validation errors');
    assert(!!err?.errors?.companyName, '4. Reject missing companyName');
    assert(!!err?.errors?.website, '5. Reject missing website');
    assert(!!err?.errors?.description, '6. Reject missing description');
    assert(!!err?.errors?.industry, '7. Reject missing industry');
    assert(!!err?.errors?.headquarters, '8. Reject missing headquarters');
    assert(!!err?.errors?.companySize, '9. Reject missing companySize');
    assert(!!err?.errors?.foundedYear, '10. Reject missing foundedYear');
    assert(!!err?.errors?.email, '11. Reject missing email');
    assert(!!err?.errors?.createdBy, '12. Reject missing createdBy');
  } catch (err) {
    assert(false, '3. Empty payload triggers Mongoose validation errors', err.message);
  }

  // Test 3: Enum & Regex Validations (Mongoose Validation)
  try {
    const invalidEnumsCompany = new Company({
      companyName: 'X',
      website: 'not-a-valid-url',
      description: 'Too short',
      industry: 'Invalid Industry Name',
      headquarters: 'Location',
      companySize: 'Invalid Size',
      foundedYear: 1750,
      email: 'invalid-email-address',
      hiringStatus: 'Invalid Status',
      createdBy: mockUserId,
    });

    const err = invalidEnumsCompany.validateSync();
    assert(!!err?.errors?.companyName, '13. Reject companyName shorter than 2 chars');
    assert(!!err?.errors?.website, '14. Reject invalid website URL format');
    assert(!!err?.errors?.description, '15. Reject description shorter than 10 chars');
    assert(!!err?.errors?.industry, '16. Reject invalid industry enum choice');
    assert(!!err?.errors?.companySize, '17. Reject invalid companySize enum choice');
    assert(!!err?.errors?.foundedYear, '18. Reject foundedYear earlier than 1800');
    assert(!!err?.errors?.email, '19. Reject invalid contact email format');
    assert(!!err?.errors?.hiringStatus, '20. Reject invalid hiringStatus enum choice');
  } catch (err) {
    assert(false, '13. Enum & regex validations pass', err.message);
  }

  // Test 4: Express Validator Middleware Exports Check
  try {
    assert(
      Array.isArray(createCompanyValidation) && createCompanyValidation.length > 0,
      '21. createCompanyValidation middleware rules exported as array'
    );
    assert(
      Array.isArray(updateCompanyValidation) && updateCompanyValidation.length > 0,
      '22. updateCompanyValidation middleware rules exported as array'
    );
    assert(
      Array.isArray(companyIdParamValidation) && companyIdParamValidation.length > 0,
      '23. companyIdParamValidation middleware rules exported as array'
    );
    assert(typeof validate === 'function', '24. validate middleware function exported');
  } catch (err) {
    assert(false, '21. Express validator middleware export verification', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runCompanyTests();
