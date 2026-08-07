import interviewRepository from './interview.repository.js';
import interviewQuestionRepository from './interviewQuestion.repository.js';
import interviewResultRepository from './interviewResult.repository.js';
import aiInterviewService from './aiInterview.service.js';
import evaluationService from './evaluation.service.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Interview Service Layer
 * Enforces business logic, session orchestration, progress tracking, resume handling,
 * and AI question/evaluation workflows while calling the Repository Layer for DB operations.
 */
class InterviewService {
  /**
   * 1. Start Interview Session
   * Initializes an interview session, generates custom questions via AI, and saves them to DB.
   *
   * @param {string} userId - Candidate User ObjectId
   * @param {object} interviewData - Configuration payload (role, company, interviewType, difficulty, totalQuestions, mode)
   * @returns {Promise<{ interview: object, questions: Array<object> }>} Session and generated questions
   */
  async startInterview(userId, interviewData = {}) {
    if (!userId) {
      throw ApiError.badRequest('User ID is required to start an interview session');
    }

    const {
      role = 'Software Engineer',
      company,
      interviewType = 'Technical',
      difficulty = 'Intermediate',
      totalQuestions = 5,
      estimatedDuration = 30,
      mode = 'Text',
    } = interviewData;

    // Step 1: Create Interview Session Document in DB
    const interview = await interviewRepository.createInterview({
      user: userId,
      role,
      company: company || null,
      interviewType,
      difficulty,
      status: 'Pending',
      totalQuestions,
      completedQuestions: 0,
      estimatedDuration,
      mode,
    });

    // Step 2: Generate AI Interview Questions
    const generatedQuestions = await this.generateQuestions({
      userId,
      role,
      companyName: company ? 'Company Tailored' : 'General Industry Standard',
      interviewType,
      difficulty,
      totalQuestions,
    });

    // Step 3: Save Questions to DB
    const savedQuestions = await this.saveQuestions(interview._id, generatedQuestions);

    logger.info(
      `Started interview session ${interview._id} for user ${userId} with ${savedQuestions.length} questions.`
    );

    return {
      interview,
      questions: savedQuestions,
    };
  }

  /**
   * 2. Generate Questions
   * Interacts with AI Question Generation module (aiInterview.service.js).
   *
   * @param {object} config - Context payload (userId, role, companyName, interviewType, difficulty, totalQuestions)
   * @returns {Promise<Array<object>>} Generated questions array
   */
  async generateQuestions(config) {
    return await aiInterviewService.generateInterviewQuestions(config);
  }

  /**
   * 3. Save Questions
   * Maps question attributes and saves them to DB via InterviewQuestionRepository.
   *
   * @param {string} interviewId - Interview ObjectId
   * @param {Array<object>} questionsArray - Questions array
   * @param {import('mongoose').ClientSession} [session=null] - Optional transaction session
   * @returns {Promise<Array<object>>} Saved question documents
   */
  async saveQuestions(interviewId, questionsArray, session = null) {
    if (!interviewId) {
      throw ApiError.badRequest('Interview ID is required to save questions');
    }

    const formattedQuestions = questionsArray.map((q, idx) => ({
      interview: interviewId,
      question: q.question,
      expectedAnswer: q.expectedAnswer || '',
      sequenceNumber: q.sequenceNumber || idx + 1,
      score: 0,
      answer: '',
      aiFeedback: {},
    }));

    return await interviewQuestionRepository.saveManyQuestions(formattedQuestions, session);
  }

