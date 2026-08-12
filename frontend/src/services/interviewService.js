import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

export const interviewService = {
  async startInterview(config) {
    const response = await api.post(API_ENDPOINTS.INTERVIEW.START, config);
    return response.data;
  },

  async getInterviewHistory(params = {}) {
    const response = await api.get(API_ENDPOINTS.INTERVIEW.BASE, { params });
    return response.data;
  },

  async getInterviewDetails(id) {
    const response = await api.get(API_ENDPOINTS.INTERVIEW.BY_ID(id));
    return response.data;
  },

  async endInterview(id) {
    const response = await api.delete(API_ENDPOINTS.INTERVIEW.BY_ID(id));
    return response.data;
  },

  async getQuestions(id) {
    const response = await api.get(API_ENDPOINTS.INTERVIEW.QUESTIONS(id));
    return response.data;
  },

  async submitAnswer(id, answerData) {
    const response = await api.post(API_ENDPOINTS.INTERVIEW.ANSWER(id), answerData);
    return response.data;
  },

  async finishInterview(id) {
    const response = await api.post(API_ENDPOINTS.INTERVIEW.FINISH(id));
    return response.data;
  },

  async getInterviewResult(id) {
    const response = await api.get(API_ENDPOINTS.INTERVIEW.RESULT(id));
    return response.data;
  },
};

export default interviewService;
