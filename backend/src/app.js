import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import path from 'path';
import { fileURLToPath } from 'url';

import routes from './routes/index.js';
import notFoundHandler from './middleware/notFound.middleware.js';
import errorHandler from './middleware/error.middleware.js';
import { globalRateLimiter } from './middleware/rateLimit.middleware.js';
import requestIdMiddleware from './middleware/requestId.middleware.js';

// Resolve __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Disable Express information disclosure header
app.disable('x-powered-by');

// Attach unique X-Request-ID correlation tracking middleware
app.use(requestIdMiddleware);

// 1. Configure Security HTTP Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for API flexibility while retaining frameguard/nosniff/hsts
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. CORS Configuration (Environment-Based Allowed Origins)
const parseAllowedOrigins = () => {
  const envOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const defaultDevOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];
  return Array.from(new Set([...envOrigins, ...defaultDevOrigins]));
};

const allowedOrigins = parseAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman in dev)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        return callback(null, true);
      }
      return callback(new Error('CORS Policy: Origin not permitted'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Request-ID'],
    optionsSuccessStatus: 200,
  })
);

// 3. Global API Rate Limiting (100 req/15min)
app.use(globalRateLimiter);

// 4. NoSQL Query Injection Defense (Strips $ and . from req.body and req.query)
app.use(mongoSanitize());

// 5. HTTP Parameter Pollution Defense (Prevents array parameter spoofing)
app.use(hpp());

// 6. Request Body Parsers (Strict 1MB limits)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Gzip Compression
app.use(compression());

// HTTP Request Logging (Combined format in Production, Dev format in Development)
if (process.env.NODE_ENV !== 'test') {
  const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
  app.use(morgan(morganFormat));
}

// Serve uploaded static files safely
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API v1 Namespace
app.use('/api/v1', routes);

// Centralized Health Check Endpoints
app.get(['/', '/health', '/api/health', '/api/v1/health'], (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'InterviewIQ AI API is operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    requestId: req.requestId,
  });
});

// Handle Unmatched Routes (HTTP 404)
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