  /**
   * 4. Receive Answers
   * Receives candidate answer for a question, triggers AI evaluation, updates question record & progress.
   *
   * @param {string} userId - Candidate User ID
   * @param {string} interviewId - Interview Session ID
   * @param {string} questionId - Question ID
   * @param {string} userAnswer - Candidate's text or transcribed answer
   * @returns {Promise<{ question: object, evaluation: object, isCompleted: boolean, result?: object }>} Updated question & evaluation
   */
  async receiveAnswers(userId, interviewId, questionId, userAnswer) {
    const interview = await interviewRepository.findInterviewById(interviewId);
    if (!interview) {
      throw ApiError.notFound(`Interview session ${interviewId} not found`);
    }

    if (interview.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('Unauthorized access to this interview session');
    }

    if (interview.status === 'Completed' || interview.status === 'Cancelled') {
      throw ApiError.badRequest(`Cannot submit answers to a ${interview.status.toLowerCase()} interview session`);
    }

    // Step 1: Evaluate Answer and update Question document
    const evalData = await evaluationService.evaluateQuestionAnswer({
      interviewId,
      questionId,
      userAnswer,
    });

    // Step 2: Update Progress and Status
    const updatedInterview = await this.updateProgress(interviewId);

    // Step 3: Check if Interview is now Completed
    let finalResult = null;
    let isCompleted = false;

    if (updatedInterview.completedQuestions >= updatedInterview.totalQuestions) {
      isCompleted = true;
      finalResult = await this.generateResult(interviewId);
      await this.endInterview(userId, interviewId, 'Completed');
    }

    return {
      question: evalData.question,
      evaluation: evalData.evaluation,
      completedQuestions: updatedInterview.completedQuestions,
      totalQuestions: updatedInterview.totalQuestions,
      isCompleted,
      result: finalResult,
    };
  }

  /**
   * 5. Evaluate Answers
   * Standalone helper calling AI evaluation engine for custom answer scoring.
   *
   * @param {string} questionText - Question text
   * @param {string} userAnswer - Candidate answer
   * @param {string} expectedAnswer - Benchmark reference answer
   * @param {object} [context={}] - Role, interview type, difficulty context
   * @returns {Promise<object>} Evaluation metrics object
   */
  async evaluateAnswers(questionText, userAnswer, expectedAnswer, context = {}) {
    return await evaluationService.evaluateAnswerWithGemini({
      question: questionText,
      userAnswer,
      expectedAnswer,
      role: context.role || 'Software Engineer',
      interviewType: context.interviewType || 'Technical',
      difficulty: context.difficulty || 'Intermediate',
    });
  }

  /**
   * 6. Generate Result
   * Aggregates session scores and creates final InterviewResult document via InterviewResultRepository.
   *
   * @param {string} interviewId - Interview ObjectId
   * @returns {Promise<object>} Final InterviewResult document
   */
  async generateResult(interviewId) {
    const existingResult = await interviewResultRepository.getResult(interviewId);
    if (existingResult) {
      return existingResult;
    }
    return await evaluationService.generateFinalInterviewResult(interviewId);
  }

  /**
   * 7. Update Progress
   * Recalculates answered question count and updates Interview session status.
   *
   * @param {string} interviewId - Interview ObjectId
   * @returns {Promise<object>} Updated Interview document
   */
  async updateProgress(interviewId) {
    const questions = await interviewQuestionRepository.getQuestions(interviewId);
    const completedCount = questions.filter((q) => q.answer && q.answer.trim().length > 0).length;

    const interview = await interviewRepository.findInterviewById(interviewId);
    if (!interview) {
      throw ApiError.notFound(`Interview session ${interviewId} not found`);
    }

    const newStatus =
      completedCount >= interview.totalQuestions
        ? 'Completed'
        : completedCount > 0
        ? 'In Progress'
        : interview.status;

    const updateData = {
      completedQuestions: completedCount,
      status: newStatus,
    };

    if (newStatus === 'In Progress' && !interview.startedAt) {
      updateData.startedAt = new Date();
    } else if (newStatus === 'Completed' && !interview.completedAt) {
      updateData.completedAt = new Date();
    }

    return await interviewRepository.updateInterview(interviewId, updateData);
  }

