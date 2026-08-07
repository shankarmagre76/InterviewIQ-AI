import mongoose from 'mongoose';
import interviewRepository from './interview.repository.js';
import interviewQuestionRepository from './interviewQuestion.repository.js';
import interviewResultRepository from './interviewResult.repository.js';
import Interview from './interview.model.js';
import InterviewQuestion from './interviewQuestion.model.js';
import InterviewResult from './interviewResult.model.js';
import User from '../models/User.js';
import Company from '../company/company.model.js';

console.log('=== INTERVIEWIQ REPOSITORY LAYER TEST SUITE ===\n');

async function runTestSuite() {
  const testResults = [];

  const recordResult = (testName, passed, message) => {
    testResults.push({ testName, passed, message });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName}`);
    console.log(`       Details: ${message}\n`);
  };

  // Setup Mongoose In-Memory Stubs
  const mockUserId = new mongoose.Types.ObjectId();
  const mockInterviewId = new mongoose.Types.ObjectId();
  const mockQuestionId1 = new mongoose.Types.ObjectId();
  const mockQuestionId2 = new mongoose.Types.ObjectId();
  const mockResultId = new mongoose.Types.ObjectId();

  const mockInterviewDoc = new Interview({
    _id: mockInterviewId,
    user: mockUserId,
    role: 'Full Stack Engineer',
    interviewType: 'Technical',
    difficulty: 'Intermediate',
    status: 'Pending',
    totalQuestions: 5,
    completedQuestions: 0,
    estimatedDuration: 30,
  });

  const mockQuestion1 = new InterviewQuestion({
    _id: mockQuestionId1,
    interview: mockInterviewId,
    question: 'Explain event loop in Node.js',
    sequenceNumber: 1,
  });

  const mockQuestion2 = new InterviewQuestion({
    _id: mockQuestionId2,
    interview: mockInterviewId,
    question: 'Explain database indexing',
    sequenceNumber: 2,
  });

  const mockResultDoc = new InterviewResult({
    _id: mockResultId,
    interview: mockInterviewId,
    overallScore: 88,
    technicalScore: 90,
    communicationScore: 85,
    hrScore: 88,
    summary: 'Solid performance across technical and communication topics.',
  });

  // Test 1: InterviewRepository - createInterview, findInterview, updateInterview, deleteInterview
  try {
    const origCreate = Interview.create;
    const origFindById = Interview.findById;
    const origFindOne = Interview.findOne;
    const origUpdate = Interview.findByIdAndUpdate;
    const origDelete = Interview.findByIdAndDelete;
    const origFind = Interview.find;

    Interview.create = async (data) => mockInterviewDoc;
    Interview.findById = (id) => ({
      populate: () => mockInterviewDoc,
    });
    Interview.findOne = (query) => ({
      populate: () => mockInterviewDoc,
    });
    Interview.findByIdAndUpdate = async (id, update) => {
      Object.assign(mockInterviewDoc, update);
      return mockInterviewDoc;
    };
    Interview.findByIdAndDelete = async (id) => mockInterviewDoc;
    Interview.find = (query) => ({
      sort: () => ({
        skip: () => ({
          limit: () => ({
            populate: () => [mockInterviewDoc],
          }),
        }),
      }),
    });

    const created = await interviewRepository.createInterview({
      user: mockUserId,
      role: 'Full Stack Engineer',
    });
    const found = await interviewRepository.findInterview(mockInterviewId.toString(), true);
    const updated = await interviewRepository.updateInterview(mockInterviewId.toString(), {
      status: 'In Progress',
    });
    const userInterviews = await interviewRepository.getInterviewsByUser(mockUserId.toString());
    const deleted = await interviewRepository.deleteInterview(mockInterviewId.toString());

    // Restore
    Interview.create = origCreate;
    Interview.findById = origFindById;
    Interview.findOne = origFindOne;
    Interview.findByIdAndUpdate = origUpdate;
    Interview.findByIdAndDelete = origDelete;
    Interview.find = origFind;

    const isCreatedValid = !!created && created._id === mockInterviewId;
    const isFoundValid = !!found && found.role === 'Full Stack Engineer';
    const isUpdatedValid = updated.status === 'In Progress';
    const isListValid = Array.isArray(userInterviews) && userInterviews.length > 0;
    const isDeletedValid = !!deleted;

    if (isCreatedValid && isFoundValid && isUpdatedValid && isListValid && isDeletedValid) {
      recordResult(
        'InterviewRepository CRUD (createInterview, findInterview, updateInterview, deleteInterview)',
        true,
        'All InterviewRepository CRUD methods passed.'
      );
    } else {
      recordResult(
        'InterviewRepository CRUD (createInterview, findInterview, updateInterview, deleteInterview)',
        false,
        'One or more InterviewRepository CRUD operations failed.'
      );
    }
  } catch (err) {
    recordResult('InterviewRepository CRUD', false, err.message);
  }

  // Test 2: InterviewQuestionRepository - saveQuestion, saveAnswer, getQuestions
  try {
    const origCreate = InterviewQuestion.create;
    const origInsertMany = InterviewQuestion.insertMany;
    const origFindByIdAndUpdate = InterviewQuestion.findByIdAndUpdate;
    const origFind = InterviewQuestion.find;
    const origFindById = InterviewQuestion.findById;

    InterviewQuestion.create = async (data) => mockQuestion1;
    InterviewQuestion.insertMany = async (arr) => [mockQuestion1, mockQuestion2];
    InterviewQuestion.findByIdAndUpdate = async (id, update) => {
      if (update.$set) Object.assign(mockQuestion1, update.$set);
      return mockQuestion1;
    };
    InterviewQuestion.find = () => ({
      sort: () => [mockQuestion1, mockQuestion2],
    });
    InterviewQuestion.findById = async (id) => mockQuestion1;

    const savedQ = await interviewQuestionRepository.saveQuestion({
      interview: mockInterviewId,
      question: 'Explain event loop',
    });
    const savedMany = await interviewQuestionRepository.saveManyQuestions([{}, {}]);
    const savedAns = await interviewQuestionRepository.saveAnswer(
      mockQuestionId1.toString(),
      'Event loop handles non-blocking I/O.',
      85,
      { comments: 'Good answer' }
    );
    const questionsList = await interviewQuestionRepository.getQuestions(mockInterviewId.toString());

    // Restore
    InterviewQuestion.create = origCreate;
    InterviewQuestion.insertMany = origInsertMany;
    InterviewQuestion.findByIdAndUpdate = origFindByIdAndUpdate;
    InterviewQuestion.find = origFind;
    InterviewQuestion.findById = origFindById;

    const isSavedValid = !!savedQ && savedQ._id === mockQuestionId1;
    const isManyValid = Array.isArray(savedMany) && savedMany.length === 2;
    const isAnswerSaved = savedAns.answer.includes('non-blocking') && savedAns.score === 85;
    const isQuestionsFetched = Array.isArray(questionsList) && questionsList.length === 2;

    if (isSavedValid && isManyValid && isAnswerSaved && isQuestionsFetched) {
      recordResult(
        'InterviewQuestionRepository CRUD (saveQuestion, saveAnswer, getQuestions)',
        true,
        'All InterviewQuestionRepository methods passed.'
      );
    } else {
      recordResult(
        'InterviewQuestionRepository CRUD (saveQuestion, saveAnswer, getQuestions)',
        false,
        'One or more InterviewQuestionRepository operations failed.'
      );
    }
  } catch (err) {
    recordResult('InterviewQuestionRepository CRUD', false, err.message);
  }

  // Test 3: InterviewResultRepository - saveResult, getResult
  try {
    const origFindOneAndUpdate = InterviewResult.findOneAndUpdate;
    const origFindOne = InterviewResult.findOne;
    const origFindById = InterviewResult.findById;

    InterviewResult.findOneAndUpdate = async (filter, update, opts) => {
      if (update.$set) Object.assign(mockResultDoc, update.$set);
      return mockResultDoc;
    };

    InterviewResult.findOne = (filter) => ({
      populate: () => mockResultDoc,
    });

    InterviewResult.findById = (id) => ({
      populate: () => mockResultDoc,
    });

    const savedRes = await interviewResultRepository.saveResult({
      interview: mockInterviewId.toString(),
      overallScore: 92,
      summary: 'Outstanding performance.',
    });

    const fetchedRes = await interviewResultRepository.getResult(mockInterviewId.toString());

    // Restore
    InterviewResult.findOneAndUpdate = origFindOneAndUpdate;
    InterviewResult.findOne = origFindOne;
    InterviewResult.findById = origFindById;

    const isSaveValid = !!savedRes && savedRes.overallScore === 92;
    const isFetchValid = !!fetchedRes && fetchedRes._id === mockResultId;

    if (isSaveValid && isFetchValid) {
      recordResult(
        'InterviewResultRepository CRUD (saveResult, getResult)',
        true,
        'All InterviewResultRepository methods passed.'
      );
    } else {
      recordResult(
        'InterviewResultRepository CRUD (saveResult, getResult)',
        false,
        'One or more InterviewResultRepository operations failed.'
      );
    }
  } catch (err) {
    recordResult('InterviewResultRepository CRUD', false, err.message);
  }

  const passedCount = testResults.filter((t) => t.passed).length;
  console.log(`=== SUMMARY: ${passedCount}/${testResults.length} REPOSITORY TESTS PASSED ===`);
  if (passedCount === testResults.length) {
    console.log('ALL REPOSITORY LAYER TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('SOME TESTS FAILED!');
    process.exit(1);
  }
}

runTestSuite();
