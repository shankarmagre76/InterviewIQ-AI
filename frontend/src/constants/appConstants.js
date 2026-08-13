export const APP_NAME = import.meta.env.VITE_APP_NAME || 'InterviewIQ AI';
export const APP_VERSION = '1.0.0';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: (token) => `/auth/verify-email/${token}`,
    ME: '/auth/me',
  },

  PROFILE: {
    BASE: '/profile',
    COMPLETION: '/profile/completion',
    IMAGE: '/profile/image',
    AVATAR: '/profile/avatar',
    SKILLS: '/profile/skills',
    SKILL_BY_ID: (id) => `/profile/skills/${id}`,
    EDUCATION: '/profile/education',
    EDUCATION_BY_ID: (id) => `/profile/education/${id}`,
    EXPERIENCE: '/profile/experience',
    EXPERIENCE_BY_ID: (id) => `/profile/experience/${id}`,
    PROJECTS: '/profile/projects',
    PROJECT_BY_ID: (id) => `/profile/projects/${id}`,
    CERTIFICATIONS: '/profile/certifications',
    CERTIFICATION_BY_ID: (id) => `/profile/certifications/${id}`,
    SOCIAL_LINKS: '/profile/social-links',
    RESUME: '/profile/resume',
  },

  RESUME: {
    BASE: '/profile/resume',
    HISTORY: '/profile/resume/history',
    BY_ID: (id) => `/profile/resume/${id}`,
    ANALYZE: '/profile/resume/analyze',
    ANALYSIS: '/profile/resume/analysis',
    ANALYSIS_LATEST: '/profile/resume/analysis/latest',
    ANALYSIS_HISTORY: '/profile/resume/analysis/history',
    ANALYSIS_BY_ID: (id) => `/profile/resume/analysis/${id}`,
  },

  COMPANY: {
    BASE: '/companies',
    BY_ID: (id) => `/companies/${id}`,
  },

  JOB: {
    BASE: '/jobs',
    BY_ID: (id) => `/jobs/${id}`,
    APPLICATIONS: (jobId) => `/jobs/${jobId}/applications`,
  },

  APPLICATION: {
    BASE: '/applications',
    ME: '/applications/me',
    BY_ID: (id) => `/applications/${id}`,
    STATUS: (id) => `/applications/${id}/status`,
  },

  SAVED_JOB: {
    BASE: '/saved-jobs',
    BY_ID: (id) => `/saved-jobs/${id}`,
  },

  INTERVIEW: {
    BASE: '/interviews',
    START: '/interviews/start',
    BY_ID: (id) => `/interviews/${id}`,
    QUESTIONS: (id) => `/interviews/${id}/questions`,
    ANSWER: (id) => `/interviews/${id}/answer`,
    COMPLETE: (id) => `/interviews/${id}/complete`,
    FINISH: (id) => `/interviews/${id}/finish`,
    RESULT: (id) => `/interviews/${id}/result`,
  },

  DASHBOARD: {
    BASE: '/dashboard',
    RESUME: '/dashboard/resume',
    INTERVIEWS: '/dashboard/interviews',
    APPLICATIONS: '/dashboard/applications',
    CAREER_READINESS: '/dashboard/career-readiness',
    ACTIVITY: '/dashboard/activity',
  },

  ROADMAP: {
    BASE: '/roadmaps',
    GENERATE: '/roadmaps/generate',
    ACTIVE: '/roadmaps/active',
    BY_ID: (id) => `/roadmaps/${id}`,
    ARCHIVE: (id) => `/roadmaps/${id}/archive`,
    TASKS: (id) => `/roadmaps/${id}/tasks`,
    TASK_BY_ID: (taskId) => `/roadmaps/tasks/${taskId}`,
    TASK_START: (taskId) => `/roadmaps/tasks/${taskId}/start`,
    TASK_COMPLETE: (taskId) => `/roadmaps/tasks/${taskId}/complete`,
    TASK_SKIP: (taskId) => `/roadmaps/tasks/${taskId}/skip`,
    TASK_REOPEN: (taskId) => `/roadmaps/tasks/${taskId}/reopen`,
  },

  NOTIFICATION: {
    BASE: '/notifications',
    UNREAD: '/notifications/unread',
    READ_ALL: '/notifications/read-all',
    MARK_READ: (id) => `/notifications/${id}/read`,
    BY_ID: (id) => `/notifications/${id}`,
  },

  ADMIN: {
    HEALTH: '/admin/health',
    DASHBOARD: '/admin/dashboard',
    NOTIFICATIONS: '/admin/notifications',
    NOTIFICATION_BY_ID: (id) => `/admin/notifications/${id}`,
    ANALYTICS_USERS: '/admin/analytics/users',
    ANALYTICS_JOBS: '/admin/analytics/jobs',
    ANALYTICS_APPLICATIONS: '/admin/analytics/applications',
    ANALYTICS_AI: '/admin/analytics/ai',
    AUDIT_LOGS: '/admin/audit-logs',
    AUDIT_LOG_BY_ID: (id) => `/admin/audit-logs/${id}`,
    USERS: '/admin/users',
    USER_BY_ID: (id) => `/admin/users/${id}`,
    USER_STATUS: (id) => `/admin/users/${id}/status`,
    USER_ROLE: (id) => `/admin/users/${id}/role`,
    COMPANIES: '/admin/companies',
    COMPANY_BY_ID: (id) => `/admin/companies/${id}`,
    COMPANY_STATUS: (id) => `/admin/companies/${id}/status`,
    JOBS: '/admin/jobs',
    JOB_BY_ID: (id) => `/admin/jobs/${id}`,
    JOB_STATUS: (id) => `/admin/jobs/${id}/status`,
    APPLICATIONS: '/admin/applications',
    APPLICATION_STATS: '/admin/applications/statistics',
    APPLICATION_BY_ID: (id) => `/admin/applications/${id}`,
    AI_USAGE: '/admin/ai/usage',
    AI_RESUME_ANALYSIS: '/admin/ai/resume-analysis',
    AI_INTERVIEWS: '/admin/ai/interviews',
    AI_ROADMAPS: '/admin/ai/roadmaps',
  },
};

export const USER_ROLES = {
  STUDENT: 'Student',
  RECRUITER: 'Recruiter',
  ADMIN: 'Admin',
};

export const STATUS_TYPES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};
