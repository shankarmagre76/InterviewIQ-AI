import express from 'express';
import mongoose from 'mongoose';
import routes from '../routes/index.js';
import errorHandler from '../middleware/error.middleware.js';
import { generateAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import Company from '../company/company.model.js';
import Job from '../job/job.model.js';
import Application from '../application/application.model.js';
import jobRepository from '../job/job.repository.js';
import companyRepository from '../company/company.repository.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 10.4 ADMIN JOB MANAGEMENT TEST SUITE');
console.log('=================================================================\n');

async function runAdminJobManagementTestSuite() {
  let passedCount = 0;
  let failedCount = 0;

  const assert = (condition, testName, detail = '') => {
    if (condition) {
      passedCount++;
      console.log(`[PASS] ${testName}`);
    } else {
      failedCount++;
      console.error(`[FAIL] ${testName} - ${detail}`);
    }
  };

  try {
    const adminId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();
    const companyId = new mongoose.Types.ObjectId().toString();

    const adminToken = `Bearer ${generateAccessToken({ id: adminId })}`;
    const studentToken = `Bearer ${generateAccessToken({ id: studentId })}`;

    // Stub User model
    const origUserFindById = User.findById;
    User.findById = async (id) => {
      const idStr = String(id);
      if (idStr === adminId) {
        return { _id: idStr, email: 'admin@interviewiq.ai', role: 'Admin', isActive: true };
      }
      if (idStr === studentId) {
        return { _id: idStr, email: 'student@example.com', role: 'Student', isActive: true };
      }
      return null;
    };

    // In-memory mock databases
    const mockCompanies = [
      {
        _id: companyId,
        companyName: 'TechCorp Innovations',
        website: 'https://techcorp.example.com',
        description: 'Next-gen enterprise software solutions.',
        industry: 'Software Development',
        headquarters: 'San Francisco, CA',
        companySize: '51-200',
        foundedYear: 2015,
        email: 'jobs@techcorp.example.com',
        hiringStatus: 'Actively Hiring',
        createdBy: adminId,
      },
    ];

    const jobId1 = new mongoose.Types.ObjectId().toString();
    const jobId2 = new mongoose.Types.ObjectId().toString();

    const mockJobs = [
      {
        _id: jobId1,
        company: companyId,
        title: 'Senior Node.js Backend Engineer',
        description: 'Design and build high-performance microservices architecture.',
        location: 'Remote, US',
        workMode: 'Remote',
        employmentType: 'Full-time',
        status: 'Active',
        experience: { minYears: 5, maxYears: 10 },
        salary: { min: 140000, max: 180000, currency: 'USD', period: 'Yearly', isDisclosed: true },
        requiredSkills: ['Node.js', 'Express', 'MongoDB'],
        createdBy: adminId,
        createdAt: new Date('2026-01-01'),
      },
      {
        _id: jobId2,
        company: companyId,
        title: 'Frontend React Developer',
        description: 'Build modern responsive single-page web applications.',
        location: 'New York, NY',
        workMode: 'Hybrid',
        employmentType: 'Full-time',
        status: 'Paused',
        experience: { minYears: 2, maxYears: 5 },
        salary: { min: 90000, max: 120000, currency: 'USD', period: 'Yearly', isDisclosed: true },
        requiredSkills: ['React', 'TypeScript', 'CSS'],
        createdBy: adminId,
        createdAt: new Date('2026-01-02'),
      },
    ];

    const mockApplications = [
      {
        _id: new mongoose.Types.ObjectId().toString(),
        user: studentId,
        job: jobId1,
        company: companyId,
        status: 'Applied',
      },
    ];

    // Stub Company Repository
    const origGetCompany = companyRepository.getCompany;
    companyRepository.getCompany = async (id) => {
      const found = mockCompanies.find((c) => String(c._id) === String(id));
      if (!found) return null;
      return { ...found, toObject: () => ({ ...found }) };
    };

    // Stub Job Repository methods
    const origGetJob = jobRepository.getJob;
    const origCreateJob = jobRepository.createJob;
    const origUpdateJob = jobRepository.updateJob;
    const origDeleteJob = jobRepository.deleteJob;
    const origSearchJobs = jobRepository.searchJobs;
    const origAppCountDocuments = Application.countDocuments;
    const origAppDeleteMany = Application.deleteMany;

    jobRepository.getJob = async (id) => {
      const found = mockJobs.find((j) => String(j._id) === String(id));
      if (!found) return null;
      const comp = mockCompanies.find((c) => String(c._id) === String(found.company));
      return {
        ...found,
        company: comp || found.company,
        createdBy: { firstName: 'System', lastName: 'Admin', email: 'admin@interviewiq.ai', role: 'Admin' },
        toObject: () => ({ ...found, company: comp || found.company }),
      };
    };

    jobRepository.createJob = async (data) => {
      const item = { ...data, _id: new mongoose.Types.ObjectId().toString(), createdAt: new Date() };
      mockJobs.push(item);
      return item;
    };

    jobRepository.updateJob = async (id, update) => {
      const idx = mockJobs.findIndex((j) => String(j._id) === String(id));
      if (idx === -1) return null;
      Object.assign(mockJobs[idx], update);
      return mockJobs[idx];
    };

    jobRepository.deleteJob = async (id) => {
      const idx = mockJobs.findIndex((j) => String(j._id) === String(id));
      if (idx !== -1) {
        return mockJobs.splice(idx, 1)[0];
      }
      return null;
    };

    jobRepository.searchJobs = async (filter = {}, options = {}) => {
      let filtered = [...mockJobs];

      if (filter.company) {
        filtered = filtered.filter((j) => String(j.company) === String(filter.company));
      }
      if (filter.status) {
        if (typeof filter.status === 'string') {
          filtered = filtered.filter((j) => j.status === filter.status);
        } else if (filter.status.$in) {
          filtered = filtered.filter((j) => filter.status.$in.includes(j.status));
        }
      }
      if (options.workMode) {
        const wmList = Array.isArray(options.workMode) ? options.workMode : [options.workMode];
        filtered = filtered.filter((j) => wmList.includes(j.workMode));
      }
      if (options.keyword) {
        const regex = new RegExp(options.keyword.trim(), 'i');
        filtered = filtered.filter((j) => regex.test(j.title) || regex.test(j.description));
      }

      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;

      return {
        jobs: filtered.slice(skip, skip + limit),
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit) || 1,
        hasNextPage: page * limit < filtered.length,
        hasPrevPage: page > 1,
      };
    };

    Application.countDocuments = async (filter = {}) => {
      if (filter.job) {
        return mockApplications.filter((a) => String(a.job) === String(filter.job)).length;
      }
      return mockApplications.length;
    };

    Application.deleteMany = async (filter = {}) => {
      const initialLen = mockApplications.length;
      if (filter.job) {
        const remaining = mockApplications.filter((a) => String(a.job) !== String(filter.job));
        mockApplications.length = 0;
        mockApplications.push(...remaining);
      }
      return { deletedCount: initialLen - mockApplications.length };
    };

    // Setup Express App Instance
    const app = express();
    app.use(express.json());
    app.use(routes);
    app.use(errorHandler);

    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    const makeRequest = async (path, method = 'GET', body = null, token = adminToken) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = token;

      const opts = { method, headers };
      if (body) opts.body = JSON.stringify(body);

      const res = await fetch(`${baseUrl}${path}`, opts);
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    };

    // =========================================================================
    // EXECUTE ADMIN JOB MANAGEMENT TEST SCENARIOS
    // =========================================================================

    // 1. List All Jobs (GET /api/v1/admin/jobs)
    const listRes = await makeRequest('/api/v1/admin/jobs?page=1&limit=10', 'GET');
    assert(
      listRes.status === 200 && listRes.data.success === true && listRes.data.meta.total === 2,
      'Test 1: Admin can list all jobs across any status with pagination metadata',
      `Total: ${listRes.data.meta?.total}`
    );

    // 2. Search Jobs by Keyword
    const searchRes = await makeRequest('/api/v1/admin/jobs?search=Backend', 'GET');
    assert(
      searchRes.status === 200 && searchRes.data.data.length === 1 && searchRes.data.data[0].title.includes('Backend'),
      'Test 2: Admin can search jobs by keyword',
      `Job Title: ${searchRes.data.data?.[0]?.title}`
    );

    // 3. Filter Jobs by Company ID & Status
    const filterRes = await makeRequest(`/api/v1/admin/jobs?company=${companyId}&status=Active`, 'GET');
    assert(
      filterRes.status === 200 && filterRes.data.data.length === 1 && filterRes.data.data[0].status === 'Active',
      'Test 3: Admin can filter jobs by company ID and status',
      `Status: ${filterRes.data.data?.[0]?.status}`
    );

    // 4. Create Job Posting (POST /api/v1/admin/jobs)
    const newJobPayload = {
      company: companyId,
      title: 'DevOps & Cloud Architect',
      description: 'Manage AWS infrastructure and Kubernetes clusters.',
      location: 'Austin, TX',
      workMode: 'Remote',
      employmentType: 'Full-time',
      status: 'Active',
      experience: { minYears: 4, maxYears: 8 },
      salary: { min: 130000, max: 165000, currency: 'USD', period: 'Yearly', isDisclosed: true },
      requiredSkills: ['AWS', 'Kubernetes', 'Terraform'],
    };
    const createRes = await makeRequest('/api/v1/admin/jobs', 'POST', newJobPayload);
    assert(
      createRes.status === 201 && createRes.data.success === true && createRes.data.data.title === 'DevOps & Cloud Architect',
      'Test 4: Admin can create a new job posting',
      `Created Job ID: ${createRes.data.data?._id}`
    );

    // 5. Non-existent Company ID Validation
    const badCompanyJobPayload = {
      ...newJobPayload,
      company: new mongoose.Types.ObjectId().toString(),
    };
    const badCompRes = await makeRequest('/api/v1/admin/jobs', 'POST', badCompanyJobPayload);
    assert(
      badCompRes.status === 404 && badCompRes.data.message.includes('company profile not found'),
      'Test 5: Creating job with non-existent company ID is rejected with 404 Not Found',
      `Message: ${badCompRes.data.message}`
    );

    // 6. View Job Details with Application Count (GET /api/v1/admin/jobs/:id)
    const detailRes = await makeRequest(`/api/v1/admin/jobs/${jobId1}`, 'GET');
    assert(
      detailRes.status === 200 && detailRes.data.data.associatedApplicationsCount === 1,
      'Test 6: Admin can view job details including associated candidate applications count',
      `Applications: ${detailRes.data.data?.associatedApplicationsCount}`
    );

    // 7. Update Job Posting (PUT /api/v1/admin/jobs/:id)
    const updateRes = await makeRequest(`/api/v1/admin/jobs/${jobId1}`, 'PUT', {
      title: 'Principal Backend Engineer',
    });
    assert(
      updateRes.status === 200 && updateRes.data.data.title === 'Principal Backend Engineer',
      'Test 7: Admin can update job details',
      `Title: ${updateRes.data.data?.title}`
    );

    // 8. Update Job Status (PATCH /api/v1/admin/jobs/:id/status)
    const statusRes = await makeRequest(`/api/v1/admin/jobs/${jobId1}/status`, 'PATCH', {
      status: 'Paused',
    });
    assert(
      statusRes.status === 200 && statusRes.data.data.status === 'Paused',
      'Test 8: Admin can update job status (Paused)',
      `Status: ${statusRes.data.data?.status}`
    );

    // 9. Application Safety Guard 1: Rejects deletion of job with submitted applications
    const deleteSafetyRes = await makeRequest(`/api/v1/admin/jobs/${jobId1}`, 'DELETE');
    assert(
      deleteSafetyRes.status === 400 && deleteSafetyRes.data.message.includes('candidate applications'),
      'Test 9: Application Safety Guard rejects deletion of job with applications (400 Bad Request)',
      `Message: ${deleteSafetyRes.data.message}`
    );

    // 10. Application Safety Guard 2: Force deletion with force=true cascade deletes applications
    const forceDeleteRes = await makeRequest(`/api/v1/admin/jobs/${jobId1}?force=true`, 'DELETE');
    assert(
      forceDeleteRes.status === 200 && forceDeleteRes.data.data.removedApplicationsCount === 1,
      'Test 10: Force deletion with force=true cascade deletes job and associated applications',
      `Removed Apps: ${forceDeleteRes.data.data?.removedApplicationsCount}`
    );

    // 11. Delete Job without applications (DELETE /api/v1/admin/jobs/:id)
    const deleteRes = await makeRequest(`/api/v1/admin/jobs/${jobId2}`, 'DELETE');
    assert(
      deleteRes.status === 200 && deleteRes.data.data.deletedJobId === jobId2,
      'Test 11: Admin can delete job posting without applications',
      `Deleted Job ID: ${deleteRes.data.data?.deletedJobId}`
    );

    // 12. Authorization Check: Non-Admin normal user (Student) -> 403 Forbidden
    const forbiddenRes = await makeRequest('/api/v1/admin/jobs', 'GET', null, studentToken);
    assert(
      forbiddenRes.status === 403,
      'Test 12: Normal non-admin user request returns HTTP 403 Forbidden',
      `Status: ${forbiddenRes.status}`
    );

    // 13. Authentication Check: Missing JWT -> 401 Unauthorized
    const unauthRes = await makeRequest('/api/v1/admin/jobs', 'GET', null, null);
    assert(
      unauthRes.status === 401,
      'Test 13: Unauthenticated request without JWT returns HTTP 401 Unauthorized',
      `Status: ${unauthRes.status}`
    );

    // Cleanup & Teardown
    server.close();
    User.findById = origUserFindById;
    companyRepository.getCompany = origGetCompany;
    jobRepository.getJob = origGetJob;
    jobRepository.createJob = origCreateJob;
    jobRepository.updateJob = origUpdateJob;
    jobRepository.deleteJob = origDeleteJob;
    jobRepository.searchJobs = origSearchJobs;
    Application.countDocuments = origAppCountDocuments;
    Application.deleteMany = origAppDeleteMany;

  } catch (err) {
    assert(false, 'Unexpected execution exception in Admin Job Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runAdminJobManagementTestSuite();