  /**
   * 8. End Interview
   * Concludes or cancels an active interview session.
   *
   * @param {string} userId - Candidate User ID
   * @param {string} interviewId - Interview ObjectId
   * @param {string} [finalStatus='Completed'] - Final status choice ('Completed' or 'Cancelled')
   * @returns {Promise<{ interview: object, result: object|null }>} Concluded interview and result
   */
  async endInterview(userId, interviewId, finalStatus = 'Completed') {
    const interview = await interviewRepository.findInterviewById(interviewId);
    if (!interview) {
      throw ApiError.notFound(`Interview session ${interviewId} not found`);
    }

    if (interview.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('Unauthorized access to this interview session');
    }

    let result = null;

    if (finalStatus === 'Completed') {
      const questions = await interviewQuestionRepository.getQuestions(interviewId);
      const hasAnswers = questions.some((q) => q.answer && q.answer.trim().length > 0);
      if (hasAnswers) {
        result = await this.generateResult(interviewId);
      }
    }

    const updatedInterview = await interviewRepository.updateInterview(interviewId, {
      status: finalStatus,
      completedAt: new Date(),
    });

    logger.info(`Interview session ${interviewId} ended with status ${finalStatus}.`);

    return {
      interview: updatedInterview,
      result,
    };
  }

  /**
   * 9. Resume Interrupted Interview
   * Recovers an in-progress or interrupted interview, returning answered questions and current active question.
   *
   * @param {string} userId - Candidate User ID
   * @param {string} interviewId - Interview ObjectId
   * @returns {Promise<{ interview: object, questions: Array<object>, currentQuestion: object|null, remainingCount: number }>} Resumed state
   */
  async resumeInterview(userId, interviewId) {
    const interview = await interviewRepository.findInterviewById(interviewId, true);
    if (!interview) {
      throw ApiError.notFound(`Interview session ${interviewId} not found`);
    }

    if (interview.user._id ? interview.user._id.toString() !== userId.toString() : interview.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('Unauthorized access to this interview session');
    }

    if (interview.status === 'Completed' || interview.status === 'Cancelled') {
      throw ApiError.badRequest(`Interview session is already ${interview.status.toLowerCase()}`);
    }

    // Transition Pending interview to In Progress on resume
    if (interview.status === 'Pending') {
      interview.status = 'In Progress';
      interview.startedAt = interview.startedAt || new Date();
      await interview.save();
    }

    const questions = await interviewQuestionRepository.getQuestions(interviewId);
    const unansweredQuestions = questions.filter((q) => !q.answer || q.answer.trim().length === 0);
    const currentQuestion = unansweredQuestions.length > 0 ? unansweredQuestions[0] : null;

    return {
      interview,
      questions,
      currentQuestion,
      remainingCount: unansweredQuestions.length,
    };
  }

  /**
   * Additional Service Helper: Fetch full interview details (session, questions, result).
   *
   * @param {string} userId - Candidate User ID
   * @param {string} interviewId - Interview ObjectId
   * @returns {Promise<{ interview: object, questions: Array<object>, result: object|null }>} Full details payload
   */
  async getInterviewDetails(userId, interviewId) {
    const interview = await interviewRepository.findInterviewById(interviewId, true);
    if (!interview) {
      throw ApiError.notFound(`Interview session ${interviewId} not found`);
    }

    const userIdStr = interview.user._id ? interview.user._id.toString() : interview.user.toString();
    if (userIdStr !== userId.toString()) {
      throw ApiError.forbidden('Unauthorized access to this interview session');
    }

    const questions = await interviewQuestionRepository.getQuestions(interviewId);
    const result = await interviewResultRepository.getResult(interviewId);

    return {
      interview,
      questions,
      result,
    };
  }

  /**
   * Additional Service Helper: Fetch user's interview history.
   *
   * @param {string} userId - Candidate User ID
   * @param {object} [options={}] - Query options
   * @returns {Promise<Array<object>>} User's past interview sessions
   */
  async getUserInterviewHistory(userId, options = {}) {
    return await interviewRepository.getInterviewsByUser(userId, {}, options);
  }
}

export default new InterviewService();
export { InterviewService };
