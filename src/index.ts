import mongoose from 'mongoose';
import app from './app';
import config from './app/config';

// Cached connection for serverless
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  
  try {
    if (config.database_url) {
      await mongoose.connect(config.database_url as string, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      console.log('✅ Database connected');
    }
  } catch (error) {
    console.warn('⚠️ Database connection failed');
  }
}

// Connect on cold start
connectDB();

// Export the Express app for Vercel serverless
export default app;
