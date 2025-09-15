import app from './app';
import config from './config/config';

const startServer = () => {
  try {
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🌐 CORS Origin: ${config.cors.origin}`);
      console.log(`🤖 Gemini API: ${config.gemini.apiKey ? '✅ Configured' : '❌ Not configured'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();