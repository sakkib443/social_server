import { Request, Response, NextFunction } from 'express';
import { postService } from './post.service';
import { createPostSchema, getPostsSchema } from './post.validation';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { ZodError } from 'zod';

const formatZodError = (error: ZodError) => {
  const issues = error.issues || [];
  return issues.map((err: any) => ({
    field: err.path?.join('.') || '',
    message: err.message,
  }));
};

export const postController = {
  // POST /api/posts - Create a new post
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const validationResult = createPostSchema.safeParse({ body: req.body });
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formatZodError(validationResult.error),
        });
      }

      const post = await postService.createPost(userId, validationResult.data.body);

      return res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: { post },
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // GET /api/posts - Get all posts
  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId || null;

      const validationResult = getPostsSchema.safeParse({ query: req.query });
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formatZodError(validationResult.error),
        });
      }

      const { page, limit } = validationResult.data.query;
      const result = await postService.getPosts(userId, page, limit);

      return res.status(200).json({
        success: true,
        message: 'Posts fetched successfully',
        data: result,
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // GET /api/posts/:id - Get single post
  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId || null;
      const id = req.params.id as string;

      const post = await postService.getPostById(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Post fetched successfully',
        data: { post },
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // DELETE /api/posts/:id - Delete post
  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const id = req.params.id as string;
      await postService.deletePost(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // POST /api/posts/:id/like - Toggle like
  async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const id = req.params.id as string;
      const result = await postService.toggleLike(id, userId);

      return res.status(200).json({
        success: true,
        message: result.liked ? 'Post liked' : 'Post unliked',
        data: result,
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // GET /api/posts/:id/likers - Get who liked
  async getLikers(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await postService.getLikers(id, page, limit);

      return res.status(200).json({
        success: true,
        message: 'Likers fetched successfully',
        data: result,
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  },
};
