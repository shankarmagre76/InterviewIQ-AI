import { interviewService } from './interviewService.js';
import { api } from './api.js';

console.log('=== FRONTEND INTERVIEW SERVICE API INTEGRATION TEST SUITE ===\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  const mockInterviewId = '60d5ecb8b3b3b3b3b3b3b3b3';
  const mockQuestionId = '60d5ecb8b3b3b3b3b3b3b3b4';

  // 1. Test startInterview & createInterview
  try {
    const originalPost = api.post;
    let capturedUrl = '';
    let capturedBody = null;

    api.post = async (url, body) => {
      capturedUrl = url;
      capturedBody = body;
      return {
        data: {
          success: true,
          statusCode: 201,
          message: 'Interview session started successfully',
          data: {
            interview: { _id: mockInterviewId, role: body.role || 'Software Engineer' },
            questions: [{ _id: mockQuestionId, question: 'What is React?' }],
          },
        },
      };
    };

    const res = await interviewService.startInterview({ role: 'Backend Dev', totalQuestions: 5 });
    assert(capturedUrl === '/interviews/start', 'startInterview hits /interviews/start');
    assert(capturedBody.role === 'Backend Dev', 'startInterview passes request body correctly');
    assert(res.success === true && res.data.interview._id === mockInterviewId, 'startInterview returns expected response structure');

    const res2 = await interviewService.createInterview({ role: 'Fullstack' });
    assert(res2.data.interview.role === 'Fullstack', 'createInterview alias works properly');

    api.post = originalPost;
  } catch (err) {
    assert(false, `startInterview test threw error: ${err.message}`);
  }

  // 2. Test getInterviewHistory & getInterviews
  try {
    const originalGet = api.get;
    let capturedUrl = '';
    let capturedParams = null;

    api.get = async (url, config) => {
      capturedUrl = url;
      capturedParams = config?.params;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Interview history retrieved successfully',
          data: [{ _id: mockInterviewId, role: 'Software Engineer' }],
        },
      };
    };

    const res = await interviewService.getInterviewHistory({ page: 1, limit: 10 });
    assert(capturedUrl === '/interviews', 'getInterviewHistory hits /interviews');
    assert(capturedParams.limit === 10, 'getInterviewHistory passes query parameters');
    assert(Array.isArray(res.data) && res.data.length === 1, 'getInterviewHistory returns array of interviews');

    const res2 = await interviewService.getInterviews();
    assert(res2.data[0]._id === mockInterviewId, 'getInterviews alias works properly');

    api.get = originalGet;
  } catch (err) {
    assert(false, `getInterviewHistory test threw error: ${err.message}`);
  }

  // 3. Test getInterviewDetails, getInterview, getInterviewById
  try {
    const originalGet = api.get;
    let capturedUrl = '';

    api.get = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Interview details retrieved successfully',
          data: {
            interview: { _id: mockInterviewId },
            questions: [],
            result: null,
          },
        },
      };
    };

    const res = await interviewService.getInterviewDetails(mockInterviewId);
    assert(capturedUrl === `/interviews/${mockInterviewId}`, 'getInterviewDetails hits /interviews/:id');
    assert(res.data.interview._id === mockInterviewId, 'getInterviewDetails returns session data');

    const res2 = await interviewService.getInterview(mockInterviewId);
    assert(res2.data.interview._id === mockInterviewId, 'getInterview alias works properly');

    api.get = originalGet;
  } catch (err) {
    assert(false, `getInterviewDetails test threw error: ${err.message}`);
  }

  // 4. Test resumeInterview
  try {
    const originalPost = api.post;
    let capturedUrl = '';

    api.post = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Interview session resumed successfully',
          data: {
            interview: { _id: mockInterviewId, status: 'In Progress' },
            questions: [{ _id: mockQuestionId, answer: '' }],
            currentQuestion: { _id: mockQuestionId, question: 'Explain Closure' },
            remainingCount: 1,
          },
        },
      };
    };

    const res = await interviewService.resumeInterview(mockInterviewId);
    assert(capturedUrl === `/interviews/${mockInterviewId}/resume`, 'resumeInterview hits /interviews/:id/resume');
    assert(res.data.currentQuestion.question === 'Explain Closure', 'resumeInterview returns current active question');

    api.post = originalPost;
  } catch (err) {
    assert(false, `resumeInterview test threw error: ${err.message}`);
  }

  // 5. Test getQuestions & getCurrentQuestion
  try {
    const originalGet = api.get;
    const originalPost = api.post;

    api.get = async (url) => {
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Interview questions retrieved successfully',
          data: [{ _id: mockQuestionId, question: 'What is Node.js?', answer: '' }],
        },
      };
    };

    api.post = async () => ({
      data: {
        data: { currentQuestion: { _id: mockQuestionId, question: 'What is Node.js?' } },
      },
    });

    const res = await interviewService.getQuestions(mockInterviewId);
    assert(Array.isArray(res.data) && res.data[0]._id === mockQuestionId, 'getQuestions returns question list');

    const currQ = await interviewService.getCurrentQuestion(mockInterviewId);
    assert(currQ._id === mockQuestionId, 'getCurrentQuestion returns active unanswered question');

    api.get = originalGet;
    api.post = originalPost;
  } catch (err) {
    assert(false, `getQuestions test threw error: ${err.message}`);
  }

  // 6. Test submitAnswer
  try {
    const originalPost = api.post;
    let capturedUrl = '';
    let capturedBody = null;

    api.post = async (url, body) => {
      capturedUrl = url;
      capturedBody = body;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Answer submitted and evaluated successfully',
          data: {
            question: { _id: body.questionId, score: 85 },
            evaluation: { score: 85, feedback: 'Good answer' },
            completedQuestions: 1,
            totalQuestions: 5,
            isCompleted: false,
            result: null,
          },
        },
      };
    };

    const res1 = await interviewService.submitAnswer(mockInterviewId, {
      questionId: mockQuestionId,
      answer: 'Event loop manages async operations.',
    });

    assert(capturedUrl === `/interviews/${mockInterviewId}/answer`, 'submitAnswer hits /interviews/:id/answer');
    assert(capturedBody.questionId === mockQuestionId, 'submitAnswer constructs questionId in body');
    assert(capturedBody.answer === 'Event loop manages async operations.', 'submitAnswer passes answer string');
    assert(res1.data.evaluation.score === 85, 'submitAnswer returns evaluation report');

    // Test alternate signature submitAnswer(id, questionId, text)
    await interviewService.submitAnswer(mockInterviewId, mockQuestionId, 'Second answer text');
    assert(capturedBody.answer === 'Second answer text', 'submitAnswer accepts positional arguments (id, questionId, text)');

    api.post = originalPost;
  } catch (err) {
    assert(false, `submitAnswer test threw error: ${err.message}`);
  }

  // 7. Test completeInterview & finishInterview
  try {
    const originalPost = api.post;
    let capturedUrl = '';
    let capturedBody = null;

    api.post = async (url, body) => {
      capturedUrl = url;
      capturedBody = body;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Interview session concluded successfully',
          data: {
            interview: { _id: mockInterviewId, status: 'Completed' },
            result: { overallScore: 90 },
          },
        },
      };
    };

    const res = await interviewService.completeInterview(mockInterviewId);
    assert(capturedUrl === `/interviews/${mockInterviewId}/complete`, 'completeInterview hits /interviews/:id/complete');
    assert(res.data.interview.status === 'Completed', 'completeInterview marks session Completed');

    const res2 = await interviewService.finishInterview(mockInterviewId);
    assert(capturedUrl === `/interviews/${mockInterviewId}/finish`, 'finishInterview hits /interviews/:id/finish');

    api.post = originalPost;
  } catch (err) {
    assert(false, `completeInterview test threw error: ${err.message}`);
  }

  // 8. Test getInterviewResult
  try {
    const originalGet = api.get;
    let capturedUrl = '';

    api.get = async (url) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Interview evaluation result retrieved successfully',
          data: {
            overallScore: 88,
            technicalScore: 90,
            summary: 'Excellent performance.',
          },
        },
      };
    };

    const res = await interviewService.getInterviewResult(mockInterviewId);
    assert(capturedUrl === `/interviews/${mockInterviewId}/result`, 'getInterviewResult hits /interviews/:id/result');
    assert(res.data.overallScore === 88, 'getInterviewResult returns evaluation report');

    api.get = originalGet;
  } catch (err) {
    assert(false, `getInterviewResult test threw error: ${err.message}`);
  }

  // 9. Test deleteInterview, cancelInterview, endInterview
  try {
    const originalDelete = api.delete;
    let capturedUrl = '';
    let capturedConfig = null;

    api.delete = async (url, config) => {
      capturedUrl = url;
      capturedConfig = config;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Interview session concluded successfully',
          data: {
            interview: { _id: mockInterviewId, status: 'Cancelled' },
          },
        },
      };
    };

    const res = await interviewService.deleteInterview(mockInterviewId);
    assert(capturedUrl === `/interviews/${mockInterviewId}`, 'deleteInterview hits DELETE /interviews/:id');
    assert(res.data.interview.status === 'Cancelled', 'deleteInterview cancels interview session');

    await interviewService.cancelInterview(mockInterviewId);
    assert(capturedConfig.data.status === 'Cancelled', 'cancelInterview sends status: Cancelled');

    api.delete = originalDelete;
  } catch (err) {
    assert(false, `deleteInterview test threw error: ${err.message}`);
  }

  console.log(`\n=== SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED ===`);
  if (testsFailed === 0) {
    console.log('ALL FRONTEND INTERVIEW SERVICE TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME SERVICE TESTS FAILED!');
    process.exit(1);
  }
}

runTests();
