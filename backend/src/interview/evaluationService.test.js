import evaluationService from './evaluation.service.js';
import mongoose from 'mongoose';
import Interview from './interview.model.js';
import InterviewQuestion from './interviewQuestion.model.js';
import InterviewResult from './interviewResult.model.js';

console.log('=== INTERVIEWIQ PHASE 7.4 AI ANSWER EVALUATION TEST SUITE ===\n');

async function runTestSuite() {
  const testResults = [];

  const recordResult = (testName, passed, message) => {
    testResults.push({ testName, passed, message });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName}`);
    console.log(`       Details: ${message}\n`);
  };

  // Test 1: Evaluation Metrics Return Structure
  try {
    const evalMetrics = await evaluationService.evaluateAnswerWithGemini({
      question: 'Explain how indexing improves database query performance in MongoDB.',
      userAnswer: 'Indexing creates B-tree data structures that allow MongoDB to quickly locate documents without scanning the entire collection.',
      expectedAnswer: 'Indexes store a small portion of the data set in an easy-to-traverse form (B-tree) to avoid full collection scans.',
      role: 'Backend Engineer',
      interviewType: 'Technical',
      difficulty: 'Intermediate',
    });

    const hasTechnicalScore = typeof evalMetrics.technicalScore === 'number';
    const hasCommunicationScore = typeof evalMetrics.communicationScore === 'number';
    const hasConfidenceScore = typeof evalMetrics.confidenceScore === 'number';
    const hasCompletenessScore = typeof evalMetrics.completenessScore === 'number';
    const hasStrengths = Array.isArray(evalMetrics.strengths);
    const hasWeaknesses = Array.isArray(evalMetrics.weaknesses);
    const hasSuggestions = Array.isArray(evalMetrics.suggestions);
    const hasOverallFeedback = typeof evalMetrics.overallFeedback === 'string';

    const allMetricsPresent =
      hasTechnicalScore &&
      hasCommunicationScore &&
      hasConfidenceScore &&
      hasCompletenessScore &&
      hasStrengths &&
      hasWeaknesses &&
      hasSuggestions &&
      hasOverallFeedback;

    if (allMetricsPresent) {
      recordResult(
        'Evaluation Metrics Return Payload',
        true,
        `Returned Technical (${evalMetrics.technicalScore}), Communication (${evalMetrics.communicationScore}), Confidence (${evalMetrics.confidenceScore}), Completeness (${evalMetrics.completenessScore}) scores, Strengths, Weaknesses, Suggestions, & Overall Feedback.`
      );
    } else {
      recordResult(
        'Evaluation Metrics Return Payload',
        false,
        'Missing one or more required metric fields in evaluation payload.'
      );
    }
  } catch (err) {
    recordResult('Evaluation Metrics Return Payload', false, err.message);
  }

  // Test 2: In-Memory / Simulated Database Answer Evaluation & Incremental Progress
  try {
    const mockUserId = new mongoose.Types.ObjectId();

    // Create mock Interview session document
    const interview = new Interview({
      _id: new mongoose.Types.ObjectId(),
      user: mockUserId,
      role: 'Full Stack Engineer',
      interviewType: 'Technical',
      difficulty: 'Intermediate',
      totalQuestions: 2,
      completedQuestions: 0,
      status: 'Pending',
    });
    interview.save = async function () { return this; };

    const question1 = new InterviewQuestion({
      _id: new mongoose.Types.ObjectId(),
      interview: interview._id,
      question: 'What is the Node.js event loop?',
      expectedAnswer: 'The event loop is a single-threaded loop that delegates async I/O operations to libuv.',
      sequenceNumber: 1,
    });
    question1.save = async function () { return this; };

    const question2 = new InterviewQuestion({
      _id: new mongoose.Types.ObjectId(),
      interview: interview._id,
      question: 'What is JWT authentication?',
      expectedAnswer: 'JSON Web Token is an open standard for securely transmitting information as a JSON object.',
      sequenceNumber: 2,
    });
    question2.save = async function () { return this; };

    // Mock Mongoose model queries
    const originalFindInterview = Interview.findById;
    const originalFindQuestion = InterviewQuestion.findOne;
    const originalCountQuestions = InterviewQuestion.countDocuments;
    const originalFindQuestions = InterviewQuestion.find;
    const originalFindOneResult = InterviewResult.findOneAndUpdate;

    Interview.findById = async (id) => (id.toString() === interview._id.toString() ? interview : null);

    InterviewQuestion.findOne = async (filter) => {
      if (filter._id.toString() === question1._id.toString()) return question1;
      if (filter._id.toString() === question2._id.toString()) return question2;
      return null;
    };

    let answeredCount = 0;
    InterviewQuestion.countDocuments = async () => answeredCount;

    InterviewQuestion.find = () => ({
      sort: () => [question1, question2],
    });

    InterviewResult.findOneAndUpdate = async (filter, updateData) => ({
      _id: new mongoose.Types.ObjectId(),
      ...updateData,
    });

    // Evaluate Question 1
    answeredCount = 1;
    const res1 = await evaluationService.evaluateQuestionAnswer({
      interviewId: interview._id.toString(),
      questionId: question1._id.toString(),
      userAnswer: 'The event loop allows Node.js to handle non-blocking asynchronous operations.',
    });

    const isQuestion1Saved = question1.answer.length > 0 && question1.score > 0 && !!question1.aiFeedback.comments;
    const isProgressUpdated = res1.completedQuestions === 1 && res1.isInterviewCompleted === false;

    // Evaluate Question 2 (Last question -> triggers final result generation)
    answeredCount = 2;
    const res2 = await evaluationService.evaluateQuestionAnswer({
      interviewId: interview._id.toString(),
      questionId: question2._id.toString(),
      userAnswer: 'JWT is a signed token containing claims used for stateless authentication.',
    });

    const isInterviewCompleted = res2.isInterviewCompleted === true && !!res2.result;
    const isFinalScoreValid = res2.result?.overallScore >= 0 && res2.result?.overallScore <= 100;

    // Restore original Mongoose functions
    Interview.findById = originalFindInterview;
    InterviewQuestion.findOne = originalFindQuestion;
    InterviewQuestion.countDocuments = originalCountQuestions;
    InterviewQuestion.find = originalFindQuestions;
    InterviewResult.findOneAndUpdate = originalFindOneResult;

    if (isQuestion1Saved && isProgressUpdated && isInterviewCompleted && isFinalScoreValid) {
      recordResult(
        'Store Evaluation & Final Result Generation on Last Question',
        true,
        `Successfully evaluated Q1 & Q2, incremented completion count, updated status to Completed, and generated final InterviewResult (${res2.result.overallScore}/100).`
      );
    } else {
      recordResult(
        'Store Evaluation & Final Result Generation on Last Question',
        false,
        'Failed to update question scores, completion progress, or final summary result.'
      );
    }
  } catch (err) {
    recordResult('Store Evaluation & Final Result Generation on Last Question', false, err.message);
  }

  const passedCount = testResults.filter((t) => t.passed).length;
  console.log(`=== SUMMARY: ${passedCount}/${testResults.length} EVALUATION TESTS PASSED ===`);
  if (passedCount === testResults.length) {
    console.log('ALL AI ANSWER EVALUATION TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('SOME TESTS FAILED!');
    process.exit(1);
  }
}

runTestSuite();
