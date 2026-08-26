import interviewRepository from './interview.repository.js';
import interviewQuestionRepository from './interviewQuestion.repository.js';
import interviewResultRepository from './interviewResult.repository.js';
import evaluationService from './evaluation.service.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Interview Flow Management Service
 * Manages interview lifecycle state machine, time limits, question sequence tracking,
 * progress calculations, duplicate submission prevention (idempotency), and session recovery.
 */
class InterviewFlowService {
  /**
   * 1. Check Session Time Limit
   * Computes elapsed time since interview started and auto-concludes session if duration is exceeded.
   *
   * @param {string} interviewId - Interview ObjectId
   * @returns {Promise<{ isExpired: boolean, elapsedMinutes: number, remainingSeconds: number, interview: object }>} Time status object
   */
  async checkTimeLimit(interviewId) {
    const interview = await interviewRepository.findInterviewById(interviewId);
    if (!interview) {
      throw ApiError.notFound(`Interview session ${interviewId} not found`);
    }

    if (interview.status === 'Completed' || interview.status === 'Cancelled') {
      return { isExpired: false, elapsedMinutes: 0, remainingSeconds: 0, interview };
    }

    if (interview.status === 'In Progress' && interview.startedAt) {
      const startTime = new Date(interview.startedAt).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.max(0, Math.floor((now - startTime) / 1000));
      const totalAllowedSeconds = (interview.estimatedDuration || 30) * 60;
      const remainingSeconds = Math.max(0, totalAllowedSeconds - elapsedSeconds);
      const elapsedMinutes = Math.round((elapsedSeconds / 60) * 10) / 10;

      if (remainingSeconds <= 0) {
        logger.info(`Interview session ${interviewId} time limit exceeded. Auto-concluding session.`);
        
        // Auto-conclude expired session and generate final result for answered questions
        const questions = await interviewQuestionRepository.getQuestions(interviewId);
        const hasAnswers = questions.some((q) => q.answer && q.answer.trim().length > 0);
        
        if (hasAnswers) {
          await evaluationService.generateFinalInterviewResult(interviewId);
        }

        const expiredInterview = await interviewRepository.updateInterview(interviewId, {
          status: 'Completed',
          completedAt: new Date(),
        });

        return {
          isExpired: true,
          elapsedMinutes,
          remainingSeconds: 0,
          interview: expiredInterview,
        };
      }

      return {
        isExpired: false,
        elapsedMinutes,
        remainingSeconds,
        interview,
      };
    }

    return {
      isExpired: false,
      elapsedMinutes: 0,
      remainingSeconds: (interview.estimatedDuration || 30) * 60,
      interview,
    };
  }

  /**
   * 2. Track Current Question
   * Identifies the next unanswered active question in the sequence.
   *
   * @param {string} interviewId - Interview ObjectId
   * @returns {Promise<{ currentQuestion: object|null, activeIndex: number, totalQuestions: number }>} Current question tracking payload
   */
  async getCurrentQuestion(interviewId) {
    const questions = await interviewQuestionRepository.getQuestions(interviewId);
    if (!questions || questions.length === 0) {
      return { currentQuestion: null, activeIndex: 0, totalQuestions: 0 };
    }

    const unansweredIndex = questions.findIndex((q) => !q.answer || q.answer.trim().length === 0);
    if (unansweredIndex === -1) {
      return { currentQuestion: null, activeIndex: questions.length, totalQuestions: questions.length };
    }

    return {
      currentQuestion: questions[unansweredIndex],
      activeIndex: unansweredIndex + 1,
      totalQuestions: questions.length,
    };
  }

  /**
   * 3. Track Progress & Lifecycle State
   * Computes complete progress metrics including completion percentage and remaining time.
   *
   * @param {string} interviewId - Interview ObjectId
   * @returns {Promise<{ progressPercentage: number, completedCount: number, totalCount: number, timeState: object, status: string }>} Flow progress state
   */
  async getFlowStatus(interviewId) {
    const timeState = await this.checkTimeLimit(interviewId);
    const { interview } = timeState;

    const questions = await interviewQuestionRepository.getQuestions(interviewId);
    const completedCount = questions.filter((q) => q.answer && q.answer.trim().length > 0).length;
    const totalCount = interview.totalQuestions || questions.length || 1;
    const progressPercentage = Math.round((completedCount / totalCount) * 100);

    const { currentQuestion, activeIndex } = await this.getCurrentQuestion(interviewId);

    return {
      interviewId,
      status: interview.status,
      completedCount,
      totalCount,
      progressPercentage,
      activeIndex,
      currentQuestion,
      timeState,
    };
  }

