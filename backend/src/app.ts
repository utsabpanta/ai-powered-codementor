import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/config';
import analysisRoutes from './routes/analysisRoutes';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// API routes
app.use('/api/analysis', analysisRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Global error handler
app.use((error: Error, req: Request, res: Response, next: any) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? error.message : 'Something went wrong'
  });
});

export default app;