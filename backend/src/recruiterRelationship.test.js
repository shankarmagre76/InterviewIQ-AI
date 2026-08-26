import mongoose from 'mongoose';
import companyService from './company/company.service.js';
import companyRepository from './company/company.repository.js';
import jobService from './job/job.service.js';
import jobRepository from './job/job.repository.js';
import ApiError from './utils/ApiError.js';

console.log('=== INTERVIEWIQ AI - RECRUITER → COMPANY → JOB RELATIONSHIP TEST SUITE ===\n');

async function runRelationshipTests() {
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

  const recruiter1 = { _id: new mongoose.Types.ObjectId().toString(), role: 'Recruiter' };
  const recruiter2 = { _id: new mongoose.Types.ObjectId().toString(), role: 'Recruiter' };

  const company1Data = {
    _id: new mongoose.Types.ObjectId().toString(),
    companyName: 'Acme AI Labs',
    website: 'https://acmeai.example.com',
    description: 'Advanced AI research lab building modern LLM applications.',
    industry: 'AI/ML',
    headquarters: 'San Francisco, CA',
    companySize: '11-50',
    foundedYear: 2022,
    email: 'hiring@acmeai.example.com',
    hiringStatus: 'Actively Hiring',
    createdBy: recruiter1._id,
  };

  const company2Data = {
    _id: new mongoose.Types.ObjectId().toString(),
    companyName: 'Beta Systems Corp',
    website: 'https://betasystems.example.com',
    description: 'Enterprise cloud infrastructure and developer platform solutions.',
    industry: 'Software Development',
    headquarters: 'Austin, TX',
    companySize: '51-200',
    foundedYear: 2019,
    email: 'jobs@betasystems.example.com',
    hiringStatus: 'Actively Hiring',
    createdBy: recruiter2._id,
  };

  // In-memory data store for mocks
  const companiesStore = [];
  const jobsStore = [];

  // Backup original repository methods
  const origCompGetByOwner = companyRepository.getCompanyByOwner;
  const origCompGetByName = companyRepository.getCompanyByName;
  const origCompGetById = companyRepository.getCompanyById;
  const origCompCreate = companyRepository.createCompany;

  const origJobCreate = jobRepository.createJob;
  const origJobGet = jobRepository.getJob;
  const origJobUpdate = jobRepository.updateJob;
  const origJobDelete = jobRepository.deleteJob;
  const origJobSearch = jobRepository.searchJobs;

  // Mock Company Repository
  companyRepository.getCompanyByOwner = async (ownerId) => {
    return companiesStore.find((c) => c.createdBy.toString() === ownerId.toString()) || null;
  };
  companyRepository.getCompanyByName = async (name) => {
    return companiesStore.find((c) => c.companyName.toLowerCase() === name.toLowerCase()) || null;
  };
  companyRepository.getCompanyById = async (id) => {
    return companiesStore.find((c) => c._id.toString() === id.toString()) || null;
  };
  companyRepository.getCompany = async (id) => {
    return companiesStore.find((c) => c._id.toString() === id.toString()) || null;
  };
  companyRepository.createCompany = async (data) => {
    const newComp = { _id: new mongoose.Types.ObjectId().toString(), ...data };
    companiesStore.push(newComp);
    return newComp;
  };

  // Mock Job Repository
  jobRepository.createJob = async (data) => {
    const newJob = { _id: new mongoose.Types.ObjectId().toString(), ...data };
    jobsStore.push(newJob);
    return newJob;
  };
  jobRepository.getJob = async (id) => {
    return jobsStore.find((j) => j._id.toString() === id.toString()) || null;
  };
  jobRepository.updateJob = async (id, update) => {
    const index = jobsStore.findIndex((j) => j._id.toString() === id.toString());
    if (index !== -1) {
      jobsStore[index] = { ...jobsStore[index], ...update };
      return jobsStore[index];
    }
    return null;
  };
  jobRepository.deleteJob = async (id) => {
    const index = jobsStore.findIndex((j) => j._id.toString() === id.toString());
    if (index !== -1) {
      const deleted = jobsStore.splice(index, 1);
      return deleted[0];
    }
    return null;
  };
  jobRepository.searchJobs = async (filter = {}, options = {}) => {
    let result = [...jobsStore];
    if (filter.company) {
      result = result.filter((j) => j.company.toString() === filter.company.toString());
    }
    if (filter.createdBy) {
      result = result.filter((j) => j.createdBy.toString() === filter.createdBy.toString());
    }
    return { jobs: result, total: result.length, page: 1, limit: 10, totalPages: 1 };
  };

  try {
    // COMPANY-001: Recruiter without company tries to create a job -> 400 Bad Request
    try {
      await jobService.createJob(
        {
          title: 'Senior AI Engineer',
          description: 'Build frontier AI model infrastructure.',
          requiredSkills: ['Python', 'PyTorch'],
          experience: { minYears: 2, maxYears: 5 },
          location: 'San Francisco, CA',
          workMode: 'Remote',
          employmentType: 'Full-time',
          applicationDeadline: new Date(Date.now() + 864000000).toISOString(),
        },
        recruiter1
      );
      assert(false, 'COMPANY-001: Recruiter without company creates job', 'Should have failed with Bad Request');
    } catch (err) {
      assert(
        err.statusCode === 400 && err.message.includes('create a company profile'),
        'COMPANY-001: Recruiter without company -> Create Job rejected with clear message'
      );
    }

    // COMPANY-002: Recruiter creates company profile -> successful
    let createdComp1 = null;
    try {
      createdComp1 = await companyService.createCompany(company1Data, recruiter1);
      assert(
        createdComp1 && createdComp1.companyName === 'Acme AI Labs',
        'COMPANY-002: Recruiter creates company profile successfully'
      );
    } catch (err) {
      assert(false, 'COMPANY-002: Recruiter creates company profile', err.message);
    }

    // COMPANY-003: Recruiter attempts to create second company -> 409 Conflict
    try {
      const secondCompAttempt = await companyService.createCompany(
        {
          companyName: 'Acme AI Labs Second Branch',
          website: 'https://acme2.example.com',
          description: 'Second company profile attempt.',
          industry: 'AI/ML',
          headquarters: 'New York, NY',
          companySize: '1-10',
          foundedYear: 2024,
          email: 'admin@acme2.example.com',
          hiringStatus: 'Actively Hiring',
        },
        recruiter1
      );
      assert(false, 'COMPANY-003: Recruiter creates second company', 'Should have failed with 409 Conflict');
    } catch (err) {
      if (err.statusCode === 409 && err.message.includes('already has a company profile')) {
        assert(
          true,
          'COMPANY-003: Recruiter creating second company profile -> rejected with 409 Conflict'
        );
      } else {
        assert(
          false,
          'COMPANY-003: Recruiter creating second company profile -> rejected with 409 Conflict',
          `Got error status ${err.statusCode}: ${err.message}`
        );
      }
    }

    // JOB-001: Recruiter with company creates first job -> successful
    let job1 = null;
    try {
      job1 = await jobService.createJob(
        {
          title: 'Senior AI Engineer',
          description: 'Build frontier AI model infrastructure and training pipelines.',
          requiredSkills: ['Python', 'PyTorch', 'Distributed Training'],
          experience: { minYears: 3, maxYears: 6 },
          location: 'San Francisco, CA',
          workMode: 'Remote',
          employmentType: 'Full-time',
          applicationDeadline: new Date(Date.now() + 864000000).toISOString(),
        },
        recruiter1
      );
      assert(
        job1 && job1.company.toString() === createdComp1._id.toString(),
        'JOB-001: Recruiter creates first job -> automatically associated with owned company'
      );
    } catch (err) {
      assert(false, 'JOB-001: Recruiter creates first job', err.message);
    }

    // JOB-002: Same recruiter creates second job -> successful
    let job2 = null;
    try {
      job2 = await jobService.createJob(
        {
          title: 'Full Stack Engineer',
          description: 'Develop WebGL and React dashboards for AI insights.',
          requiredSkills: ['React', 'Node.js', 'TypeScript'],
          experience: { minYears: 2, maxYears: 4 },
          location: 'San Francisco, CA',
          workMode: 'Hybrid',
          employmentType: 'Full-time',
          applicationDeadline: new Date(Date.now() + 864000000).toISOString(),
        },
        recruiter1
      );
      assert(
        job2 && job2.company.toString() === createdComp1._id.toString(),
        'JOB-002: Same recruiter creates second job -> successful'
      );
    } catch (err) {
      assert(false, 'JOB-002: Same recruiter creates second job', err.message);
    }

    // JOB-003: Verify multiple jobs belong to the same company
    try {
      const myJobs = await jobService.getMyJobs(recruiter1);
      assert(
        myJobs.jobs.length === 2 && myJobs.jobs.every((j) => j.company.toString() === createdComp1._id.toString()),
        'JOB-003: Multiple jobs created by recruiter are all associated with the SAME company'
      );
    } catch (err) {
      assert(false, 'JOB-003: Verify recruiter jobs', err.message);
    }

    // JOB-004: Recruiter attempts to send another company's ID manually -> overridden securely
    try {
      const fakeCompanyId = new mongoose.Types.ObjectId().toString();
      const jobWithFakeCompany = await jobService.createJob(
        {
          company: fakeCompanyId, // Manual attempt to bypass
          title: 'DevOps Engineer',
          description: 'Maintain Kubernetes clusters and CI/CD automation pipelines.',
          requiredSkills: ['Docker', 'Kubernetes', 'AWS'],
          experience: { minYears: 2, maxYears: 5 },
          location: 'Remote',
          workMode: 'Remote',
          employmentType: 'Full-time',
          applicationDeadline: new Date(Date.now() + 864000000).toISOString(),
        },
        recruiter1
      );
      assert(
        jobWithFakeCompany.company.toString() === createdComp1._id.toString() &&
          jobWithFakeCompany.company.toString() !== fakeCompanyId,
        'JOB-004: Manual company ID sent by frontend is ignored and overridden with recruiter\'s derived company'
      );
    } catch (err) {
      assert(false, 'JOB-004: Override manual company ID', err.message);
    }

    // Setup Recruiter 2 & Company 2 for cross-ownership testing
    const createdComp2 = await companyService.createCompany(company2Data, recruiter2);
    const jobRecruiter2 = await jobService.createJob(
      {
        title: 'Backend Systems Architect',
        description: 'Design distributed database services and Golang microservices.',
        requiredSkills: ['Go', 'PostgreSQL', 'gRPC'],
        experience: { minYears: 5, maxYears: 10 },
        location: 'Austin, TX',
        workMode: 'On-site',
        employmentType: 'Full-time',
        applicationDeadline: new Date(Date.now() + 864000000).toISOString(),
      },
      recruiter2
    );

    // JOB-005: Recruiter edits own company's job -> successful
    try {
      const updatedJob = await jobService.updateJob(
        job1._id,
        { title: 'Principal AI Engineer' },
        recruiter1
      );
      assert(
        updatedJob && updatedJob.title === 'Principal AI Engineer',
        'JOB-005: Recruiter edits own company\'s job successfully'
      );
    } catch (err) {
      assert(false, 'JOB-005: Recruiter edits own job', err.message);
    }

    // JOB-006: Recruiter 1 attempts to edit Recruiter 2's job -> 403 Forbidden
    try {
      await jobService.updateJob(
        jobRecruiter2._id,
        { title: 'Hacked Job Title' },
        recruiter1
      );
      assert(false, 'JOB-006: Recruiter edits another company\'s job', 'Should have thrown 403 Forbidden');
    } catch (err) {
      assert(
        err.statusCode === 403,
        'JOB-006: Recruiter attempting to edit another company\'s job -> 403 Forbidden'
      );
    }

    // JOB-008: Recruiter 1 attempts to delete Recruiter 2's job -> 403 Forbidden
    try {
      await jobService.deleteJob(jobRecruiter2._id, recruiter1);
      assert(false, 'JOB-008: Recruiter deletes another company\'s job', 'Should have thrown 403 Forbidden');
    } catch (err) {
      assert(
        err.statusCode === 403,
        'JOB-008: Recruiter attempting to delete another company\'s job -> 403 Forbidden'
      );
    }

    // JOB-007: Recruiter 2 deletes own company's job -> successful
    try {
      const deletedJob = await jobService.deleteJob(jobRecruiter2._id, recruiter2);
      assert(
        deletedJob && deletedJob._id.toString() === jobRecruiter2._id.toString(),
        'JOB-007: Recruiter deletes own company\'s job successfully'
      );
    } catch (err) {
      assert(false, 'JOB-007: Recruiter deletes own job', err.message);
    }

  } finally {
    // Restore original repository methods
    companyRepository.getCompanyByOwner = origCompGetByOwner;
    companyRepository.getCompanyByName = origCompGetByName;
    companyRepository.getCompanyById = origCompGetById;
    companyRepository.createCompany = origCompCreate;

    jobRepository.createJob = origJobCreate;
    jobRepository.getJob = origJobGet;
    jobRepository.updateJob = origJobUpdate;
    jobRepository.deleteJob = origJobDelete;
    jobRepository.searchJobs = origJobSearch;
  }

  console.log(`\nTEST SUITE SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED\n`);
  if (failedCount > 0) {
    process.exit(1);
  }
}

runRelationshipTests().catch((err) => {
  console.error('Unhandled Test Error:', err);
  process.exit(1);
});
