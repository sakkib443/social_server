import { Request, Response, NextFunction } from 'express';
import { commentService } from './comment.service';
import { createCommentSchema, createReplySchema } from './comment.validation';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { ZodError } from 'zod';

const formatZodError = (error: ZodError) => {
  const issues = error.issues || [];
  return issues.map((err: any) => ({
    field: err.path?.join('.') || '',
    message: err.message,
  }));
};

export const commentController = {
  // POST /api/posts/:postId/comments - Create comment
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const postId = req.params.postId as string;

      const validationResult = createCommentSchema.safeParse({ body: req.body });
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formatZodError(validationResult.error),
        });
      }

      const comment = await commentService.createComment(
        postId,
        userId,
        validationResult.data.body
      );

      return res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: { comment },
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // POST /api/posts/:postId/comments/:commentId/replies - Create reply
  async createReply(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const postId = req.params.postId as string;
      const commentId = req.params.commentId as string;

      const validationResult = createReplySchema.safeParse({ body: req.body });
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formatZodError(validationResult.error),
        });
      }

      const reply = await commentService.createReply(
        postId,
        commentId,
        userId,
        validationResult.data.body
      );

      return res.status(201).json({
        success: true,
        message: 'Reply created successfully',
        data: { reply },
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // GET /api/posts/:postId/comments - Get all comments
  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId || null;
      const postId = req.params.postId as string;

      const comments = await commentService.getPostComments(postId, userId);

      return res.status(200).json({
        success: true,
        message: 'Comments fetched successfully',
        data: { comments },
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // GET /api/posts/:postId/comments/:commentId/replies - Get replies
  async getReplies(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId || null;
      const commentId = req.params.commentId as string;

      const replies = await commentService.getCommentReplies(commentId, userId);

      return res.status(200).json({
        success: true,
        message: 'Replies fetched successfully',
        data: { replies },
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // DELETE /api/posts/:postId/comments/:commentId - Delete comment
  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const commentId = req.params.commentId as string;
      await commentService.deleteComment(commentId, userId);

      return res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // POST /api/posts/:postId/comments/:commentId/like - Toggle like
  async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const commentId = req.params.commentId as string;
      const result = await commentService.toggleLike(commentId, userId);

      return res.status(200).json({
        success: true,
        message: result.liked ? 'Comment liked' : 'Comment unliked',
        data: result,
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // GET /api/posts/:postId/comments/:commentId/likers - Get who liked
  async getLikers(req: Request, res: Response, next: NextFunction) {
    try {
      const commentId = req.params.commentId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await commentService.getLikers(commentId, page, limit);

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
