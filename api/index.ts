import dotenv from 'dotenv';
import path from 'path';

// Load env vars before importing app
dotenv.config({ path: path.join(process.cwd(), '.env') });

import app from '../src/app';

// Export Express app for Vercel serverless
export default app;
