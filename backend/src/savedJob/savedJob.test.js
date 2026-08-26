import mongoose from 'mongoose';
import SavedJob from './savedJob.model.js';
import {
  savedJobParamValidation,
  saveJobValidation,
  validate,
} from './savedJob.validation.js';

console.log('=== INTERVIEWIQ AI - SAVED JOB MODULE SCHEMA & VALIDATION TEST SUITE ===\n');

async function runSavedJobTests() {
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

  // Test 1: Valid SavedJob Creation (Mongoose Validation)
  try {
    const validSavedJob = new SavedJob({
      user: mockUserId,
      job: mockJobId,
    });

    await validSavedJob.validate();
    assert(true, '1. Valid SavedJob payload passes Mongoose schema validation');
    assert(
      validSavedJob.savedAt instanceof Date,
      '2. Default savedAt automatically initialized to current Date'
    );
  } catch (err) {
    assert(false, '1. Valid SavedJob payload passes Mongoose schema validation', err.message);
  }

  // Test 2: Missing Required Fields Rejection (Mongoose Validation)
  try {
    const emptySavedJob = new SavedJob({});
    const err = emptySavedJob.validateSync();

    assert(!!err, '3. Empty payload triggers Mongoose validation errors');
    assert(!!err?.errors?.user, '4. Reject missing user ID');
    assert(!!err?.errors?.job, '5. Reject missing job ID');
  } catch (err) {
    assert(false, '3. Empty payload triggers Mongoose validation errors', err.message);
  }

  // Test 3: Unique Compound Index Verification ({ user: 1, job: 1 })
  try {
    const indexes = SavedJob.schema.indexes();
    const uniqueUserJobIndex = indexes.find(
      (idx) =>
        idx[0]?.user === 1 &&
        idx[0]?.job === 1 &&
        idx[1]?.unique === true
    );

    assert(
      !!uniqueUserJobIndex,
      '6. Unique compound index { user: 1, job: 1 } configured to prevent duplicate saved jobs per user'
    );
  } catch (err) {
    assert(false, '6. Unique compound index verification', err.message);
  }

  // Test 4: Express Validator Middleware Exports Check
  try {
    assert(
      Array.isArray(saveJobValidation) && saveJobValidation.length > 0,
      '7. saveJobValidation rules exported as middleware array'
    );
    assert(
      Array.isArray(savedJobParamValidation) && savedJobParamValidation.length > 0,
      '8. savedJobParamValidation rules exported as middleware array'
    );
    assert(typeof validate === 'function', '9. validate middleware function exported');
  } catch (err) {
    assert(false, '7. Express validator middleware export verification', err.message);
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

runSavedJobTests();
