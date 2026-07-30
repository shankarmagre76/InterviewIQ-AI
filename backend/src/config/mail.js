import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

/**
 * Check if SMTP credentials are empty or known placeholder strings.
 * @param {string} user
 * @param {string} pass
 * @returns {boolean}
 */
export const isDummyCredential = (user, pass) => {
  if (!user || !pass) return true;
  
  const dummyUsernames = [
    'noreply@interviewiq.ai',
    'your_email_user@example.com',
    'your_email@gmail.com',
    'your_gmail_username',
    'user@example.com',
  ];
  
  const dummyPasswords = [
    'sample_app_password',
    'your_email_app_password',
    'your_app_password',
    'your_gmail_app_password',
    'password',
  ];

  return (
    dummyUsernames.includes(user.toLowerCase()) ||
    dummyPasswords.includes(pass.toLowerCase()) ||
    user.includes('example.com')
  );
};

/**
 * Create and configure Nodemailer transporter.
 */
const createMailTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const service = process.env.EMAIL_SERVICE;

  // Use service if specified, otherwise configure host, port & TLS options
  const transportConfig = service
    ? {
        service,
        auth: {
          user: user || '',
          pass: pass || '',
        },
      }
    : {
        host,
        port,
        secure: process.env.EMAIL_SECURE === 'true' || port === 465,
        auth: {
          user: user || '',
          pass: pass || '',
        },
        tls: {
          rejectUnauthorized: false,
        },
      };

  return nodemailer.createTransport(transportConfig);
};

/**
 * Verify SMTP Connection with host
 * @returns {Promise<boolean>}
 */
export const verifyMailConnection = async () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (isDummyCredential(user, pass)) {
    logger.warn('[Nodemailer] Simulated/dummy credentials detected. Real SMTP sending disabled.');
    return false;
  }

  try {
    const transporter = createMailTransporter();
    await transporter.verify();
    logger.info('[Nodemailer] SMTP Mail connection verified successfully.');
    return true;
  } catch (error) {
    logger.error(`[Nodemailer Verification Error]: ${error.message}`);
    return false;
  }
};

/**
 * Helper to send email using configured mail transporter
 * Handles console fallback in development mode if credentials are missing or SMTP fails.
 * 
 * @param {object} options - { to, subject, text, html, resetToken, resetUrl }
 */
export const sendEmail = async ({ to, subject, text, html, resetToken, resetUrl }) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const isDev = process.env.NODE_ENV !== 'production';

  // 1. Check if SMTP credentials are missing or default placeholders
  if (isDummyCredential(user, pass)) {
    if (isDev) {
      logger.warn(`[EMAIL SIMULATION - DEV MODE] SMTP credentials missing or dummy. Email to: ${to}`);
      logger.info(`Subject: ${subject}`);
      if (resetUrl) {
        logger.info(`[DEV FALLBACK RESET URL]: ${resetUrl}`);
      }
      if (resetToken) {
        logger.info(`[DEV FALLBACK RESET TOKEN]: ${resetToken}`);
      }
      return { messageId: 'simulated-id', simulated: true };
    } else {
      throw new Error('SMTP credentials missing or misconfigured in production environment.');
    }
  }

  // 2. Attempt delivery via Nodemailer
  const transporter = createMailTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM || `InterviewIQ AI <${user}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`[Nodemailer] Email sent successfully to ${to} (MessageId: ${info.messageId})`);
    return info;
  } catch (error) {
    logger.error(`[Nodemailer Error] Failed to send email to ${to}: Code [${error.code || error.responseCode || 'N/A'}] - ${error.message}`);

    // In development mode, if SMTP delivery fails (e.g. invalid credentials or blocked port), fall back to console logging
    if (isDev) {
      logger.warn(`[DEV FALLBACK ACTIVE] SMTP delivery failed. Falling back to console logging.`);
      if (resetUrl) {
        logger.info(`[DEV FALLBACK RESET URL]: ${resetUrl}`);
      }
      if (resetToken) {
        logger.info(`[DEV FALLBACK RESET TOKEN]: ${resetToken}`);
      }
      return { messageId: 'simulated-fallback-id', simulated: true, error: error.message };
    }

    throw error;
  }
};

export default createMailTransporter;
