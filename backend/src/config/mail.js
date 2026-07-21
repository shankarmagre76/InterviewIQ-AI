import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

/**
 * Create and configure Nodemailer transporter.
 */
const createMailTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    logger.warn('Nodemailer credentials missing. Email delivery features will be disabled.');
  }

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

export default createMailTransporter;
