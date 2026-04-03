import { Router } from 'express';
import { postController } from './post.controller';
import { authMiddleware, optionalAuthMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes (with optional auth for personalized feed)
router.get('/', optionalAuthMiddleware, postController.getPosts);
router.get('/:id', optionalAuthMiddleware, postController.getPostById);
router.get('/:id/likers', postController.getLikers);

// Protected routes
router.post('/', authMiddleware, postController.createPost);
router.delete('/:id', authMiddleware, postController.deletePost);
router.post('/:id/like', authMiddleware, postController.toggleLike);

export const PostRoutes = router;
