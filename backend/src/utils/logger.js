/**
 * Production-ready logger utility with levels and ISO timestamp tags.
 */
const levels = {
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
  debug: 'DEBUG',
};

const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${levels[level] || 'INFO'}] ${message}`;
};

const logger = {
  info: (message) => {
    console.log(`\x1b[36m${formatMessage('info', message)}\x1b[0m`);
  },
  warn: (message) => {
    console.warn(`\x1b[33m${formatMessage('warn', message)}\x1b[0m`);
  },
  error: (message) => {
    console.error(`\x1b[31m${formatMessage('error', message)}\x1b[0m`);
  },
  debug: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\x1b[35m${formatMessage('debug', message)}\x1b[0m`);
    }
  },
};

export default logger;
