import { v4 as uuidv4 } from 'uuid';

/**
 * Request Correlation ID Middleware
 * Generates or propagates a unique X-Request-ID header for every incoming HTTP request.
 * Attaches requestId to req and sets X-Request-ID response header for end-to-end telemetry.
 */
export const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || req.headers['x-correlation-id'] || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

export default requestIdMiddleware;
