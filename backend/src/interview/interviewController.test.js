import {
  startInterview,
  getInterviewHistory,
  getInterviewDetails,
  resumeInterview,
  endInterview,
  getQuestions,
  submitAnswer,
  getInterviewResult,
} from './interview.controller.js';
import interviewService from './interview.service.js';
import mongoose from 'mongoose';

console.log('=== INTERVIEWIQ CONTROLLER LAYER TEST SUITE ===\n');

/**
 * Mock Express Response Builder
 */
function createMockRes() {
  const res = {
    statusCode: 200,
    dataSent: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.dataSent = payload;
      return this;
    },
  };
  return res;
}

async function runTestSuite() {
  const testResults = [];

  const recordResult = (testName, passed, message) => {
    testResults.push({ testName, passed, message });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName}`);
    console.log(`       Details: ${message}\n`);
  };

  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockInterviewId = new mongoose.Types.ObjectId().toString();
  const mockQuestionId = new mongoose.Types.ObjectId().toString();

  // Test 1: startInterview Controller
  try {
    const req = {
      user: { _id: mockUserId },
      body: { role: 'Full Stack Engineer', difficulty: 'Intermediate' },
    };
    const res = createMockRes();

    const origStart = interviewService.startInterview;
    interviewService.startInterview = async (userId, data) => ({
      interview: { _id: mockInterviewId, role: data.role },
      questions: [{ question: 'What is Node.js?' }],
    });

    await startInterview(req, res, () => {});

    interviewService.startInterview = origStart;

    const isSuccess = res.statusCode === 201 && res.dataSent?.success === true && res.dataSent?.data?.interview?._id === mockInterviewId;
    if (isSuccess) {
      recordResult(
        'startInterview Controller (POST /api/v1/interviews/start)',
        true,
        'Successfully returned 201 Created with standardized ApiResponse structure.'
      );
    } else {
      recordResult('startInterview Controller', false, 'StatusCode or ApiResponse mismatch');
    }
  } catch (err) {
    recordResult('startInterview Controller', false, err.message);
  }

  // Test 2: getInterviewHistory Controller
  try {
    const req = { user: { _id: mockUserId }, query: { page: 1, limit: 10 } };
    const res = createMockRes();

    const origHist = interviewService.getUserInterviewHistory;
    interviewService.getUserInterviewHistory = async (userId) => [{ _id: mockInterviewId }];

    await getInterviewHistory(req, res, () => {});

    interviewService.getUserInterviewHistory = origHist;

    const isSuccess = res.statusCode === 200 && res.dataSent?.success === true && Array.isArray(res.dataSent?.data);
    if (isSuccess) {
      recordResult(
        'getInterviewHistory Controller (GET /api/v1/interviews)',
        true,
        'Returned 200 OK with interview history list.'
      );
    } else {
      recordResult('getInterviewHistory Controller', false, 'Failed to fetch interview history');
    }
  } catch (err) {
    recordResult('getInterviewHistory Controller', false, err.message);
  }

  // Test 3: getInterviewDetails Controller
  try {
    const req = { user: { _id: mockUserId }, params: { id: mockInterviewId } };
    const res = createMockRes();

    const origDet = interviewService.getInterviewDetails;
    interviewService.getInterviewDetails = async (userId, id) => ({
      interview: { _id: id },
      questions: [],
      result: null,
    });

    await getInterviewDetails(req, res, () => {});

    interviewService.getInterviewDetails = origDet;

    const isSuccess = res.statusCode === 200 && res.dataSent?.data?.interview?._id === mockInterviewId;
    if (isSuccess) {
      recordResult(
        'getInterviewDetails Controller (GET /api/v1/interviews/:id)',
        true,
        'Returned 200 OK with full session details payload.'
      );
    } else {
      recordResult('getInterviewDetails Controller', false, 'Failed to fetch interview details');
    }
  } catch (err) {
    recordResult('getInterviewDetails Controller', false, err.message);
  }

  // Test 4: resumeInterview Controller
  try {
    const req = { user: { _id: mockUserId }, params: { id: mockInterviewId } };
    const res = createMockRes();

    const origRes = interviewService.resumeInterview;
    interviewService.resumeInterview = async (userId, id) => ({
      interview: { _id: id, status: 'In Progress' },
      remainingCount: 2,
    });

    await resumeInterview(req, res, () => {});

    interviewService.resumeInterview = origRes;

    const isSuccess = res.statusCode === 200 && res.dataSent?.data?.remainingCount === 2;
    if (isSuccess) {
      recordResult(
        'resumeInterview Controller (POST /api/v1/interviews/:id/resume)',
        true,
        'Returned 200 OK with active resumed question state.'
      );
    } else {
      recordResult('resumeInterview Controller', false, 'Failed to resume interview state');
    }
  } catch (err) {
    recordResult('resumeInterview Controller', false, err.message);
  }

  // Test 5: submitAnswer Controller
  try {
    const req = {
      user: { _id: mockUserId },
      params: { id: mockInterviewId, questionId: mockQuestionId },
      body: { answer: 'Node.js is an async runtime.' },
    };
    const res = createMockRes();

    const origAns = interviewService.receiveAnswers;
    interviewService.receiveAnswers = async (userId, id, qId, ans) => ({
      question: { _id: qId, score: 85 },
      evaluation: { score: 85 },
      completedQuestions: 1,
    });

    await submitAnswer(req, res, () => {});

    interviewService.receiveAnswers = origAns;

    const isSuccess = res.statusCode === 200 && res.dataSent?.data?.completedQuestions === 1;
    if (isSuccess) {
      recordResult(
        'submitAnswer Controller (POST /api/v1/interviews/:id/questions/:questionId/answer)',
        true,
        'Returned 200 OK with evaluated answer feedback payload.'
      );
    } else {
      recordResult('submitAnswer Controller', false, 'Failed to submit answer');
    }
  } catch (err) {
    recordResult('submitAnswer Controller', false, err.message);
  }

  // Test 6: getInterviewResult Controller
  try {
    const req = { user: { _id: mockUserId }, params: { id: mockInterviewId } };
    const res = createMockRes();

    const origDet = interviewService.getInterviewDetails;
    interviewService.getInterviewDetails = async (userId, id) => ({
      interview: { _id: id },
      result: { overallScore: 88, summary: 'Great job!' },
    });

    await getInterviewResult(req, res, () => {});

    interviewService.getInterviewDetails = origDet;

    const isSuccess = res.statusCode === 200 && res.dataSent?.data?.overallScore === 88;
    if (isSuccess) {
      recordResult(
        'getInterviewResult Controller (GET /api/v1/interviews/:id/result)',
        true,
        'Returned 200 OK with final evaluation result.'
      );
    } else {
      recordResult('getInterviewResult Controller', false, 'Failed to fetch interview result');
    }
  } catch (err) {
    recordResult('getInterviewResult Controller', false, err.message);
  }

  const passedCount = testResults.filter((t) => t.passed).length;
  console.log(`=== SUMMARY: ${passedCount}/${testResults.length} CONTROLLER TESTS PASSED ===`);
  if (passedCount === testResults.length) {
    console.log('ALL CONTROLLER LAYER TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('SOME TESTS FAILED!');
    process.exit(1);
  }
}

runTestSuite();
