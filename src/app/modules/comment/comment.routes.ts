import { Router } from 'express';
import { commentController } from './comment.controller';
import { authMiddleware, optionalAuthMiddleware } from '../../middlewares/auth.middleware';

const router = Router({ mergeParams: true }); // mergeParams to access :postId from parent router

// Public routes (with optional auth for like status)
router.get('/', optionalAuthMiddleware, commentController.getComments);
router.get('/:commentId/replies', optionalAuthMiddleware, commentController.getReplies);
router.get('/:commentId/likers', commentController.getLikers);

// Protected routes
router.post('/', authMiddleware, commentController.createComment);
router.delete('/:commentId', authMiddleware, commentController.deleteComment);
router.post('/:commentId/like', authMiddleware, commentController.toggleLike);
router.post('/:commentId/replies', authMiddleware, commentController.createReply);

export const CommentRoutes = router;
