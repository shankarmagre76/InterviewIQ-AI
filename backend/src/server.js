import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Environment Variables before importing app configs
dotenv.config({ path: path.join(__dirname, '../.env') });

import app from './app.js';
import connectDB from './config/db.js';
import configureCloudinary from './config/cloudinary.js';
import logger from './utils/logger.js';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION! 💥 Shutting down... ${err.name}: ${err.message}`);
  logger.error(err.stack);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

// Initialize Database & Configurations
const startServer = async () => {
  await connectDB();
  configureCloudinary();

  const server = app.listen(PORT, () => {
    logger.info(`🚀 InterviewIQ AI Backend Server listening on port ${PORT} [${process.env.NODE_ENV || 'development'} mode]`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error(`UNHANDLED REJECTION! 💥 Shutting down... ${err.name}: ${err.message}`);
    if (err.stack) logger.error(err.stack);
    server.close(() => {
      process.exit(1);
    });
  });

  // Graceful shutdown handling
  const shutdown = (signal) => {
    logger.info(`Received ${signal}. Gracefully shutting down Express server...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