  /**
   * 4. Submit Answer with Duplicate Submission Prevention (Idempotent Execution)
   * Prevents double-incrementing progress metrics when duplicate answers are submitted.
   *
   * @param {string} userId - Candidate User ID
   * @param {string} interviewId - Interview ID
   * @param {string} questionId - Question ID
   * @param {string} userAnswer - Answer text
   * @returns {Promise<object>} Evaluation result and updated flow progress
   */
  async submitAnswerIdempotent(userId, interviewId, questionId, userAnswer) {
    // Step 1: Check time limit
    const timeState = await this.checkTimeLimit(interviewId);
    if (timeState.isExpired) {
      throw ApiError.badRequest('Interview time limit has expired. Answers can no longer be submitted.');
    }

    const { interview } = timeState;

    if (interview.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('Unauthorized access to this interview session');
    }

    if (interview.status === 'Completed' || interview.status === 'Cancelled') {
      throw ApiError.badRequest(`Cannot submit answer to a ${interview.status.toLowerCase()} interview session`);
    }

    // Step 2: Retrieve Question to check for duplicate submission
    const questionDoc = await interviewQuestionRepository.getQuestionById(questionId);
    if (!questionDoc) {
      throw ApiError.notFound(`Question ${questionId} not found`);
    }

    const isDuplicateSubmission = !!(questionDoc.answer && questionDoc.answer.trim().length > 0);

    // Step 3: Transition session status to In Progress on 1st answer
    if (interview.status === 'Pending') {
      await interviewRepository.updateInterview(interviewId, {
        status: 'In Progress',
        startedAt: interview.startedAt || new Date(),
      });
    }

    // Step 4: Evaluate Answer with Gemini AI
    const evalData = await evaluationService.evaluateQuestionAnswer({
      interviewId,
      questionId,
      userAnswer,
    });

    if (isDuplicateSubmission) {
      logger.warn(`Idempotent re-submission processed for question ${questionId}. Progress count preserved.`);
    }

    // Step 5: Recalculate completion metrics
    const flowStatus = await this.getFlowStatus(interviewId);

    // Step 6: Trigger final summary if all questions answered
    let finalResult = null;
    let isCompleted = false;

    if (flowStatus.completedCount >= flowStatus.totalCount) {
      isCompleted = true;
      finalResult = await evaluationService.generateFinalInterviewResult(interviewId);
    }

    return {
      question: evalData.question,
      evaluation: evalData.evaluation,
      isDuplicateSubmission,
      flowStatus,
      isCompleted,
      result: finalResult,
    };
  }

  /**
   * 5. Resume Interrupted Interview Flow
   * Recovers active session state, checks expiration, and returns remaining unanswered questions.
   *
   * @param {string} userId - Candidate User ID
   * @param {string} interviewId - Interview ObjectId
   * @returns {Promise<object>} Resumed flow state payload
   */
  async resumeInterruptedFlow(userId, interviewId) {
    const timeState = await this.checkTimeLimit(interviewId);
    const { interview, isExpired } = timeState;

    const userIdStr = interview.user._id ? interview.user._id.toString() : interview.user.toString();
    if (userIdStr !== userId.toString()) {
      throw ApiError.forbidden('Unauthorized access to this interview session');
    }

    if (isExpired || interview.status === 'Completed') {
      const result = await interviewResultRepository.getResult(interviewId);
      return {
        isExpired: true,
        interview,
        result,
        message: 'Interview session has ended.',
      };
    }

    if (interview.status === 'Pending') {
      await interviewRepository.updateInterview(interviewId, {
        status: 'In Progress',
        startedAt: new Date(),
      });
    }

    const flowStatus = await this.getFlowStatus(interviewId);
    const questions = await interviewQuestionRepository.getQuestions(interviewId);

    return {
      isExpired: false,
      interview,
      flowStatus,
      questions,
      currentQuestion: flowStatus.currentQuestion,
    };
  }

  /**
   * 6. Finish Interview & Generate Final Summary
   * Formally concludes the session and builds composite InterviewResult report.
   *
   * @param {string} userId - Candidate User ID
   * @param {string} interviewId - Interview ObjectId
   * @param {string} [reason='Completed'] - Completion reason choice ('Completed', 'Cancelled', 'Expired')
   * @returns {Promise<{ interview: object, result: object|null }>} Concluded session & final result report
   */
  async finishSession(userId, interviewId, reason = 'Completed') {
    const interview = await interviewRepository.findInterviewById(interviewId);
    if (!interview) {
      throw ApiError.notFound(`Interview session ${interviewId} not found`);
    }

    if (interview.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('Unauthorized access to this interview session');
    }

    let result = null;
    if (reason === 'Completed' || reason === 'Expired') {
      const questions = await interviewQuestionRepository.getQuestions(interviewId);
      const hasAnswers = questions.some((q) => q.answer && q.answer.trim().length > 0);
      if (hasAnswers) {
        result = await evaluationService.generateFinalInterviewResult(interviewId);
      }
    }

    const updatedInterview = await interviewRepository.updateInterview(interviewId, {
      status: reason,
      completedAt: new Date(),
    });

    logger.info(`Interview session ${interviewId} formally finished with reason "${reason}".`);

    return {
      interview: updatedInterview,
      result,
    };
  }
}

export default new InterviewFlowService();
export { InterviewFlowService };
