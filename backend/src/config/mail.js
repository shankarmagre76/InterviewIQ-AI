import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

/**
 * Create and configure Nodemailer transporter.
 */
const createMailTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: user || '',
      pass: pass || '',
    },
  });

  return transporter;
};

/**
 * Helper to send email using configured mail transporter
 * @param {object} options - { to, subject, text, html }
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // Fallback to simulation mode if no credentials are configured in development
  if (!user || !pass) {
    logger.warn(`[EMAIL SIMULATION] Nodemailer credentials missing. Simulating email to: ${to}`);
    logger.info(`Subject: ${subject}`);
    logger.info(`Content: ${text || html}`);
    return { messageId: 'simulated-id' };
  }

  const transporter = createMailTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM || `InterviewIQ AI <${user}>`,
    to,
    subject,
    text,
    html,
  };

  return await transporter.sendMail(mailOptions);
};

export default createMailTransporter;
