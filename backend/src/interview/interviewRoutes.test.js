import interviewRoutes from './interview.routes.js';
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

console.log('=== INTERVIEWIQ REST API ROUTES & MIDDLEWARE TEST SUITE ===\n');

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

  // Test 1: Express Router Stack Verification
  try {
    const routeStack = interviewRoutes.stack.map((layer) => ({
      path: layer.route?.path,
      methods: layer.route?.methods ? Object.keys(layer.route.methods) : [],
    }));

    const hasRootPost = routeStack.some((r) => r.path === '/' && r.methods.includes('post'));
    const hasRootGet = routeStack.some((r) => r.path === '/' && r.methods.includes('get'));
    const hasIdGet = routeStack.some((r) => r.path === '/:id' && r.methods.includes('get'));
    const hasAnswersPost = routeStack.some((r) => r.path === '/:id/answers' && r.methods.includes('post'));
    const hasResultGet = routeStack.some((r) => r.path === '/:id/result' && r.methods.includes('get'));
    const hasIdDelete = routeStack.some((r) => r.path === '/:id' && r.methods.includes('delete'));

    const allRoutesMounted =
      hasRootPost && hasRootGet && hasIdGet && hasAnswersPost && hasResultGet && hasIdDelete;

    if (allRoutesMounted) {
      recordResult(
        'Express Router Endpoint Definitions (RESTful Spec)',
        true,
        'All required RESTful routes (POST /, GET /, GET /:id, POST /:id/answers, GET /:id/result, DELETE /:id) mounted on router stack.'
      );
    } else {
      recordResult('Express Router Endpoint Definitions', false, 'Missing one or more route definitions on router.');
    }
  } catch (err) {
    recordResult('Express Router Endpoint Definitions', false, err.message);
  }

  // Test 2: POST /api/v1/interviews Handler Execution
  try {
    const req = {
      user: { _id: mockUserId, role: 'Student' },
      body: { role: 'Full Stack Engineer', difficulty: 'Intermediate' },
    };
    const res = createMockRes();

    const origStart = interviewService.startInterview;
    interviewService.startInterview = async (userId, data) => ({
      interview: { _id: mockInterviewId, role: data.role },
      questions: [{ question: 'Explain async I/O' }],
    });

    await startInterview(req, res, () => {});
    interviewService.startInterview = origStart;

    if (res.statusCode === 201 && res.dataSent?.success === true) {
      recordResult(
        'POST /api/v1/interviews Endpoint Execution',
        true,
        'Handler executed successfully returning 201 Created.'
      );
    } else {
      recordResult('POST /api/v1/interviews Endpoint Execution', false, 'Failed status check');
    }
  } catch (err) {
    recordResult('POST /api/v1/interviews Endpoint Execution', false, err.message);
  }

  // Test 3: GET /api/v1/interviews Handler Execution
  try {
    const req = { user: { _id: mockUserId }, query: {} };
    const res = createMockRes();

    const origHist = interviewService.getUserInterviewHistory;
    interviewService.getUserInterviewHistory = async () => [{ _id: mockInterviewId }];

    await getInterviewHistory(req, res, () => {});
    interviewService.getUserInterviewHistory = origHist;

    if (res.statusCode === 200 && res.dataSent?.success === true) {
      recordResult(
        'GET /api/v1/interviews Candidate History Endpoint Execution',
        true,
        'Handler executed successfully returning 200 OK.'
      );
    } else {
      recordResult('GET /api/v1/interviews Candidate History Endpoint Execution', false, 'Failed status check');
    }
  } catch (err) {
    recordResult('GET /api/v1/interviews Candidate History Endpoint Execution', false, err.message);
  }

  // Test 4: GET /api/v1/interviews/:id Handler Execution
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

    if (res.statusCode === 200 && res.dataSent?.data?.interview?._id === mockInterviewId) {
      recordResult(
        'GET /api/v1/interviews/:id Session Details Endpoint Execution',
        true,
        'Handler executed successfully returning 200 OK.'
      );
    } else {
      recordResult('GET /api/v1/interviews/:id Session Details Endpoint Execution', false, 'Failed status check');
    }
  } catch (err) {
    recordResult('GET /api/v1/interviews/:id Session Details Endpoint Execution', false, err.message);
  }

  // Test 5: POST /api/v1/interviews/:id/answers Handler Execution
  try {
    const req = {
      user: { _id: mockUserId },
      params: { id: mockInterviewId, questionId: mockQuestionId },
      body: { answer: 'Node.js is an async runtime.' },
    };
    const res = createMockRes();

    const origAns = interviewService.receiveAnswers;
    interviewService.receiveAnswers = async (userId, id, qId, ans) => ({
      question: { _id: qId, score: 90 },
      evaluation: { score: 90 },
      completedQuestions: 1,
    });

    await submitAnswer(req, res, () => {});
    interviewService.receiveAnswers = origAns;

    if (res.statusCode === 200 && res.dataSent?.data?.completedQuestions === 1) {
      recordResult(
        'POST /api/v1/interviews/:id/answers Submit Answer Endpoint Execution',
        true,
        'Handler executed successfully returning 200 OK.'
      );
    } else {
      recordResult('POST /api/v1/interviews/:id/answers Submit Answer Endpoint Execution', false, 'Failed status check');
    }
  } catch (err) {
    recordResult('POST /api/v1/interviews/:id/answers Submit Answer Endpoint Execution', false, err.message);
  }

  // Test 6: GET /api/v1/interviews/:id/result Handler Execution
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

    if (res.statusCode === 200 && res.dataSent?.data?.overallScore === 88) {
      recordResult(
        'GET /api/v1/interviews/:id/result Evaluation Report Endpoint Execution',
        true,
        'Handler executed successfully returning 200 OK.'
      );
    } else {
      recordResult('GET /api/v1/interviews/:id/result Evaluation Report Endpoint Execution', false, 'Failed status check');
    }
  } catch (err) {
    recordResult('GET /api/v1/interviews/:id/result Evaluation Report Endpoint Execution', false, err.message);
  }

  // Test 7: DELETE /api/v1/interviews/:id Handler Execution
  try {
    const req = { user: { _id: mockUserId }, params: { id: mockInterviewId }, body: { status: 'Cancelled' } };
    const res = createMockRes();

    const origEnd = interviewService.endInterview;
    interviewService.endInterview = async (userId, id, status) => ({
      interview: { _id: id, status: 'Cancelled' },
    });

    await endInterview(req, res, () => {});
    interviewService.endInterview = origEnd;

    if (res.statusCode === 200 && res.dataSent?.data?.interview?.status === 'Cancelled') {
      recordResult(
        'DELETE /api/v1/interviews/:id Delete / Cancel Session Endpoint Execution',
        true,
        'Handler executed successfully returning 200 OK.'
      );
    } else {
      recordResult('DELETE /api/v1/interviews/:id Delete / Cancel Session Endpoint Execution', false, 'Failed status check');
    }
  } catch (err) {
    recordResult('DELETE /api/v1/interviews/:id Delete / Cancel Session Endpoint Execution', false, err.message);
  }

  const passedCount = testResults.filter((t) => t.passed).length;
  console.log(`=== SUMMARY: ${passedCount}/${testResults.length} ROUTE & MIDDLEWARE TESTS PASSED ===`);
  if (passedCount === testResults.length) {
    console.log('ALL REST API ROUTE & MIDDLEWARE TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('SOME TESTS FAILED!');
    process.exit(1);
  }
}

runTestSuite();
