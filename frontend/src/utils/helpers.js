export const parseApiError = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.';

  // 1. Network / Server Offline Errors
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return 'Unable to connect to authentication server. Please check your internet connection.';
  }

  const status = error.response?.status;
  const data = error.response?.data;

  // 2. Express-validator or Array Error Format
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const firstErr = data.errors[0];
    return firstErr.msg || firstErr.message || 'Validation error. Please check your inputs.';
  }

  // 3. Backend Error Message Parsing
  if (data?.message && typeof data.message === 'string') {
    const msg = data.message;
    // Filter out raw stack traces or internal server error strings
    if (
      msg.includes('CastError') ||
      msg.includes('MongoError') ||
      msg.includes('ValidationError:') ||
      msg.includes('SyntaxError') ||
      msg.includes('at ')
    ) {
      return 'Invalid request data provided. Please check your inputs.';
    }
    return msg;
  }

  // 4. Standard HTTP Status Fallbacks
  if (status === 401) {
    return 'Session expired or unauthorized. Please log in again.';
  }
  if (status === 403) {
    return 'Access denied. You do not have permission to perform this action.';
  }
  if (status === 404) {
    return 'The requested resource or document was not found.';
  }
  if (status === 409) {
    return 'A conflict occurred with this resource. Please refresh and try again.';
  }
  if (status === 413) {
    return 'File size exceeds maximum allowed limit of 5MB. Please upload a smaller PDF file.';
  }
  if (status === 422) {
    return 'Unprocessable PDF document. Please ensure your PDF contains extractable text.';
  }
  if (status === 429) {
    return 'AI service rate limit reached. Please wait a few moments before trying again.';
  }
  if (status >= 500) {
    return 'Server or AI service error. Please try again later.';
  }

  if (error.message && typeof error.message === 'string' && !error.message.includes('Request failed with status code')) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Format ISO date string into human readable format (e.g., "Aug 15, 2026")
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  },
};
