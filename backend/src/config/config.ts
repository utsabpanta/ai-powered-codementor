import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  gemini: {
    apiKey: string;
  };
  cors: {
    origin: string | string[];
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
  cors: {
    origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174'],
  },
};

// Validate required environment variables
if (!config.gemini.apiKey) {
  console.warn('Warning: GEMINI_API_KEY is not set. Please set it in your .env file.');
}

export default config;