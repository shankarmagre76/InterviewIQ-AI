/**
 * InterviewIQ AI - Centralized Environment Configuration System
 * 
 * IMPORTANT SECURITY RULES:
 * Only variables prefixed with VITE_ are exposed to client-side JavaScript.
 * NEVER place backend secrets (MongoDB URI, JWT secret, Gemini API keys, SMTP credentials) in frontend env files.
 */

// Forbidden secret key substrings that must NEVER be in client-side env
const FORBIDDEN_SECRETS = ['MONGO', 'JWT', 'GEMINI', 'CLOUDINARY', 'SMTP', 'SECRET', 'PASSWORD'];

function auditEnvironmentSecrets() {
  if (typeof window !== 'undefined' && import.meta.env) {
    Object.keys(import.meta.env).forEach((key) => {
      const upperKey = key.toUpperCase();
      const containsSecret = FORBIDDEN_SECRETS.some((secret) => upperKey.includes(secret));
      if (containsSecret && !upperKey.includes('VITE_APP_ENV')) {
        console.error(
          `[CRITICAL SECURITY WARNING]: Potential backend secret variable '${key}' detected in client bundle environment! Remove it immediately.`
        );
      }
    });
  }
}

// Perform security check at module initialization
auditEnvironmentSecrets();

const getEnvVar = (key, defaultValue = '') => {
  const value = import.meta.env[key];
  if (!value && import.meta.env.DEV && defaultValue) {
    console.warn(
      `[Env Warning]: Missing environment variable '${key}'. Falling back to default: '${defaultValue}'`
    );
  }
  return value || defaultValue;
};

export const env = {
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:5000/api/v1'),
  APP_NAME: getEnvVar('VITE_APP_NAME', 'InterviewIQ AI'),
  APP_ENV: getEnvVar('VITE_APP_ENV', import.meta.env.MODE || 'development'),
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};

export default env;
