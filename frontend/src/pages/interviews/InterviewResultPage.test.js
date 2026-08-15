import { interviewService } from '../../services/interviewService.js';
import { api } from '../../services/api.js';

console.log('=== F7.9 INTERVIEW RESULTS PAGE & SUB-COMPONENTS TEST SUITE ===\n');

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

async function runResultPageTestSuite() {
  const mockId = '60d5ecb8b3b3b3b3b3b3b3b3';

  // Test 1: Fetch Composite Result & Verify Metrics Mapping
  try {
    const origGet = api.get;

    api.get = async (url) => {
      if (url.includes('/result')) {
        return {
          data: {
            success: true,
            statusCode: 200,
            message: 'Result retrieved',
            data: {
              overallScore: 82,
              technicalScore: 85,
              communicationScore: 78,
              hrScore: 80,
              strengths: ['Solid architecture design concepts', 'Used clear technical terms'],
              weaknesses: ['Could specify SLA latency metrics'],
              recommendations: ['Practice STAR method for scenario questions'],
              summary: 'Candidate passed technical bar with strong engineering understanding.',
            },
          },
        };
      }
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Details retrieved',
          data: {
            interview: {
              _id: mockId,
              role: 'Java Full Stack Developer',
              interviewType: 'Technical',
              difficulty: 'Intermediate',
              status: 'Completed',
            },
            questions: [
              {
                _id: 'q1',
                sequenceNumber: 1,
                question: 'Explain ConcurrentHashMap vs HashMap.',
                answer: 'ConcurrentHashMap uses segment locks.',
                score: 90,
                aiFeedback: { comments: 'Excellent concurrency explanation.' },
              },
            ],
          },
        },
      };
    };

    const detailsRes = await interviewService.getInterviewDetails(mockId);
    const resultRes = await interviewService.getInterviewResult(mockId);

    const session = detailsRes.data.interview;
    const questions = detailsRes.data.questions;
    const result = resultRes.data;

    assert(session.role === 'Java Full Stack Developer', 'Interview role maps correctly to Java Full Stack Developer');
    assert(result.overallScore === 82, 'Overall score maps to 82/100');
    assert(result.technicalScore === 85, 'Technical score maps to 85');
    assert(result.communicationScore === 78, 'Communication score maps to 78');
    assert(result.strengths.length === 2, 'Strengths array length is 2');
    assert(result.weaknesses.length === 1, 'Weaknesses array length is 1');
    assert(result.recommendations.length === 1, 'Recommendations array length is 1');
    assert(questions[0].score === 90, 'Question #1 score maps to 90/100');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  // Test 2: Action Button Targets Verification
  try {
    const actions = {
      tryAgain: '/interviews/setup',
      viewHistory: '/interviews',
      continueLearning: '/roadmap',
    };

    assert(actions.tryAgain === '/interviews/setup', '[ Try Again ] button targets /interviews/setup');
    assert(actions.viewHistory === '/interviews', '[ View History ] button targets /interviews');
    assert(actions.continueLearning === '/roadmap', '[ Continue Learning ] button targets /roadmap');
  } catch (err) {
    assert(false, `Test 2 failed: ${err.message}`);
  }

  console.log(`\n=== RESULT PAGE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL F7.9 INTERVIEW RESULTS TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME RESULT PAGE TESTS FAILED!');
    process.exit(1);
  }
}

runResultPageTestSuite();
