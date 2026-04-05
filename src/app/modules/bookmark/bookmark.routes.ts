import { Router } from 'express';
import { bookmarkController } from './bookmark.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', bookmarkController.getBookmarks);
router.post('/:postId', bookmarkController.toggleBookmark);

export const BookmarkRoutes = router;
