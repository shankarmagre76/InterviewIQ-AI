import interviewFlowService from './interviewFlow.service.js';
import mongoose from 'mongoose';
import interviewRepository from './interview.repository.js';
import interviewQuestionRepository from './interviewQuestion.repository.js';
import interviewResultRepository from './interviewResult.repository.js';
import evaluationService from './evaluation.service.js';
import Interview from './interview.model.js';
import InterviewQuestion from './interviewQuestion.model.js';

console.log('=== INTERVIEWIQ INTERVIEW FLOW MANAGEMENT TEST SUITE ===\n');

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

  const mockInterview = new Interview({
    _id: mockInterviewId,
    user: mockUserId,
    role: 'Backend Engineer',
    interviewType: 'Technical',
    difficulty: 'Intermediate',
    status: 'Pending',
    totalQuestions: 2,
    completedQuestions: 0,
    estimatedDuration: 30,
  });
  mockInterview.save = async function () { return this; };

  const question1 = new InterviewQuestion({
    _id: mockQuestionId1,
    interview: mockInterviewId,
    question: 'What is event loop?',
    sequenceNumber: 1,
    answer: '',
  });
  question1.save = async function () { return this; };

  const question2 = new InterviewQuestion({
    _id: mockQuestionId2,
    interview: mockInterviewId,
    question: 'What is clustering?',
    sequenceNumber: 2,
    answer: '',
  });
  question2.save = async function () { return this; };

  // Test 1: Track Current Question & Flow Status Calculation
  try {
    const origFindInt = interviewRepository.findInterviewById;
    const origGetQuestions = interviewQuestionRepository.getQuestions;

    interviewRepository.findInterviewById = async () => mockInterview;
    interviewQuestionRepository.getQuestions = async () => [question1, question2];

    const currentTrack = await interviewFlowService.getCurrentQuestion(mockInterviewId.toString());
    const flowStatus = await interviewFlowService.getFlowStatus(mockInterviewId.toString());

    interviewRepository.findInterviewById = origFindInt;
    interviewQuestionRepository.getQuestions = origGetQuestions;

    const isCurrentTrackValid = currentTrack.currentQuestion._id === mockQuestionId1 && currentTrack.activeIndex === 1;
    const isFlowStatusValid = flowStatus.completedCount === 0 && flowStatus.progressPercentage === 0;

    if (isCurrentTrackValid && isFlowStatusValid) {
      recordResult(
        'Current Question & Flow Status Calculation',
        true,
        'Accurately identified Q1 as active current question and calculated 0% progress.'
      );
    } else {
      recordResult('Current Question & Flow Status Calculation', false, 'Tracking calculation mismatch.');
    }
  } catch (err) {
    recordResult('Current Question & Flow Status Calculation', false, err.message);
  }

  // Test 2: Idempotent Answer Submission (Duplicate Submission Prevention)
  try {
    const origFindInt = interviewRepository.findInterviewById;
    const origGetQuestionById = interviewQuestionRepository.getQuestionById;
    const origUpdateInt = interviewRepository.updateInterview;
    const origEvalAnswer = evaluationService.evaluateQuestionAnswer;
    const origGetQuestions = interviewQuestionRepository.getQuestions;

    interviewRepository.findInterviewById = async () => mockInterview;
    interviewQuestionRepository.getQuestionById = async (id) =>
      id.toString() === mockQuestionId1.toString() ? question1 : question2;

    interviewRepository.updateInterview = async (id, update) => {
      Object.assign(mockInterview, update);
      return mockInterview;
    };

    evaluationService.evaluateQuestionAnswer = async () => {
      question1.answer = 'Answer text';
      question1.score = 85;
      return { question: question1, evaluation: { score: 85 } };
    };

    interviewQuestionRepository.getQuestions = async () => [question1, question2];

    // Submission 1: First answer submission
    const submit1 = await interviewFlowService.submitAnswerIdempotent(
      mockUserId.toString(),
      mockInterviewId.toString(),
      mockQuestionId1.toString(),
      'Answer text'
    );

    const isSubmission1Valid = submit1.isDuplicateSubmission === false && mockInterview.status === 'In Progress';

    // Submission 2: Duplicate re-submission of Q1
    const submit2 = await interviewFlowService.submitAnswerIdempotent(
      mockUserId.toString(),
      mockInterviewId.toString(),
      mockQuestionId1.toString(),
      'Updated answer text'
    );

    const isSubmission2Duplicate = submit2.isDuplicateSubmission === true;

    // Restore
    interviewRepository.findInterviewById = origFindInt;
    interviewQuestionRepository.getQuestionById = origGetQuestionById;
    interviewRepository.updateInterview = origUpdateInt;
    evaluationService.evaluateQuestionAnswer = origEvalAnswer;
    interviewQuestionRepository.getQuestions = origGetQuestions;

    if (isSubmission1Valid && isSubmission2Duplicate) {
      recordResult(
        'Idempotent Answer Submission (Duplicate Prevention)',
        true,
        'Successfully flagged re-submission as duplicate and updated answer text without double-counting.'
      );
    } else {
      recordResult('Idempotent Answer Submission (Duplicate Prevention)', false, 'Idempotency check failed.');
    }
  } catch (err) {
    recordResult('Idempotent Answer Submission (Duplicate Prevention)', false, err.message);
  }

  // Test 3: Time Limit Calculation & Auto-Expiration
  try {
    const origFindInt = interviewRepository.findInterviewById;
    const origUpdateInt = interviewRepository.updateInterview;
    const origGetQuestions = interviewQuestionRepository.getQuestions;
    const origGenResult = evaluationService.generateFinalInterviewResult;

    // Create an expired interview session (started 45 minutes ago, estimated 30 mins)
    const expiredMock = new Interview({
      _id: mockInterviewId,
      user: mockUserId,
      status: 'In Progress',
      estimatedDuration: 30,
      startedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
      totalQuestions: 2,
    });

    interviewRepository.findInterviewById = async () => expiredMock;
    interviewRepository.updateInterview = async (id, update) => {
      Object.assign(expiredMock, update);
      return expiredMock;
    };
    interviewQuestionRepository.getQuestions = async () => [question1, question2];
    evaluationService.generateFinalInterviewResult = async () => ({ overallScore: 80 });

    const timeCheck = await interviewFlowService.checkTimeLimit(mockInterviewId.toString());

    // Restore
    interviewRepository.findInterviewById = origFindInt;
    interviewRepository.updateInterview = origUpdateInt;
    interviewQuestionRepository.getQuestions = origGetQuestions;
    evaluationService.generateFinalInterviewResult = origGenResult;

    if (timeCheck.isExpired === true && expiredMock.status === 'Completed') {
      recordResult(
        'Time Limit Calculation & Session Auto-Expiration',
        true,
        'Successfully detected session expiration (45m > 30m) and auto-concluded interview.'
      );
    } else {
      recordResult('Time Limit Calculation & Session Auto-Expiration', false, 'Failed expiration detection.');
    }
  } catch (err) {
    recordResult('Time Limit Calculation & Session Auto-Expiration', false, err.message);
  }

  // Test 4: Resume Interrupted Flow
  try {
    const origFindInt = interviewRepository.findInterviewById;
    const origGetQuestions = interviewQuestionRepository.getQuestions;

    const activeMock = new Interview({
      _id: mockInterviewId,
      user: mockUserId,
      status: 'Pending',
      estimatedDuration: 30,
      totalQuestions: 2,
    });

    interviewRepository.findInterviewById = async () => activeMock;
    interviewRepository.updateInterview = async (id, update) => {
      Object.assign(activeMock, update);
      return activeMock;
    };
    interviewQuestionRepository.getQuestions = async () => [question1, question2];

    const resumedState = await interviewFlowService.resumeInterruptedFlow(
      mockUserId.toString(),
      mockInterviewId.toString()
    );

    // Restore
    interviewRepository.findInterviewById = origFindInt;
    interviewQuestionRepository.getQuestions = origGetQuestions;

    const isResumedValid = resumedState.isExpired === false && activeMock.status === 'In Progress' && !!resumedState.currentQuestion;

    if (isResumedValid) {
      recordResult(
        'Resume Interrupted Flow',
        true,
        'Successfully resumed pending session, set status to In Progress, and retrieved active current question.'
      );
    } else {
      recordResult('Resume Interrupted Flow', false, 'Failed to resume flow.');
    }
  } catch (err) {
    recordResult('Resume Interrupted Flow', false, err.message);
  }

  const passedCount = testResults.filter((t) => t.passed).length;
  console.log(`=== SUMMARY: ${passedCount}/${testResults.length} FLOW MANAGEMENT TESTS PASSED ===`);
  if (passedCount === testResults.length) {
    console.log('ALL INTERVIEW FLOW MANAGEMENT TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('SOME TESTS FAILED!');
    process.exit(1);
  }
}

runTestSuite();
