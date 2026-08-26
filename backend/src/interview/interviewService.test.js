import mongoose from 'mongoose';
import interviewService from './interview.service.js';
import interviewRepository from './interview.repository.js';
import interviewQuestionRepository from './interviewQuestion.repository.js';
import interviewResultRepository from './interviewResult.repository.js';
import aiInterviewService from './aiInterview.service.js';
import evaluationService from './evaluation.service.js';
import Interview from './interview.model.js';
import InterviewQuestion from './interviewQuestion.model.js';
import InterviewResult from './interviewResult.model.js';

console.log('=== INTERVIEWIQ SERVICE LAYER TEST SUITE ===\n');

async function runTestSuite() {
  const testResults = [];

  const recordResult = (testName, passed, message) => {
    testResults.push({ testName, passed, message });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName}`);
    console.log(`       Details: ${message}\n`);
  };

  const mockUserId = new mongoose.Types.ObjectId();
  const mockInterviewId = new mongoose.Types.ObjectId();
  const mockQuestionId1 = new mongoose.Types.ObjectId();
  const mockQuestionId2 = new mongoose.Types.ObjectId();

  const mockInterviewDoc = new Interview({
    _id: mockInterviewId,
    user: mockUserId,
    role: 'Full Stack Engineer',
    interviewType: 'Technical',
    difficulty: 'Intermediate',
    status: 'Pending',
    totalQuestions: 2,
    completedQuestions: 0,
    estimatedDuration: 30,
  });
  mockInterviewDoc.save = async function () { return this; };

  const mockQuestion1 = new InterviewQuestion({
    _id: mockQuestionId1,
    interview: mockInterviewId,
    question: 'What is Node.js?',
    expectedAnswer: 'Runtime built on V8',
    sequenceNumber: 1,
    answer: '',
  });
  mockQuestion1.save = async function () { return this; };

  const mockQuestion2 = new InterviewQuestion({
    _id: mockQuestionId2,
    interview: mockInterviewId,
    question: 'What is MongoDB?',
    expectedAnswer: 'NoSQL document database',
    sequenceNumber: 2,
    answer: '',
  });
  mockQuestion2.save = async function () { return this; };

  // Test 1: startInterview
  try {
    const origCreateInt = interviewRepository.createInterview;
    const origGenQuest = aiInterviewService.generateInterviewQuestions;
    const origSaveQuest = interviewQuestionRepository.saveManyQuestions;

    interviewRepository.createInterview = async (data) => mockInterviewDoc;
    aiInterviewService.generateInterviewQuestions = async () => [
      { question: 'What is Node.js?', expectedAnswer: 'Runtime' },
      { question: 'What is MongoDB?', expectedAnswer: 'NoSQL' },
    ];
    interviewQuestionRepository.saveManyQuestions = async (arr) => [mockQuestion1, mockQuestion2];

    const result = await interviewService.startInterview(mockUserId.toString(), {
      role: 'Full Stack Engineer',
      totalQuestions: 2,
    });

    // Restore
    interviewRepository.createInterview = origCreateInt;
    aiInterviewService.generateInterviewQuestions = origGenQuest;
    interviewQuestionRepository.saveManyQuestions = origSaveQuest;

    const isSessionCreated = !!result.interview && result.interview._id === mockInterviewId;
    const isQuestionsGenerated = Array.isArray(result.questions) && result.questions.length === 2;

    if (isSessionCreated && isQuestionsGenerated) {
      recordResult(
        'startInterview Workflow',
        true,
        'Created interview session and initialized AI-generated questions.'
      );
    } else {
      recordResult('startInterview Workflow', false, 'Failed to initialize session or questions.');
    }
  } catch (err) {
    recordResult('startInterview Workflow', false, err.message);
  }

  // Test 2: receiveAnswers & Progress Auto-Completion
  try {
    const origGetResult = interviewResultRepository.getResult;
    interviewResultRepository.getResult = async () => null;

    interviewRepository.findInterviewById = async (id) => mockInterviewDoc;
    interviewQuestionRepository.getQuestions = async () => [mockQuestion1, mockQuestion2];

    let evalCount = 0;
    evaluationService.evaluateQuestionAnswer = async ({ questionId, userAnswer }) => {
      evalCount++;
      if (questionId === mockQuestionId1.toString()) {
        mockQuestion1.answer = userAnswer;
        mockQuestion1.score = 85;
      } else {
        mockQuestion2.answer = userAnswer;
        mockQuestion2.score = 90;
      }
      return {
        question: questionId === mockQuestionId1.toString() ? mockQuestion1 : mockQuestion2,
        evaluation: { score: 85 },
      };
    };

    interviewRepository.updateInterview = async (id, update) => {
      Object.assign(mockInterviewDoc, update);
      return mockInterviewDoc;
    };

    evaluationService.generateFinalInterviewResult = async () => ({
      _id: new mongoose.Types.ObjectId(),
      interview: mockInterviewId,
      overallScore: 88,
    });

    // Answer Q1
    const ans1Res = await interviewService.receiveAnswers(
      mockUserId.toString(),
      mockInterviewId.toString(),
      mockQuestionId1.toString(),
      'Node.js is an async runtime.'
    );

    const isQ1Answered = ans1Res.completedQuestions === 1 && ans1Res.isCompleted === false;

    // Answer Q2 (Triggers completion)
    const ans2Res = await interviewService.receiveAnswers(
      mockUserId.toString(),
      mockInterviewId.toString(),
      mockQuestionId2.toString(),
      'MongoDB is a document database.'
    );

    const isQ2Answered = ans2Res.completedQuestions === 2 && ans2Res.isCompleted === true && !!ans2Res.result;

    // Restore
    interviewResultRepository.getResult = origGetResult;

    if (isQ1Answered && isQ2Answered) {
      recordResult(
        'receiveAnswers & Progress Auto-Completion',
        true,
        'Successfully processed answer submissions, updated progress, and triggered completion report.'
      );
    } else {
      recordResult(
        'receiveAnswers & Progress Auto-Completion',
        false,
        'Failed progress update or completion trigger.'
      );
    }
  } catch (err) {
    recordResult('receiveAnswers & Progress Auto-Completion', false, err.message);
  }

  // Test 3: resumeInterview Workflow
  try {
    const origFindInt = interviewRepository.findInterviewById;
    const origGetQuestions = interviewQuestionRepository.getQuestions;

    mockInterviewDoc.status = 'In Progress';
    mockQuestion1.answer = 'Answered text';
    mockQuestion2.answer = '';

    interviewRepository.findInterviewById = async () => mockInterviewDoc;
    interviewQuestionRepository.getQuestions = async () => [mockQuestion1, mockQuestion2];

    const resumeRes = await interviewService.resumeInterview(
      mockUserId.toString(),
      mockInterviewId.toString()
    );

    // Restore
    interviewRepository.findInterviewById = origFindInt;
    interviewQuestionRepository.getQuestions = origGetQuestions;

    const isResumedValid =
      resumeRes.remainingCount === 1 &&
      resumeRes.currentQuestion._id === mockQuestionId2;

    if (isResumedValid) {
      recordResult(
        'resumeInterview Workflow',
        true,
        'Successfully recovered in-progress interview, identifying active next question.'
      );
    } else {
      recordResult(
        'resumeInterview Workflow',
        false,
        'Failed to identify active next unanswered question.'
      );
    }
  } catch (err) {
    recordResult('resumeInterview Workflow', false, err.message);
  }

  // Test 4: Security & Ownership Validation
  try {
    const origFindInt = interviewRepository.findInterviewById;
    const otherUserId = new mongoose.Types.ObjectId();

    interviewRepository.findInterviewById = async () => mockInterviewDoc;

    let rejected = false;
    try {
      await interviewService.receiveAnswers(
        otherUserId.toString(),
        mockInterviewId.toString(),
        mockQuestionId1.toString(),
        'Unauthorized answer'
      );
    } catch (err) {
      if (err.statusCode === 403) rejected = true;
    }

    // Restore
    interviewRepository.findInterviewById = origFindInt;

    if (rejected) {
      recordResult(
        'Cross-User Security & Authorization Rejection (403 Forbidden)',
        true,
        'Successfully rejected unauthorized user access to another candidate session.'
      );
    } else {
      recordResult(
        'Cross-User Security & Authorization Rejection (403 Forbidden)',
        false,
        'Failed to reject unauthorized user session access.'
      );
    }
  } catch (err) {
    recordResult('Cross-User Security Rejection', false, err.message);
  }

  const passedCount = testResults.filter((t) => t.passed).length;
  console.log(`=== SUMMARY: ${passedCount}/${testResults.length} SERVICE TESTS PASSED ===`);
  if (passedCount === testResults.length) {
    console.log('ALL INTERVIEW SERVICE TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('SOME TESTS FAILED!');
    process.exit(1);
  }
}

runTestSuite();
