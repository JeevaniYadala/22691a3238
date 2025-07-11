import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import urlRoutes from './routes/urlRoutes';
import { loggingMiddleware, errorLoggingMiddleware } from './middleware/loggingMiddleware';
import Logger from '../../Logging Middleware/logger';

const logger = Logger.getInstance();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(loggingMiddleware);

// Routes
app.use('/', urlRoutes);

// Error handling middleware
app.use(errorLoggingMiddleware);

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong'
  });
});

// 404 handler
app.use('*', async (req, res) => {
  await logger.warn('backend', 'route', `404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not Found',
    message: 'Route not found'
  });
});

app.listen(PORT, async () => {
  await logger.info('backend', 'config', `Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});

export default app;