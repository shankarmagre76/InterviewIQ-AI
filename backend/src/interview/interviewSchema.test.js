import mongoose from 'mongoose';
import Interview, {
  INTERVIEW_TYPES,
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_STATUSES,
  INTERVIEW_MODES,
} from './interview.model.js';
import InterviewQuestion from './interviewQuestion.model.js';
import InterviewResult from './interviewResult.model.js';

console.log('=== INTERVIEWIQ PHASE 7.1 INTERVIEW SCHEMA TEST SUITE ===\n');

async function runTestSuite() {
  const testResults = [];

  const recordResult = (testName, passed, message) => {
    testResults.push({ testName, passed, message });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName}`);
    console.log(`       Details: ${message}\n`);
  };

  // Test 1: Interview Model Validation & Defaults
  try {
    const mockUser = new mongoose.Types.ObjectId();
    const interviewDoc = new Interview({
      user: mockUser,
      role: 'Full Stack Developer',
    });

    const validationError = interviewDoc.validateSync();
    const isDefaultCorrect =
      interviewDoc.interviewType === 'Technical' &&
      interviewDoc.difficulty === 'Intermediate' &&
      interviewDoc.status === 'Pending' &&
      interviewDoc.totalQuestions === 5 &&
      interviewDoc.completedQuestions === 0 &&
      interviewDoc.estimatedDuration === 30 &&
      interviewDoc.mode === 'Text';

    if (!validationError && isDefaultCorrect) {
      recordResult(
        'Interview Schema Defaults & Validation',
        true,
        'Successfully initialized default values (Technical, Intermediate, Pending, 5 questions, 30 mins)'
      );
    } else {
      recordResult(
        'Interview Schema Defaults & Validation',
        false,
        `Validation error or default mismatch: ${validationError?.message}`
      );
    }
  } catch (err) {
    recordResult('Interview Schema Defaults & Validation', false, err.message);
  }

  // Test 2: Interview Invalid Enum Rejection
  try {
    const mockUser = new mongoose.Types.ObjectId();
    const invalidInterview = new Interview({
      user: mockUser,
      role: 'Backend Engineer',
      interviewType: 'InvalidType',
      difficulty: 'SuperHard',
      status: 'UnknownStatus',
    });

    const validationError = invalidInterview.validateSync();
    if (validationError && validationError.errors) {
      const hasTypeErr = !!validationError.errors.interviewType;
      const hasDiffErr = !!validationError.errors.difficulty;
      const hasStatusErr = !!validationError.errors.status;
      recordResult(
        'Interview Enum Validation Rejection',
        hasTypeErr && hasDiffErr && hasStatusErr,
        'Successfully rejected invalid enum values for type, difficulty, and status'
      );
    } else {
      recordResult('Interview Enum Validation Rejection', false, 'Failed to catch invalid enum values');
    }
  } catch (err) {
    recordResult('Interview Enum Validation Rejection', false, err.message);
  }

  // Test 3: InterviewQuestion Model Validation & Sequence Number
  try {
    const mockInterviewId = new mongoose.Types.ObjectId();
    const questionDoc = new InterviewQuestion({
      interview: mockInterviewId,
      question: 'Explain event loop in Node.js',
      sequenceNumber: 1,
      expectedAnswer: 'The event loop is a single-threaded loop...',
    });

    const validationError = questionDoc.validateSync();
    if (!validationError) {
      recordResult(
        'InterviewQuestion Schema Validation',
        true,
        'Successfully validated question with parent reference and sequence number'
      );
    } else {
      recordResult('InterviewQuestion Schema Validation', false, validationError.message);
    }
  } catch (err) {
    recordResult('InterviewQuestion Schema Validation', false, err.message);
  }

  // Test 4: InterviewQuestion Voice Scalability Fields
  try {
    const mockInterviewId = new mongoose.Types.ObjectId();
    const voiceQuestionDoc = new InterviewQuestion({
      interview: mockInterviewId,
      question: 'Describe REST vs GraphQL',
      sequenceNumber: 2,
      audioResponse: {
        userAudioUrl: 'https://cloudinary.com/audio/answer.mp3',
        questionAudioUrl: 'https://cloudinary.com/audio/question.mp3',
        durationSeconds: 45,
        transcript: 'REST uses standard HTTP methods...',
        speechMetrics: {
          wpm: 140,
          fillerWordsCount: 2,
          confidenceScore: 92,
          pauseDurationSeconds: 1.5,
        },
      },
    });

    const validationError = voiceQuestionDoc.validateSync();
    if (
      !validationError &&
      voiceQuestionDoc.audioResponse.speechMetrics.wpm === 140 &&
      voiceQuestionDoc.audioResponse.speechMetrics.confidenceScore === 92
    ) {
      recordResult(
        'InterviewQuestion Voice Scalability Schema',
        true,
        'Successfully stored and validated audio response subdocument & speech metrics'
      );
    } else {
      recordResult(
        'InterviewQuestion Voice Scalability Schema',
        false,
        validationError?.message || 'Voice metrics default check failed'
      );
    }
  } catch (err) {
    recordResult('InterviewQuestion Voice Scalability Schema', false, err.message);
  }

  // Test 5: InterviewResult Model Validation & References
  try {
    const mockInterviewId = new mongoose.Types.ObjectId();
    const resultDoc = new InterviewResult({
      interview: mockInterviewId,
      overallScore: 88,
      technicalScore: 90,
      communicationScore: 85,
      hrScore: 88,
      strengths: ['Great technical depth', 'Clear voice articulation'],
      weaknesses: ['Could elaborate more on system architecture'],
      recommendations: ['Practice distributed caching concepts'],
      summary: 'Overall strong performance across technical and behavioral questions.',
    });

    const validationError = resultDoc.validateSync();
    if (!validationError) {
      recordResult(
        'InterviewResult Schema Validation',
        true,
        'Successfully validated overall score, category breakdown, strengths, weaknesses, and summary'
      );
    } else {
      recordResult('InterviewResult Schema Validation', false, validationError.message);
    }
  } catch (err) {
    recordResult('InterviewResult Schema Validation', false, err.message);
  }

  const passedCount = testResults.filter((t) => t.passed).length;
  console.log(`=== SUMMARY: ${passedCount}/${testResults.length} TESTS PASSED ===`);
  if (passedCount === testResults.length) {
    console.log('ALL SCHEMA TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('SOME TESTS FAILED!');
    process.exit(1);
  }
}

runTestSuite();
