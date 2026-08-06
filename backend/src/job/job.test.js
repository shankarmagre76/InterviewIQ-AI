import mongoose from 'mongoose';
import Job, {
  EMPLOYMENT_TYPES,
  JOB_STATUSES,
  SALARY_PERIODS,
  WORK_MODES,
} from './job.model.js';
import {
  createJobValidation,
  jobIdParamValidation,
  updateJobValidation,
  validate,
} from './job.validation.js';

console.log('=== INTERVIEWIQ AI - JOB MODULE SCHEMA & VALIDATION TEST SUITE ===\n');

async function runJobTests() {
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

  const mockCompanyId = new mongoose.Types.ObjectId();
  const mockUserId = new mongoose.Types.ObjectId();
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days in future

  // Test 1: Valid Job Payload (Mongoose Validation)
  try {
    const validJob = new Job({
      company: mockCompanyId,
      title: 'Senior Full Stack Software Engineer',
      description:
        'We are searching for an experienced Full Stack Engineer to lead our enterprise Web3 and AI platform developments.',
      responsibilities: [
        'Architect responsive frontend UI using Next.js & TailwindCSS.',
        '  Build scalable microservices with Node.js and MongoDB.  ',
        'Architect responsive frontend UI using Next.js & TailwindCSS.', // Duplicate item
      ],
      requiredSkills: ['Node.js', 'React', 'MongoDB', 'TypeScript', ' node.js '],
      preferredSkills: ['AWS', 'Docker', 'GraphQL', '  AWS  '],
      experience: {
        minYears: 3,
        maxYears: 7,
      },
      salary: {
        min: 120000,
        max: 160000,
        currency: 'USD',
        period: 'Yearly',
        isDisclosed: true,
      },
      location: 'New York, NY (Hybrid)',
      workMode: 'Hybrid',
      employmentType: 'Full-time',
      openings: 3,
      applicationDeadline: futureDate,
      status: 'Active',
      createdBy: mockUserId,
    });

    await validJob.validate();
    assert(true, '1. Valid Job payload passes Mongoose schema validation');

    assert(
      validJob.requiredSkills.length === 4 && validJob.requiredSkills.includes('Node.js'),
      '2. Required skills pre-validate hook trims & deduplicates elements correctly'
    );
    assert(
      validJob.preferredSkills.length === 3 && validJob.preferredSkills.includes('AWS'),
      '3. Preferred skills pre-validate hook trims & deduplicates elements correctly'
    );
    assert(
      validJob.responsibilities.length === 2,
      '4. Responsibilities array cleaned and trimmed correctly'
    );
  } catch (err) {
    assert(false, '1. Valid Job payload passes Mongoose schema validation', err.message);
  }

  // Test 2: Missing Required Fields Rejection
  try {
    const emptyJob = new Job({});
    const err = emptyJob.validateSync();

    assert(!!err, '5. Empty payload triggers Mongoose validation errors');
    assert(!!err?.errors?.company, '6. Reject missing company ID');
    assert(!!err?.errors?.title, '7. Reject missing title');
    assert(!!err?.errors?.description, '8. Reject missing description');
    assert(!!err?.errors?.requiredSkills, '9. Reject missing requiredSkills');
    assert(!!err?.errors?.experience, '10. Reject missing experience requirement');
    assert(!!err?.errors?.location, '11. Reject missing location');
    assert(!!err?.errors?.workMode, '12. Reject missing workMode');
    assert(!!err?.errors?.employmentType, '13. Reject missing employmentType');
    assert(!!err?.errors?.applicationDeadline, '14. Reject missing applicationDeadline');
    assert(!!err?.errors?.createdBy, '15. Reject missing createdBy');
  } catch (err) {
    assert(false, '5. Empty payload triggers Mongoose validation errors', err.message);
  }

  // Test 3: Experience Cross-Field Validation (maxYears < minYears)
  try {
    const invalidExpJob = new Job({
      company: mockCompanyId,
      title: 'Backend Engineer',
      description: 'Building Node.js microservices with High performance & throughput.',
      requiredSkills: ['Node.js'],
      experience: {
        minYears: 5,
        maxYears: 2, // Invalid
      },
      location: 'Remote',
      workMode: 'Remote',
      employmentType: 'Full-time',
      applicationDeadline: futureDate,
      createdBy: mockUserId,
    });

    const err = invalidExpJob.validateSync();
    assert(
      !!err?.errors?.['experience.maxYears'],
      '16. Reject experience where maxYears is less than minYears'
    );
  } catch (err) {
    assert(false, '16. Reject experience where maxYears < minYears', err.message);
  }

  // Test 4: Salary Cross-Field Validation (max < min when disclosed)
  try {
    const invalidSalaryJob = new Job({
      company: mockCompanyId,
      title: 'DevOps Specialist',
      description: 'Managing Kubernetes clusters and CI/CD pipelines across AWS clouds.',
      requiredSkills: ['Kubernetes'],
      experience: { minYears: 2, maxYears: 5 },
      salary: {
        min: 100000,
        max: 80000, // Invalid
        isDisclosed: true,
      },
      location: 'Remote',
      workMode: 'Remote',
      employmentType: 'Full-time',
      applicationDeadline: futureDate,
      createdBy: mockUserId,
    });

    const err = invalidSalaryJob.validateSync();
    assert(
      !!err?.errors?.['salary.max'],
      '17. Reject salary where max is less than min when disclosed'
    );
  } catch (err) {
    assert(false, '17. Reject salary where max < min when disclosed', err.message);
  }

  // Test 5: Enum Validation Failures
  try {
    const invalidEnumJob = new Job({
      company: mockCompanyId,
      title: 'QA Lead',
      description: 'Automated test suite maintenance using Cypress and Jest frameworks.',
      requiredSkills: ['Jest'],
      experience: { minYears: 1, maxYears: 3 },
      location: 'Chicago',
      workMode: 'Virtual', // Invalid Enum
      employmentType: 'Gig', // Invalid Enum
      status: 'Archived', // Invalid Enum
      applicationDeadline: futureDate,
      createdBy: mockUserId,
    });

    const err = invalidEnumJob.validateSync();
    assert(!!err?.errors?.workMode, '18. Reject invalid workMode enum choice');
    assert(!!err?.errors?.employmentType, '19. Reject invalid employmentType enum choice');
    assert(!!err?.errors?.status, '20. Reject invalid status enum choice');
  } catch (err) {
    assert(false, '18. Enum validation failures', err.message);
  }

  // Test 6: Express Validator Middleware Exports Check
  try {
    assert(
      Array.isArray(createJobValidation) && createJobValidation.length > 0,
      '21. createJobValidation rules exported as middleware array'
    );
    assert(
      Array.isArray(updateJobValidation) && updateJobValidation.length > 0,
      '22. updateJobValidation rules exported as middleware array'
    );
    assert(
      Array.isArray(jobIdParamValidation) && jobIdParamValidation.length > 0,
      '23. jobIdParamValidation rules exported as middleware array'
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

runJobTests();
