/**
 * Application Constant Definitions
 */
export const USER_ROLES = {
  STUDENT: 'Student',
  RECRUITER: 'Recruiter',
  ADMIN: 'Admin',
  // Backward compatibility aliases
  CANDIDATE: 'Student',
  INTERVIEWER: 'Recruiter',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const INTERVIEW_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

export const INTERVIEW_CATEGORIES = [
  'Frontend Engineering',
  'Backend Engineering',
  'Fullstack Engineering',
  'System Design',
  'Data Structures & Algorithms',
  'DevOps & Cloud Architecture',
  'Product Management',
  'Behavioral & Soft Skills',
];
