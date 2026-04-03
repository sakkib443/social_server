import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { registerSchema, loginSchema } from '../user/user.validation';
import { ZodError } from 'zod';

// Format Zod errors into readable messages (Zod v4 compatible)
const formatZodError = (error: ZodError) => {
  // Zod v4 uses 'issues' instead of 'errors'
  const issues = error.issues || (error as any).errors || [];
  return issues.map((err: any) => ({
    field: err.path?.join('.') || '',
    message: err.message,
  }));
};

export const authController = {
  // POST /api/auth/register
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate input
      const validationResult = registerSchema.safeParse({ body: req.body });
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formatZodError(validationResult.error),
        });
      }

      const { firstName, lastName, email, password } = validationResult.data.body;
      
      const result = await authService.register({
        firstName,
        lastName,
        email,
        password,
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate input
      const validationResult = loginSchema.safeParse({ body: req.body });
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formatZodError(validationResult.error),
        });
      }

      const { email, password } = validationResult.data.body;
      
      const result = await authService.login({ email, password });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  // GET /api/auth/me
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const user = await authService.getMe(userId);

      return res.status(200).json({
        success: true,
        message: 'User fetched successfully',
        data: { user },
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  // POST /api/auth/google
  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { credential } = req.body;

      if (!credential) {
        return res.status(400).json({
          success: false,
          message: 'Google credential is required',
        });
      }

      const result = await authService.googleLogin(credential);

      return res.status(200).json({
        success: true,
        message: 'Google login successful',
        data: result,
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
};
