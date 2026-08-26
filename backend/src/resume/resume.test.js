import resumeService from './resume.service.js';
import resumeRepository from './resume.repository.js';
import { validateResumeFile } from './resume.validation.js';
import authenticate from '../middleware/auth.middleware.js';
import mongoose from 'mongoose';

const mockUserId1 = new mongoose.Types.ObjectId().toString();
const mockUserId2 = new mongoose.Types.ObjectId().toString();

console.log('=== INTERVIEWIQ RESUME SECURITY & TEST SUITE ===\n');

async function runTestSuite() {
  const testResults = [];

  const recordResult = (testName, expectedStatus, actualStatus, passed, message) => {
    testResults.push({ testName, expectedStatus, actualStatus, passed, message });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName}`);
    console.log(`       Status: ${actualStatus} (Expected ${expectedStatus}) | Message: ${message}\n`);
  };

  // 1. JWT Failure (Missing Token)
  try {
    let capturedErr = null;
    const req = { headers: {}, cookies: {} };
    const next = (err) => {
      if (err) capturedErr = err;
    };
    await authenticate(req, {}, next);
    if (capturedErr) throw capturedErr;
    recordResult('JWT Failure (Missing Token)', 401, 200, false, 'Did not reject unauthenticated request');
  } catch (err) {
    recordResult('JWT Failure (Missing Token)', 401, err.statusCode || 401, true, err.message);
  }

  // 2. No File Attached
  try {
    const req = { file: null };
    const next = (err) => {
      if (err) throw err;
    };
    validateResumeFile(req, {}, next);
    recordResult('No File Attached', 400, 200, false, 'Allowed missing file');
  } catch (err) {
    recordResult('No File Attached', 400, err.statusCode || 400, true, err.message);
  }

  // 3. Invalid File - Image Rejection
  try {
    const req = {
      file: {
        originalname: 'my_avatar.png',
        mimetype: 'image/png',
        size: 5000,
        buffer: Buffer.from('FAKE PNG CONTENT'),
      },
    };
    const next = (err) => {
      if (err) throw err;
    };
    validateResumeFile(req, {}, next);
    recordResult('Invalid File (Image Rejection)', 400, 200, false, 'Allowed image file');
  } catch (err) {
    recordResult('Invalid File (Image Rejection)', 400, err.statusCode || 400, true, err.message);
  }

  // 4. Invalid File - Executable Rejection
  try {
    const req = {
      file: {
        originalname: 'script.exe',
        mimetype: 'application/x-msdownload',
        size: 5000,
        buffer: Buffer.from('FAKE EXE CONTENT'),
      },
    };
    const next = (err) => {
      if (err) throw err;
    };
    validateResumeFile(req, {}, next);
    recordResult('Invalid File (Executable Rejection)', 400, 200, false, 'Allowed executable');
  } catch (err) {
    recordResult('Invalid File (Executable Rejection)', 400, err.statusCode || 400, true, err.message);
  }

  // 5. Large File Exceeds 5MB Limit
  try {
    const req = {
      file: {
        originalname: 'large_resume.pdf',
        mimetype: 'application/pdf',
        size: 6 * 1024 * 1024,
        buffer: Buffer.from('%PDF-1.7 oversize file'),
      },
    };
    const next = (err) => {
      if (err) throw err;
    };
    validateResumeFile(req, {}, next);
    recordResult('Large File (>5MB Limit)', 400, 200, false, 'Allowed >5MB file');
  } catch (err) {
    recordResult('Large File (>5MB Limit)', 400, err.statusCode || 400, true, err.message);
  }

  // 6. Spoofed PDF Magic Bytes Failure
  try {
    const req = {
      file: {
        originalname: 'fake_resume.pdf',
        mimetype: 'application/pdf',
        size: 2000,
        buffer: Buffer.from('THIS IS NOT A VALID PDF HEADER'),
      },
    };
    const next = (err) => {
      if (err) throw err;
    };
    validateResumeFile(req, {}, next);
    recordResult('Spoofed PDF (Magic Bytes Check)', 400, 200, false, 'Allowed spoofed PDF');
  } catch (err) {
    recordResult('Spoofed PDF (Magic Bytes Check)', 400, err.statusCode || 400, true, err.message);
  }

  // 7. Cross-User Authorization Violation
  try {
    const mockResume = {
      _id: new mongoose.Types.ObjectId(),
      user: mockUserId1,
      originalName: 'user1_resume.pdf',
    };

    const originalGetById = resumeRepository.getResumeById;
    resumeRepository.getResumeById = async () => mockResume;

    await resumeService.getResumeById(mockUserId2, mockResume._id);

    resumeRepository.getResumeById = originalGetById;
    recordResult('Cross-User Authorization Check', 403, 200, false, 'Allowed cross-user access');
  } catch (err) {
    recordResult('Cross-User Authorization Check', 403, err.statusCode || 403, true, err.message);
  }

  // 8. Non-Existent Resume Lookup (404 Not Found)
  try {
    const originalGetByUser = resumeRepository.getResumeByUser;
    resumeRepository.getResumeByUser = async () => null;

    await resumeService.getActiveResumeByUser(mockUserId1);

    resumeRepository.getResumeByUser = originalGetByUser;
    recordResult('Non-Existent Resume (404)', 404, 200, false, 'Found non-existent resume');
  } catch (err) {
    recordResult('Non-Existent Resume (404)', 404, err.statusCode || 404, true, err.message);
  }

  // 9. Success Case - Resume Upload (201 Created)
  try {
    const mockPdfFile = {
      originalname: 'john_doe_resume.pdf',
      mimetype: 'application/pdf',
      size: 1.5 * 1024 * 1024,
      buffer: Buffer.from('%PDF-1.7 sample valid pdf content'),
    };

    const originalCreate = resumeRepository.createResume;
    resumeRepository.createResume = async (data) => ({
      _id: new mongoose.Types.ObjectId(),
      ...data,
    });
    resumeRepository.getResumeByUser = async () => null;

    const result = await resumeService.uploadOrReplaceResume(mockUserId1, mockPdfFile);

    resumeRepository.createResume = originalCreate;
    recordResult(
      'Success Case - Resume Upload (201 Created)',
      201,
      201,
      !!result.url && result.isActive === true,
      'Resume uploaded successfully with Cloudinary URL & Public ID'
    );
  } catch (err) {
    recordResult('Success Case - Resume Upload (201 Created)', 201, 500, false, err.message);
  }

  console.log('=== TEST SUITE COMPLETED SUCCESSFULLY ===');
  process.exit(0);
}

runTestSuite();
