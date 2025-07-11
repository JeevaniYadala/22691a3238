import { Request, Response, NextFunction } from 'express';
import Logger from '../../../Logging Middleware/logger';

const logger = Logger.getInstance();

export const loggingMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  await logger.info('backend', 'middleware', `${req.method} ${req.path} - Request started`);

  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - startTime;
    logger.info('backend', 'middleware', `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    return originalJson.call(this, body);
  };

  next();
};

export const errorLoggingMiddleware = async (error: Error, req: Request, res: Response, next: NextFunction) => {
  await logger.error('backend', 'middleware', `Error in ${req.method} ${req.path}: ${error.message}`);
  next(error);
};