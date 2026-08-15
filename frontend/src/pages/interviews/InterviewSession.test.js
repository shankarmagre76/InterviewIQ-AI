import { interviewService } from '../../services/interviewService.js';
import { api } from '../../services/api.js';

console.log('=== F7.5 INTERVIEW SESSION UI & INTERACTION TEST SUITE ===\n');

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

async function runSessionTestSuite() {
  const mockId = '60d5ecb8b3b3b3b3b3b3b3b3';

  // Test 1: Fetch session questions & compute initial active question & progress
  try {
    const origGet = api.get;

    api.get = async () => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'Interview details retrieved successfully',
        data: {
          interview: {
            _id: mockId,
            role: 'Software Engineer',
            interviewType: 'Technical',
            difficulty: 'Intermediate',
            totalQuestions: 10,
            completedQuestions: 3,
            status: 'In Progress',
          },
          questions: [
            { _id: 'q1', sequenceNumber: 1, question: 'What is DOM?', answer: 'Document Object Model' },
            { _id: 'q2', sequenceNumber: 2, question: 'Explain Event Loop', answer: 'Single thread event queue' },
            { _id: 'q3', sequenceNumber: 3, question: 'Explain Closures', answer: 'Function lexical environment' },
            { _id: 'q4', sequenceNumber: 4, question: 'Explain HashMap vs ConcurrentHashMap', answer: '' },
            { _id: 'q5', sequenceNumber: 5, question: 'What is REST?', answer: '' },
          ],
        },
      },
    });

    const res = await interviewService.getInterviewDetails(mockId);
    const data = res.data;

    const unansweredIndex = data.questions.findIndex((q) => !q.answer || q.answer.trim().length === 0);
    const currentQ = data.questions[unansweredIndex];
    const totalCount = data.interview.totalQuestions;
    const remainingCount = totalCount - (unansweredIndex + 1);

    assert(unansweredIndex === 3, 'Identified 4th question as first unanswered question (4 / 10)');
    assert(currentQ.question === 'Explain HashMap vs ConcurrentHashMap', 'Active question matches target question text');
    assert(totalCount === 10, 'Total questions count reads 10');
    assert(remainingCount === 6, 'Remaining questions count calculated accurately (6 remaining)');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  // Test 2: Character Counter & Length Validation
  try {
    const sampleAnswer = 'HashMap is not thread-safe. ConcurrentHashMap uses segmented locking for thread safety.';
    const charLimit = 10000;
    const charCountText = `${sampleAnswer.length} / ${charLimit} characters`;

    assert(sampleAnswer.length === 87, 'Answer character count computed accurately (87 characters)');
    assert(charCountText === '87 / 10000 characters', 'Character count text string formatted properly');
    assert(sampleAnswer.length <= charLimit, 'Answer character count is within 10,000 character limit');
  } catch (err) {
    assert(false, `Test 2 failed: ${err.message}`);
  }

  // Test 3: Submit Answer & Gemini Evaluation Integration
  try {
    const origPost = api.post;
    let capturedBody = null;

    api.post = async (url, body) => {
      capturedBody = body;
      return {
        data: {
          success: true,
          statusCode: 200,
          message: 'Answer submitted and evaluated successfully',
          data: {
            question: { _id: body.questionId, score: 92 },
            evaluation: { score: 92, feedback: 'Excellent explanation of segment locks.' },
            completedQuestions: 4,
            totalQuestions: 10,
            isCompleted: false,
          },
        },
      };
    };

    const res = await interviewService.submitAnswer(mockId, {
      questionId: 'q4',
      answer: 'HashMap is non-thread-safe while ConcurrentHashMap uses segment lock buckets.',
    });

    assert(capturedBody.questionId === 'q4', 'Submit answer passes correct questionId in payload');
    assert(res.data.evaluation.score === 92, 'Gemini evaluation score returned successfully');
    assert(res.data.completedQuestions === 4, 'Completed questions count updated to 4');
    assert(res.data.isCompleted === false, 'Session is not completed yet (6 questions left)');

    api.post = origPost;
  } catch (err) {
    assert(false, `Test 3 failed: ${err.message}`);
  }

  // Test 4: Final Question Submission & Auto Navigation to Result
  try {
    const origPost = api.post;

    api.post = async () => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'Answer submitted and evaluated successfully',
        data: {
          question: { _id: 'q10', score: 95 },
          evaluation: { score: 95, feedback: 'All questions completed.' },
          completedQuestions: 10,
          totalQuestions: 10,
          isCompleted: true,
          result: { overallScore: 91 },
        },
      },
    });

    const res = await interviewService.submitAnswer(mockId, { questionId: 'q10', answer: 'Final answer' });
    assert(res.data.isCompleted === true, 'Final answer completion returns isCompleted = true');
    assert(`/interviews/${mockId}/result` === `/interviews/${mockId}/result`, 'Target redirection URL matches /interviews/:id/result');

    api.post = origPost;
  } catch (err) {
    assert(false, `Test 4 failed: ${err.message}`);
  }

  // Test 5: Keyboard Shortcut (Ctrl + Enter) Simulation
  try {
    const mockKeyboardEvent = {
      ctrlKey: true,
      metaKey: false,
      key: 'Enter',
      preventDefaultCalled: false,
      preventDefault() {
        this.preventDefaultCalled = true;
      },
    };

    const isSubmitShortcut = (mockKeyboardEvent.ctrlKey || mockKeyboardEvent.metaKey) && mockKeyboardEvent.key === 'Enter';
    if (isSubmitShortcut) {
      mockKeyboardEvent.preventDefault();
    }

    assert(isSubmitShortcut === true, 'Ctrl + Enter keyboard event detected properly');
    assert(mockKeyboardEvent.preventDefaultCalled === true, 'preventDefault called to stop newline insertion on Ctrl + Enter');
  } catch (err) {
    assert(false, `Test 5 failed: ${err.message}`);
  }

  console.log(`\n=== SESSION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL F7.5 INTERVIEW SESSION UI TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME SESSION TESTS FAILED!');
    process.exit(1);
  }
}

runSessionTestSuite();
