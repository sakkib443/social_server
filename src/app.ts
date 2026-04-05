import cors, { CorsOptions } from 'cors';
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

// Route imports
import { AuthRoutes } from './app/modules/auth/auth.routes';
import { PostRoutes } from './app/modules/post/post.routes';
import { CommentRoutes } from './app/modules/comment/comment.routes';
import { UploadRoutes } from './app/modules/upload/upload.routes';

const app: Application = express();

// ✅ Database connection middleware (ensures DB is connected before handling requests)
let dbConnected = false;
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (!dbConnected && mongoose.connection.readyState !== 1) {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      try {
        await mongoose.connect(dbUrl);
        dbConnected = true;
        console.log('✅ Database connected via middleware');
      } catch (error: any) {
        console.error('❌ DB connection failed:', error.message);
        return res.status(500).json({ success: false, message: 'Database connection failed' });
      }
    }
  }
  next();
});

// ✅ Security: Helmet (HTTP headers)
app.use(helmet());

// ✅ Security: CORS
const corsOptions: CorsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.CLIENT_URL || '',
  ].filter(Boolean),
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// ✅ Security: Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Auth routes - stricter rate limit
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 auth requests per windowMs
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});
app.use('/api/auth/', authLimiter);

// ✅ Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// ✅ API Routes
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to SocialVillage API',
    version: '1.0.0',
  });
});

// Routes
app.use('/api/auth', AuthRoutes);
app.use('/api/posts', PostRoutes);
app.use('/api/posts/:postId/comments', CommentRoutes);
app.use('/api/upload', UploadRoutes);

// ✅ 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// ✅ Global Error Handler (must have 4 params for Express to recognize as error handler)
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
