import express from 'express';
import mongoose from 'mongoose';
import routes from '../routes/index.js';
import errorHandler from '../middleware/error.middleware.js';
import { generateAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import Company from '../company/company.model.js';
import Job from '../job/job.model.js';
import companyRepository from '../company/company.repository.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 10.3 ADMIN COMPANY MANAGEMENT TEST SUITE');
console.log('=================================================================\n');

async function runAdminCompanyManagementTestSuite() {
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

    // In-memory Mock Stores
    const mockCompanies = [];
    const mockJobs = [];

    // Seed initial company
    const company1Id = new mongoose.Types.ObjectId().toString();
    const company2Id = new mongoose.Types.ObjectId().toString();

    mockCompanies.push(
      {
        _id: company1Id,
        companyName: 'Acme Technologies',
        website: 'https://acme.example.com',
        description: 'Leading provider of enterprise web cloud technology.',
        industry: 'Software Development',
        headquarters: 'San Francisco, CA',
        locations: ['San Francisco, CA'],
        companySize: '51-200',
        foundedYear: 2018,
        email: 'contact@acme.example.com',
        hiringStatus: 'Actively Hiring',
        createdBy: adminId,
        createdAt: new Date('2026-01-01'),
      },
      {
        _id: company2Id,
        companyName: 'Beta Fintech Solutions',
        website: 'https://betafin.example.com',
        description: 'Modern global payment gateway services.',
        industry: 'Fintech',
        headquarters: 'New York, NY',
        locations: ['New York, NY'],
        companySize: '11-50',
        foundedYear: 2020,
        email: 'info@betafin.example.com',
        hiringStatus: 'Hiring Freeze',
        createdBy: adminId,
        createdAt: new Date('2026-01-02'),
      }
    );

    // Seed job associated with company1Id
    const job1Id = new mongoose.Types.ObjectId().toString();
    mockJobs.push({
      _id: job1Id,
      company: company1Id,
      title: 'Senior Backend Engineer',
      status: 'Active',
    });

    // Stub Mongoose / Repository methods
    const origGetCompany = companyRepository.getCompany;
    const origGetCompanyByName = companyRepository.getCompanyByName;
    const origCreateCompany = companyRepository.createCompany;
    const origUpdateCompany = companyRepository.updateCompany;
    const origDeleteCompany = companyRepository.deleteCompany;
    const origListCompanies = companyRepository.listCompanies;
    const origJobCountDocuments = Job.countDocuments;
    const origJobDeleteMany = Job.deleteMany;

    companyRepository.getCompany = async (id) => {
      const found = mockCompanies.find((c) => String(c._id) === String(id));
      if (!found) return null;
      return {
        ...found,
        toObject: () => ({ ...found }),
      };
    };

    companyRepository.getCompanyByName = async (name) => {
      const clean = name.trim().toLowerCase();
      const found = mockCompanies.find((c) => c.companyName.trim().toLowerCase() === clean);
      return found || null;
    };

    companyRepository.createCompany = async (data) => {
      const item = { ...data, _id: new mongoose.Types.ObjectId().toString(), createdAt: new Date() };
      mockCompanies.push(item);
      return item;
    };

    companyRepository.updateCompany = async (id, update) => {
      const idx = mockCompanies.findIndex((c) => String(c._id) === String(id));
      if (idx === -1) return null;
      Object.assign(mockCompanies[idx], update);
      return mockCompanies[idx];
    };

    companyRepository.deleteCompany = async (id) => {
      const idx = mockCompanies.findIndex((c) => String(c._id) === String(id));
      if (idx !== -1) {
        return mockCompanies.splice(idx, 1)[0];
      }
      return null;
    };

    companyRepository.listCompanies = async (filter = {}, options = {}) => {
      let filtered = [...mockCompanies];

      if (filter.industry) {
        filtered = filtered.filter((c) => c.industry === filter.industry);
      }
      if (filter.hiringStatus) {
        filtered = filtered.filter((c) => c.hiringStatus === filter.hiringStatus);
      }
      if (options.search) {
        const searchRegex = new RegExp(options.search.trim(), 'i');
        filtered = filtered.filter((c) => searchRegex.test(c.companyName) || searchRegex.test(c.headquarters));
      }

      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;

      return {
        companies: filtered.slice(skip, skip + limit),
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      };
    };

    Job.countDocuments = async (filter = {}) => {
      if (filter.company) {
        return mockJobs.filter((j) => String(j.company) === String(filter.company)).length;
      }
      return mockJobs.length;
    };

    Job.deleteMany = async (filter = {}) => {
      const initialLen = mockJobs.length;
      if (filter.company) {
        const remaining = mockJobs.filter((j) => String(j.company) !== String(filter.company));
        mockJobs.length = 0;
        mockJobs.push(...remaining);
      }
      return { deletedCount: initialLen - mockJobs.length };
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
    // EXECUTE ADMIN COMPANY MANAGEMENT TEST SCENARIOS
    // =========================================================================

    // 1. List Companies (GET /api/v1/admin/companies)
    const listRes = await makeRequest('/api/v1/admin/companies?page=1&limit=10', 'GET');
    assert(
      listRes.status === 200 && listRes.data.success === true && listRes.data.meta.total === 2,
      'Test 1: Admin can list companies with pagination metadata',
      `Total: ${listRes.data.meta?.total}`
    );

    // 2. Search Companies by Keyword
    const searchRes = await makeRequest('/api/v1/admin/companies?search=Beta', 'GET');
    assert(
      searchRes.status === 200 && searchRes.data.data.length === 1 && searchRes.data.data[0].companyName === 'Beta Fintech Solutions',
      'Test 2: Admin can search companies by keyword',
      `Company: ${searchRes.data.data?.[0]?.companyName}`
    );

    // 3. Filter Companies by Industry
    const industryRes = await makeRequest('/api/v1/admin/companies?industry=Fintech', 'GET');
    assert(
      industryRes.status === 200 && industryRes.data.data.length === 1 && industryRes.data.data[0].industry === 'Fintech',
      'Test 3: Admin can filter companies by industry',
      `Industry: ${industryRes.data.data?.[0]?.industry}`
    );

    // 4. Create Company (POST /api/v1/admin/companies)
    const newCompanyPayload = {
      companyName: 'Gamma AI Corp',
      website: 'https://gamma.ai',
      description: 'Generative AI and machine learning infrastructure.',
      industry: 'AI/ML',
      headquarters: 'Austin, TX',
      companySize: '11-50',
      foundedYear: 2022,
      email: 'hello@gamma.ai',
    };
    const createRes = await makeRequest('/api/v1/admin/companies', 'POST', newCompanyPayload);
    assert(
      createRes.status === 201 && createRes.data.success === true && createRes.data.data.companyName === 'Gamma AI Corp',
      'Test 4: Admin can create a new company profile',
      `Created ID: ${createRes.data.data?._id}`
    );

    // 5. Duplicate Company Name Check
    const duplicateRes = await makeRequest('/api/v1/admin/companies', 'POST', newCompanyPayload);
    assert(
      duplicateRes.status === 400 && duplicateRes.data.message.includes('already exists'),
      'Test 5: Creating duplicate company name is rejected with 400 Bad Request',
      `Message: ${duplicateRes.data.message}`
    );

    // 6. View Company Details with Job Count (GET /api/v1/admin/companies/:id)
    const detailRes = await makeRequest(`/api/v1/admin/companies/${company1Id}`, 'GET');
    assert(
      detailRes.status === 200 && detailRes.data.data.associatedJobsCount === 1,
      'Test 6: Admin can view company details including associated jobs count',
      `Associated Jobs: ${detailRes.data.data?.associatedJobsCount}`
    );

    // 7. Update Company Profile (PUT /api/v1/admin/companies/:id)
    const updateRes = await makeRequest(`/api/v1/admin/companies/${company1Id}`, 'PUT', {
      headquarters: 'San Jose, CA',
    });
    assert(
      updateRes.status === 200 && updateRes.data.data.headquarters === 'San Jose, CA',
      'Test 7: Admin can update company details',
      `Headquarters: ${updateRes.data.data?.headquarters}`
    );

    // 8. Update Company Hiring Status (PATCH /api/v1/admin/companies/:id/status)
    const statusRes = await makeRequest(`/api/v1/admin/companies/${company1Id}/status`, 'PATCH', {
      hiringStatus: 'Hiring Freeze',
    });
    assert(
      statusRes.status === 200 && statusRes.data.data.hiringStatus === 'Hiring Freeze',
      'Test 8: Admin can update company hiring status',
      `Hiring Status: ${statusRes.data.data?.hiringStatus}`
    );

    // 9. Job Safety Guard 1: Rejects deletion of company with active jobs
    const deleteSafetyRes = await makeRequest(`/api/v1/admin/companies/${company1Id}`, 'DELETE');
    assert(
      deleteSafetyRes.status === 400 && deleteSafetyRes.data.message.includes('active job postings'),
      'Test 9: Job Safety Guard rejects deletion of company with active jobs (400 Bad Request)',
      `Message: ${deleteSafetyRes.data.message}`
    );

    // 10. Job Safety Guard 2: Force deletion of company with jobs succeeds with force=true
    const forceDeleteRes = await makeRequest(`/api/v1/admin/companies/${company1Id}?force=true`, 'DELETE');
    assert(
      forceDeleteRes.status === 200 && forceDeleteRes.data.data.removedJobsCount === 1,
      'Test 10: Force deletion with force=true cascade deletes company and associated jobs',
      `Removed Jobs: ${forceDeleteRes.data.data?.removedJobsCount}`
    );

    // 11. Delete Company without jobs (DELETE /api/v1/admin/companies/:id)
    const deleteRes = await makeRequest(`/api/v1/admin/companies/${company2Id}`, 'DELETE');
    assert(
      deleteRes.status === 200 && deleteRes.data.data.deletedCompanyId === company2Id,
      'Test 11: Admin can delete company without active jobs',
      `Deleted ID: ${deleteRes.data.data?.deletedCompanyId}`
    );

    // 12. Authorization Check: Non-Admin normal user (Student) -> 403 Forbidden
    const forbiddenRes = await makeRequest('/api/v1/admin/companies', 'GET', null, studentToken);
    assert(
      forbiddenRes.status === 403,
      'Test 12: Normal non-admin user request returns HTTP 403 Forbidden',
      `Status: ${forbiddenRes.status}`
    );

    // 13. Authentication Check: Missing JWT -> 401 Unauthorized
    const unauthRes = await makeRequest('/api/v1/admin/companies', 'GET', null, null);
    assert(
      unauthRes.status === 401,
      'Test 13: Unauthenticated request without JWT returns HTTP 401 Unauthorized',
      `Status: ${unauthRes.status}`
    );

    // Cleanup & Teardown
    server.close();
    User.findById = origUserFindById;
    companyRepository.getCompany = origGetCompany;
    companyRepository.getCompanyByName = origGetCompanyByName;
    companyRepository.createCompany = origCreateCompany;
    companyRepository.updateCompany = origUpdateCompany;
    companyRepository.deleteCompany = origDeleteCompany;
    companyRepository.listCompanies = origListCompanies;
    Job.countDocuments = origJobCountDocuments;
    Job.deleteMany = origJobDeleteMany;

  } catch (err) {
    assert(false, 'Unexpected execution exception in Admin Company Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runAdminCompanyManagementTestSuite();
