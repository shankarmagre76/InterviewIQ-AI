import mongoose from 'mongoose';
import logger from '../utils/logger.js';

/**
 * Connect to MongoDB instance using Mongoose.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/interviewiq_db', {
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    logger.info(`MongoDB Connected: ${conn.connection.host} [Database: ${conn.connection.name}]`);
  } catch (error) {
    logger.error(`Database Connection Error: ${error.message}`);
    // In production, failure to connect to database should fail fast
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
