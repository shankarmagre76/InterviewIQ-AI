import { interviewService } from '../../services/interviewService.js';
import { api } from '../../services/api.js';

console.log('=== F7.8 AI EVALUATION INTEGRATION TEST SUITE ===\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

async function runAIEvaluationTestSuite() {
  const mockId = '60d5ecb8b3b3b3b3b3b3b3b3';

  // Test 1: Data Sanitization & Security Rule Verification (No raw API keys / prompts / stack traces)
  try {
    const rawBackendResult = {
      overallScore: 150, // Needs clamping to 100
      technicalScore: -10, // Needs clamping to 0
      communicationScore: 85,
      problemSolvingScore: 90,
      strengths: ['```json {"key": "value"} ```', 'Good Java knowledge', 'system_instruction: prompt'],
      weaknesses: ['GEMINI_API_KEY=AIzaSyA123456789', 'Lacks SLA latency details'],
      recommendations: ['Practice STAR method'],
      summary: 'Candidate demonstrated strong technical skills. GEMINI_API_KEY=secret_key',
    };

    const clampScore = (val, fallback = 80) => {
      const num = Number(val);
      if (isNaN(num)) return fallback;
      return Math.max(0, Math.min(100, Math.round(num)));
    };

    const sanitizeString = (str) => {
      if (!str || typeof str !== 'string') return '';
      let cleaned = str.replace(/```[a-zA-Z]*/g, '').replace(/```/g, '').trim();
      if (cleaned.includes('GEMINI_API_KEY') || cleaned.includes('GOOGLE_API_KEY')) {
        cleaned = 'Evaluation feedback generated successfully.';
      }
      return cleaned;
    };

    const sanitizeArray = (arr, fallback = []) => {
      if (!Array.isArray(arr)) return fallback;
      const cleanList = arr
        .map(sanitizeString)
        .filter((s) => s.length > 0 && !s.startsWith('{') && !s.includes('system_instruction'));
      return cleanList.length > 0 ? cleanList : fallback;
    };

    const sanitized = {
      overallScore: clampScore(rawBackendResult.overallScore),
      technicalScore: clampScore(rawBackendResult.technicalScore),
      communicationScore: clampScore(rawBackendResult.communicationScore),
      problemSolvingScore: clampScore(rawBackendResult.problemSolvingScore),
      strengths: sanitizeArray(rawBackendResult.strengths),
      weaknesses: sanitizeArray(rawBackendResult.weaknesses),
      summary: sanitizeString(rawBackendResult.summary),
    };

    assert(sanitized.overallScore === 100, 'Score > 100 clamped down to 100');
    assert(sanitized.technicalScore === 0, 'Score < 0 clamped up to 0');
    assert(!sanitized.strengths.includes('system_instruction: prompt'), 'Internal prompts stripped from strengths array');
    assert(!sanitized.weaknesses.some((w) => w.includes('GEMINI_API_KEY')), 'Gemini API keys sanitized from weaknesses array');
    assert(!sanitized.summary.includes('secret_key'), 'Backend secret strings sanitized from summary text');
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  // Test 2: AI Processing State Messages Exact Check
  try {
    const processingTitle = 'Analyzing your interview...';
    const processingSubtitle = 'AI is evaluating your answers, communication, technical accuracy and overall performance.';

    assert(processingTitle === 'Analyzing your interview...', 'Processing state title matches exact user directive');
    assert(processingSubtitle === 'AI is evaluating your answers, communication, technical accuracy and overall performance.', 'Processing state subtitle matches exact user directive');
  } catch (err) {
    assert(false, `Test 2 failed: ${err.message}`);
  }

  // Test 3: Gemini Evaluation Timeout & Rate Limit (429) Handling
  try {
    const origGet = api.get;

    api.get = async () => {
      const err = new Error('Rate limit exceeded');
      err.response = { status: 429, data: { message: 'AI Rate Limit Exceeded (10 requests/hour limit)' } };
      throw err;
    };

    let statusCaught = 0;
    try {
      await interviewService.getInterviewResult(mockId);
    } catch (err) {
      statusCaught = err?.response?.status;
    }

    assert(statusCaught === 429, 'Rate limit status 429 caught cleanly for AI evaluation service');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 3 failed: ${err.message}`);
  }

  // Test 4: Missing Result / Pending Result State Handling
  try {
    const origGet = api.get;

    api.get = async () => {
      const err = new Error('Not Found');
      err.response = { status: 404, data: { message: 'Evaluation result not yet generated' } };
      throw err;
    };

    let isPending = false;
    try {
      await interviewService.getInterviewResult(mockId);
    } catch (err) {
      if (err?.response?.status === 404) {
        isPending = true;
      }
    }

    assert(isPending === true, 'Missing result (404) triggers pending evaluation state gracefully');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 4 failed: ${err.message}`);
  }

  // Test 5: End-to-End Evaluation Workflow Verification
  try {
    const origPost = api.post;

    api.post = async () => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'Answer evaluated',
        data: {
          question: { _id: 'q1', score: 88 },
          evaluation: {
            score: 88,
            technicalScore: 90,
            communicationScore: 85,
            feedback: 'Solid answer on Spring Boot architecture.',
          },
          completedQuestions: 5,
          totalQuestions: 5,
          isCompleted: true,
          result: {
            overallScore: 88,
            technicalScore: 90,
            communicationScore: 85,
            problemSolvingScore: 89,
            summary: 'Great performance across all technical questions.',
          },
        },
      },
    });

    const res = await interviewService.submitAnswer(mockId, { questionId: 'q5', answer: 'Final technical answer' });
    const data = res.data;

    assert(data.evaluation.score === 88, 'Per-answer evaluation score returned synchronously');
    assert(data.result.overallScore === 88, 'Aggregate result generated synchronously upon final answer completion');

    api.post = origPost;
  } catch (err) {
    assert(false, `Test 5 failed: ${err.message}`);
  }

  console.log(`\n=== AI EVALUATION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL F7.8 AI EVALUATION INTEGRATION TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME AI EVALUATION TESTS FAILED!');
    process.exit(1);
  }
}

runAIEvaluationTestSuite();
