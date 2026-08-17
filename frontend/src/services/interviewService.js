import { api } from './api.js';
import { API_ENDPOINTS } from '../constants/appConstants.js';

/**
 * Interview Service
 * Provides centralized API interaction for AI-powered interview sessions,
 * candidate response submission, evaluation reports, and interview history.
 */
export const interviewService = {
  /**
   * 1. Create / Start a new AI Interview session and generate custom questions.
   * @param {Object} config - Session setup config
   * @param {string} [config.role] - Job role (e.g. 'Software Engineer')
   * @param {string} [config.company] - Company ObjectId (optional)
   * @param {string} [config.interviewType] - 'Technical' | 'HR' | 'Behavioral' | 'Mixed'
   * @param {string} [config.difficulty] - 'Beginner' | 'Intermediate' | 'Advanced'
   * @param {number} [config.totalQuestions] - Question count (1-50, default 5)
   * @param {number} [config.estimatedDuration] - Duration in minutes (1-180)
   * @param {string} [config.mode] - 'Text' | 'Voice' | 'Video'
   * @returns {Promise<Object>} Response payload { success, statusCode, message, data: { interview, questions } }
   */
  async startInterview(config = {}) {
    const response = await api.post(API_ENDPOINTS.INTERVIEW.START, config);
    return response.data;
  },

  /**
   * Alias for startInterview to support createInterview interface.
   * @param {Object} config - Session setup config
   */
  async createInterview(config = {}) {
    return this.startInterview(config);
  },

  /**
   * 2. Get candidate's past interview session history with pagination & filters.
   * @param {Object} [params={}] - Query options { page, limit, status, interviewType, difficulty, search }
   * @returns {Promise<Object>} Response payload { success, statusCode, message, data: Array<Object> }
   */
  async getInterviewHistory(params = {}) {
    const response = await api.get(API_ENDPOINTS.INTERVIEW.BASE, { params });
    return response.data;
  },

  /**
   * Alias for getInterviewHistory to support getInterviews interface.
   * @param {Object} [params={}] - Query parameters
   */
  async getInterviews(params = {}) {
    return this.getInterviewHistory(params);
  },

  /**
   * 3. Get full details of a specific interview session (session metadata, questions, evaluation result).
   * @param {string} id - Interview ObjectId
   * @returns {Promise<Object>} Response payload { success, statusCode, message, data: { interview, questions, result } }
   */
  async getInterviewDetails(id) {
    const response = await api.get(API_ENDPOINTS.INTERVIEW.BY_ID(id));
    return response.data;
  },

  /**
   * Alias for getInterviewDetails.
   * @param {string} id - Interview ObjectId
   */
  async getInterview(id) {
    return this.getInterviewDetails(id);
  },

  /**
   * Alias for getInterviewDetails.
   * @param {string} id - Interview ObjectId
   */
  async getInterviewById(id) {
    return this.getInterviewDetails(id);
  },

  /**
   * 4. Resume an in-progress or interrupted interview session.
   * @param {string} id - Interview ObjectId
   * @returns {Promise<Object>} Response payload { success, statusCode, message, data: { interview, questions, currentQuestion, remainingCount } }
   */
  async resumeInterview(id) {
    const response = await api.post(API_ENDPOINTS.INTERVIEW.RESUME(id));
    return response.data;
  },

  /**
   * 5. Get active questions list for an interview session.
   * @param {string} id - Interview ObjectId
   * @returns {Promise<Object>} Response payload { success, statusCode, message, data: Array<Object> }
   */
  async getQuestions(id) {
    const response = await api.get(API_ENDPOINTS.INTERVIEW.QUESTIONS(id));
    return response.data;
  },

  /**
   * 6. Get the current active/unanswered question in an interview session.
   * @param {string} id - Interview ObjectId
   * @returns {Promise<Object|null>} Current active question object or response payload
   */
  async getCurrentQuestion(id) {
    const resumedState = await this.resumeInterview(id);
    if (resumedState?.data?.currentQuestion) {
      return resumedState.data.currentQuestion;
    }
    const questionsRes = await this.getQuestions(id);
    const questionsList = Array.isArray(questionsRes?.data) ? questionsRes.data : [];
    const unanswered = questionsList.find((q) => !q.answer || q.answer.trim().length === 0);
    return unanswered || questionsList[0] || null;
  },

  /**
   * 7. Submit candidate answer for evaluation by Gemini AI.
   * Supports two parameter formats:
   *   - submitAnswer(id, { questionId, answer })
   *   - submitAnswer(id, questionId, answerText)
   * @param {string} id - Interview ObjectId
   * @param {Object|string} questionIdOrData - Question ObjectId or answer payload object
   * @param {string} [answerText] - Candidate answer text if questionId was passed as 2nd arg
   * @returns {Promise<Object>} Response payload { success, statusCode, message, data: { question, evaluation, completedQuestions, totalQuestions, isCompleted, result } }
   */
  async submitAnswer(id, questionIdOrData, answerText) {
    let payload = {};

    if (typeof questionIdOrData === 'object' && questionIdOrData !== null) {
      payload = {
        questionId: questionIdOrData.questionId || questionIdOrData._id,
        answer: questionIdOrData.answer || questionIdOrData.userAnswer || '',
        userAnswer: questionIdOrData.answer || questionIdOrData.userAnswer || '',
      };
    } else {
      payload = {
        questionId: questionIdOrData,
        answer: answerText || '',
        userAnswer: answerText || '',
      };
    }

    const response = await api.post(API_ENDPOINTS.INTERVIEW.ANSWER(id), payload);
    return response.data;
  },

  /**
   * 8. Fetch next question in sequence after submitting an answer.
   * @param {string} id - Interview ObjectId
   * @returns {Promise<Object|null>} Next question document or null if all completed
   */
  async getNextQuestion(id) {
    return this.getCurrentQuestion(id);
  },

  /**
   * 9. End / Complete an active interview session and trigger final evaluation report.
   * @param {string} id - Interview ObjectId
   * @param {Object} [statusData={ status: 'Completed' }] - Completion payload
   * @returns {Promise<Object>} Response payload { success, statusCode, message, data: { interview, result } }
   */
  async completeInterview(id, statusData = { status: 'Completed' }) {
    const response = await api.post(API_ENDPOINTS.INTERVIEW.COMPLETE(id), statusData);
    return response.data;
  },

  /**
   * Alias for completeInterview.
   * @param {string} id - Interview ObjectId
   */
  async finishInterview(id) {
    const response = await api.post(API_ENDPOINTS.INTERVIEW.FINISH(id));
    return response.data;
  },

  /**
   * 10. Fetch interview evaluation result report.
   * @param {string} id - Interview ObjectId
   * @returns {Promise<Object>} Response payload { success, statusCode, message, data: Object }
   */
  async getInterviewResult(id) {
    const response = await api.get(API_ENDPOINTS.INTERVIEW.RESULT(id));
    return response.data;
  },

  /**
   * 11. Delete / cancel an interview session.
   * @param {string} id - Interview ObjectId
   * @param {Object} [cancelData={ status: 'Cancelled' }] - Cancellation status data
   * @returns {Promise<Object>} Response payload { success, statusCode, message, data: { interview, result } }
   */
  async deleteInterview(id, cancelData = { status: 'Cancelled' }) {
    const response = await api.delete(API_ENDPOINTS.INTERVIEW.BY_ID(id), { data: cancelData });
    return response.data;
  },

  /**
   * Alias for deleteInterview.
   * @param {string} id - Interview ObjectId
   */
  async cancelInterview(id) {
    return this.deleteInterview(id, { status: 'Cancelled' });
  },

  /**
   * Alias for deleteInterview / endInterview.
   * @param {string} id - Interview ObjectId
   * @param {Object} [statusData] - Status payload
   */
  async endInterview(id, statusData) {
    return this.deleteInterview(id, statusData);
  },
};

export default interviewService;
