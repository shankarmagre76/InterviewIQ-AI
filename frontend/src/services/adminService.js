import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

export const adminService = {
  // System Health & Dashboard
  async getHealth() {
    const response = await api.get(API_ENDPOINTS.ADMIN.HEALTH);
    return response.data;
  },

  async getDashboardOverview() {
    const response = await api.get(API_ENDPOINTS.ADMIN.DASHBOARD);
    return response.data;
  },

  // User Management
  async listUsers(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN.USERS, { params });
    return response.data;
  },

  async getUserById(id) {
    const response = await api.get(API_ENDPOINTS.ADMIN.USER_BY_ID(id));
    return response.data;
  },

  async updateUserStatus(id, statusData) {
    const response = await api.patch(API_ENDPOINTS.ADMIN.USER_STATUS(id), statusData);
    return response.data;
  },

  async updateUserRole(id, roleData) {
    const response = await api.patch(API_ENDPOINTS.ADMIN.USER_ROLE(id), roleData);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(API_ENDPOINTS.ADMIN.USER_BY_ID(id));
    return response.data;
  },

  // Company Management
  async listCompanies(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN.COMPANIES, { params });
    return response.data;
  },

  async createCompany(companyData) {
    const response = await api.post(API_ENDPOINTS.ADMIN.COMPANIES, companyData);
    return response.data;
  },

  async getCompanyById(id) {
    const response = await api.get(API_ENDPOINTS.ADMIN.COMPANY_BY_ID(id));
    return response.data;
  },

  async updateCompany(id, companyData) {
    const response = await api.put(API_ENDPOINTS.ADMIN.COMPANY_BY_ID(id), companyData);
    return response.data;
  },

  async updateCompanyStatus(id, statusData) {
    const response = await api.patch(API_ENDPOINTS.ADMIN.COMPANY_STATUS(id), statusData);
    return response.data;
  },

  async deleteCompany(id) {
    const response = await api.delete(API_ENDPOINTS.ADMIN.COMPANY_BY_ID(id));
    return response.data;
  },

  // Job Management
  async listJobs(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN.JOBS, { params });
    return response.data;
  },

  async createJob(jobData) {
    const response = await api.post(API_ENDPOINTS.ADMIN.JOBS, jobData);
    return response.data;
  },

  async getJobById(id) {
    const response = await api.get(API_ENDPOINTS.ADMIN.JOB_BY_ID(id));
    return response.data;
  },

  async updateJob(id, jobData) {
    const response = await api.put(API_ENDPOINTS.ADMIN.JOB_BY_ID(id), jobData);
    return response.data;
  },

  async updateJobStatus(id, statusData) {
    const response = await api.patch(API_ENDPOINTS.ADMIN.JOB_STATUS(id), statusData);
    return response.data;
  },

  async deleteJob(id) {
    const response = await api.delete(API_ENDPOINTS.ADMIN.JOB_BY_ID(id));
    return response.data;
  },

  // Application Monitoring
  async listApplications(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN.APPLICATIONS, { params });
    return response.data;
  },

  async getApplicationStats(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN.APPLICATION_STATS, { params });
    return response.data;
  },

  async getApplicationById(id) {
    const response = await api.get(API_ENDPOINTS.ADMIN.APPLICATION_BY_ID(id));
    return response.data;
  },

  // AI Usage & Telemetry
  async getOverallAiUsage(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN.AI_USAGE, { params });
    return response.data;
  },

  async getResumeAnalysisAiUsage(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN.AI_RESUME_ANALYSIS, { params });
    return response.data;
  },

  async getInterviewAiUsage(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN.AI_INTERVIEWS, { params });
    return response.data;
  },

  async getRoadmapAiUsage(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN.AI_ROADMAPS, { params });
    return response.data;
  },

  // Analytics
  async getUserAnalytics(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN.ANALYTICS_USERS, { params });
    return response.data;
  },

  async getJobAnalytics(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN.ANALYTICS_JOBS, { params });
    return response.data;
  },

  async getApplicationAnalytics(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN.ANALYTICS_APPLICATIONS, { params });
    return response.data;
  },

  async getAiAnalytics(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN.ANALYTICS_AI, { params });
    return response.data;
  },

  // Audit Logs
  async listAuditLogs(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN.AUDIT_LOGS, { params });
    return response.data;
  },

  async getAuditLogById(id) {
    const response = await api.get(API_ENDPOINTS.ADMIN.AUDIT_LOG_BY_ID(id));
    return response.data;
  },

  // Announcements & System Notifications
  async sendAnnouncement(announcementData) {
    const response = await api.post(API_ENDPOINTS.ADMIN.NOTIFICATIONS, announcementData);
    return response.data;
  },

  async listSentNotifications(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN.NOTIFICATIONS, { params });
    return response.data;
  },

  async getNotificationById(id) {
    const response = await api.get(API_ENDPOINTS.ADMIN.NOTIFICATION_BY_ID(id));
    return response.data;
  },

  async deleteNotification(id) {
    const response = await api.delete(API_ENDPOINTS.ADMIN.NOTIFICATION_BY_ID(id));
    return response.data;
  },
};

export default adminService;
