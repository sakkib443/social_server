import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(process.cwd(), '.env') });

import app from '../src/app';

// Cached MongoDB connection for serverless
let isConnected = false;

async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    try {
      await mongoose.connect(dbUrl, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      console.log('✅ Database connected');
    } catch (error) {
      console.warn('⚠️ Database connection failed');
    }
  }
}

// Connect on cold start
connectDB();

// Export Express app for Vercel
export default app;
