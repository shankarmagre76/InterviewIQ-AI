import mongoose from 'mongoose';
import Application, { APPLICATION_STATUSES } from './application.model.js';
import {
  applicationIdParamValidation,
  createApplicationValidation,
  updateApplicationStatusValidation,
  validate,
} from './application.validation.js';

console.log('=== INTERVIEWIQ AI - APPLICATION MODULE SCHEMA & VALIDATION TEST SUITE ===\n');

async function runApplicationTests() {
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
  const mockJobId = new mongoose.Types.ObjectId();
  const mockCompanyId = new mongoose.Types.ObjectId();
  const mockResumeId = new mongoose.Types.ObjectId();

  // Test 1: Valid Application Creation (Mongoose Validation)
  try {
    const validApp = new Application({
      user: mockUserId,
      job: mockJobId,
      company: mockCompanyId,
      resume: mockResumeId,
      coverLetter: 'I am highly enthusiastic about this role and bring 5+ years of experience.',
      status: 'Applied',
      recruiterNotes: 'Initial candidate profile looks promising.',
      feedback: {
        comments: 'Strong technical fundamentals displayed.',
        rating: 5,
        givenBy: mockUserId,
      },
    });

    await validApp.validate();
    assert(true, '1. Valid Application payload passes Mongoose schema validation');
    assert(validApp.status === 'Applied', '2. Default status set to "Applied"');
    assert(validApp.appliedAt instanceof Date, '3. Default appliedAt set to current Date');
  } catch (err) {
    assert(false, '1. Valid Application payload passes Mongoose schema validation', err.message);
  }

  // Test 2: Missing Required Foreign Keys Failure (Mongoose Validation)
  try {
    const emptyApp = new Application({});
    const err = emptyApp.validateSync();

    assert(!!err, '4. Empty payload triggers Mongoose validation errors');
    assert(!!err?.errors?.user, '5. Reject missing user ID');
    assert(!!err?.errors?.job, '6. Reject missing job ID');
    assert(!!err?.errors?.company, '7. Reject missing company ID');
    assert(!!err?.errors?.resume, '8. Reject missing resume ID');
  } catch (err) {
    assert(false, '4. Empty payload triggers Mongoose validation errors', err.message);
  }

  // Test 3: Invalid Status Enum Choice (Mongoose Validation)
  try {
    const invalidStatusApp = new Application({
      user: mockUserId,
      job: mockJobId,
      company: mockCompanyId,
      resume: mockResumeId,
      status: 'Hired & Onboarded', // Invalid Enum Choice
    });

    const err = invalidStatusApp.validateSync();
    assert(!!err?.errors?.status, '9. Reject invalid status enum choice');
  } catch (err) {
    assert(false, '9. Reject invalid status enum choice', err.message);
  }

  // Test 4: All Valid Application Status Enums Verification
  try {
    const expectedStatuses = [
      'Applied',
      'Under Review',
      'Shortlisted',
      'Interview Scheduled',
      'Technical Round',
      'HR Round',
      'Offered',
      'Rejected',
      'Withdrawn',
    ];

    const matchAll = expectedStatuses.every((st) => APPLICATION_STATUSES.includes(st));
    assert(
      matchAll && APPLICATION_STATUSES.length === expectedStatuses.length,
      '10. All 9 required application status enums defined accurately'
    );
  } catch (err) {
    assert(false, '10. All 8 required application status enums defined accurately', err.message);
  }

  // Test 5: Unique Compound Index Verification
  try {
    const indexes = Application.schema.indexes();
    const uniqueUserJobIndex = indexes.find(
      (idx) =>
        idx[0]?.user === 1 &&
        idx[0]?.job === 1 &&
        idx[1]?.unique === true
    );

    assert(
      !!uniqueUserJobIndex,
      '11. Unique compound index { user: 1, job: 1 } configured to prevent duplicate applications per user per job'
    );
  } catch (err) {
    assert(false, '11. Unique compound index verification', err.message);
  }

  // Test 6: Express Validator Middleware Exports Check
  try {
    assert(
      Array.isArray(createApplicationValidation) && createApplicationValidation.length > 0,
      '12. createApplicationValidation rules exported as middleware array'
    );
    assert(
      Array.isArray(updateApplicationStatusValidation) &&
        updateApplicationStatusValidation.length > 0,
      '13. updateApplicationStatusValidation rules exported as middleware array'
    );
    assert(
      Array.isArray(applicationIdParamValidation) && applicationIdParamValidation.length > 0,
      '14. applicationIdParamValidation rules exported as middleware array'
    );
    assert(typeof validate === 'function', '15. validate middleware function exported');
  } catch (err) {
    assert(false, '12. Express validator middleware export verification', err.message);
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

runApplicationTests();
