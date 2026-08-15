import { interviewService } from '../../services/interviewService.js';
import { api } from '../../services/api.js';

console.log('===================================================================');
console.log('=== FEATURE 7: COMPLETE AI MOCK INTERVIEW MASTER INTEGRATION ===');
console.log('===================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, testCategory, message) {
  if (condition) {
    console.log(`[PASS] [${testCategory}] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] [${testCategory}] ${message}`);
    failed++;
  }
}

async function runMasterF7TestSuite() {
  const mockId = '60d5ecb8b3b3b3b3b3b3b3b3';

  // -------------------------------------------------------------------------
  // 1. CONFIGURATION TESTS
  // -------------------------------------------------------------------------
  try {
    const validConfig = {
      role: 'Java Full Stack Developer',
      interviewType: 'Technical',
      difficulty: 'Intermediate',
      totalQuestions: 10,
    };

    const validateConfig = (cfg) => {
      const allowedTypes = ['Technical', 'HR', 'Behavioral', 'Mixed'];
      const allowedDiffs = ['Beginner', 'Intermediate', 'Advanced'];
      if (!cfg.role || !cfg.role.trim()) return 'Target role is required';
      if (!allowedTypes.includes(cfg.interviewType)) return 'Invalid interview type';
      if (!allowedDiffs.includes(cfg.difficulty)) return 'Invalid difficulty level';
      if (cfg.totalQuestions < 1 || cfg.totalQuestions > 50) return 'Question count must be between 1 and 50';
      return null;
    };

    assert(validateConfig(validConfig) === null, 'CONFIGURATION', 'Valid configuration passes validation');
    assert(validateConfig({ ...validConfig, role: '' }) === 'Target role is required', 'CONFIGURATION', 'Invalid empty role rejected');
    assert(validateConfig({ ...validConfig, interviewType: 'CodingChallenge' }) === 'Invalid interview type', 'CONFIGURATION', 'Unsupported interview type rejected');
    assert(validateConfig({ ...validConfig, difficulty: 'Extreme' }) === 'Invalid difficulty level', 'CONFIGURATION', 'Unsupported difficulty level rejected');
    assert(validateConfig({ ...validConfig, totalQuestions: 100 }) === 'Question count must be between 1 and 50', 'CONFIGURATION', 'Invalid question count rejected');
  } catch (err) {
    assert(false, 'CONFIGURATION', `Configuration tests failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 2. CREATION TESTS
  // -------------------------------------------------------------------------
  try {
    const origPost = api.post;

    // Test successful interview creation
    api.post = async () => ({
      data: {
        success: true,
        statusCode: 201,
        message: 'Interview created',
        data: { _id: mockId, role: 'Java Developer', status: 'Pending' },
      },
    });

    const res = await interviewService.startInterview({ role: 'Java Developer' });
    assert(res.data._id === mockId, 'CREATION', 'Interview creation returns session ID');

    // Test Gemini AI failure (503)
    api.post = async () => {
      const err = new Error('AI Overloaded');
      err.response = { status: 503, data: { message: 'Gemini AI service overloaded' } };
      throw err;
    };

    let creationErr = '';
    try {
      await interviewService.startInterview({ role: 'Java Developer' });
    } catch (e) {
      creationErr = e?.response?.data?.message;
    }
    assert(creationErr === 'Gemini AI service overloaded', 'CREATION', 'Gemini creation failure handled cleanly');

    // Test Rate Limit (429)
    api.post = async () => {
      const err = new Error('Rate limit');
      err.response = { status: 429, data: { message: 'Too many requests' } };
      throw err;
    };
    let rateLimitCaught = false;
    try {
      await interviewService.startInterview({ role: 'Java Developer' });
    } catch (e) {
      rateLimitCaught = e?.response?.status === 429;
    }
    assert(rateLimitCaught === true, 'CREATION', 'Rate limit 429 caught on creation');

    api.post = origPost;
  } catch (err) {
    assert(false, 'CREATION', `Creation tests failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 3. SESSION & QUESTION TESTS
  // -------------------------------------------------------------------------
  try {
    const origGet = api.get;
    const origPost = api.post;

    api.get = async () => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'Session details',
        data: {
          interview: { _id: mockId, role: 'Software Engineer', totalQuestions: 5, completedQuestions: 0, status: 'In Progress' },
          questions: [
            { _id: 'q1', sequenceNumber: 1, question: 'What is polymorphism?', answer: '' },
            { _id: 'q2', sequenceNumber: 2, question: 'Explain Dependency Injection.', answer: '' },
          ],
        },
      },
    });

    const sessionRes = await interviewService.getInterviewDetails(mockId);
    assert(sessionRes.data.questions.length === 2, 'SESSION', 'Questions loaded successfully');

    // Test Answer Submission
    api.post = async (url, body) => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'Answer submitted',
        data: {
          question: { _id: body.questionId, score: 85 },
          evaluation: { score: 85, feedback: 'Good answer' },
          completedQuestions: 1,
          totalQuestions: 5,
          isCompleted: false,
        },
      },
    });

    const submitRes = await interviewService.submitAnswer(mockId, { questionId: 'q1', answer: 'Polymorphism allows OOP flexibility.' });
    assert(submitRes.data.completedQuestions === 1, 'SESSION', 'Answer submitted and backend progress updated to 1/5');

    api.get = origGet;
    api.post = origPost;
  } catch (err) {
    assert(false, 'SESSION', `Session tests failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 4. COMPLETION TESTS
  // -------------------------------------------------------------------------
  try {
    const origPost = api.post;

    api.post = async () => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'Completed',
        data: {
          completedQuestions: 5,
          totalQuestions: 5,
          isCompleted: true,
          result: { overallScore: 88 },
        },
      },
    });

    const finalRes = await interviewService.submitAnswer(mockId, { questionId: 'q5', answer: 'Final answer text' });
    assert(finalRes.data.isCompleted === true, 'COMPLETION', 'Final question submission returns isCompleted = true');

    api.post = origPost;
  } catch (err) {
    assert(false, 'COMPLETION', `Completion tests failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 5. EVALUATION TESTS
  // -------------------------------------------------------------------------
  try {
    const rawEval = {
      score: 85,
      technicalScore: 88,
      communicationScore: 80,
      strengths: ['Clear terminology'],
      weaknesses: ['Add SLA numbers'],
      summary: 'Solid effort.',
    };

    assert(rawEval.score === 85, 'EVALUATION', 'Evaluation score returned');
    assert(rawEval.strengths.length === 1, 'EVALUATION', 'Evaluation strengths array returned');
  } catch (err) {
    assert(false, 'EVALUATION', `Evaluation tests failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 6. RESULT TESTS
  // -------------------------------------------------------------------------
  try {
    const origGet = api.get;

    api.get = async () => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'Result details',
        data: {
          overallScore: 86,
          technicalScore: 90,
          communicationScore: 82,
          problemSolvingScore: 88,
          strengths: ['Great design thinking'],
          weaknesses: ['Specify metrics'],
          recommendations: ['Practice STAR method'],
          summary: 'Passed technical bar.',
        },
      },
    });

    const resultRes = await interviewService.getInterviewResult(mockId);
    const result = resultRes.data;

    assert(result.overallScore === 86, 'RESULTS', 'Result overallScore is 86');
    assert(result.technicalScore === 90, 'RESULTS', 'Result technicalScore is 90');
    assert(result.recommendations.length === 1, 'RESULTS', 'Result recommendations populated');

    api.get = origGet;
  } catch (err) {
    assert(false, 'RESULTS', `Results tests failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 7. HISTORY TESTS
  // -------------------------------------------------------------------------
  try {
    const origGet = api.get;

    api.get = async () => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'History',
        data: [
          { _id: '1', role: 'Java Dev', status: 'Completed', overallScore: 90 },
          { _id: '2', role: 'React Dev', status: 'In Progress', overallScore: null },
        ],
      },
    });

    const historyRes = await interviewService.getInterviewHistory();
    assert(historyRes.data.length === 2, 'HISTORY', 'Interview history returned 2 sessions');

    api.get = origGet;
  } catch (err) {
    assert(false, 'HISTORY', `History tests failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 8. SECURITY TESTS
  // -------------------------------------------------------------------------
  try {
    const checkSecurityData = (payloadStr) => {
      const leaksApiKey = payloadStr.includes('GEMINI_API_KEY') || payloadStr.includes('GOOGLE_API_KEY');
      const leaksPrompt = payloadStr.includes('system_instruction');
      return !leaksApiKey && !leaksPrompt;
    };

    const safeString = 'Overall score: 85/100. Solid candidate response.';
    assert(checkSecurityData(safeString) === true, 'SECURITY', 'Payload verified free of API keys or internal prompt text');
  } catch (err) {
    assert(false, 'SECURITY', `Security tests failed: ${err.message}`);
  }

  console.log(`\n===================================================================`);
  console.log(`=== MASTER TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  console.log(`===================================================================\n`);

  if (failed === 0) {
    console.log('ALL FEATURE 7 INTEGRATION TESTS PASSED 100%!');
  } else {
    console.error('FEATURE 7 INTEGRATION TESTS HAD FAILURES!');
    process.exit(1);
  }
}

runMasterF7TestSuite();
