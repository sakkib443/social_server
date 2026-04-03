import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT || 5000,
  node_env: process.env.NODE_ENV || 'development',
  database_url: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expires_in: process.env.JWT_EXPIRES_IN || '7d',
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  client_url: process.env.CLIENT_URL || 'http://localhost:3000',
  google: {
    client_id: process.env.GOOGLE_CLIENT_ID || '',
  },
};
