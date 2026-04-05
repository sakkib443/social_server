import { Router } from 'express';
import { storyController } from './story.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', storyController.getStories);
router.post('/', authMiddleware, storyController.createStory);
router.delete('/:id', authMiddleware, storyController.deleteStory);

export const StoryRoutes = router;
