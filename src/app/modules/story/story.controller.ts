import { Request, Response, NextFunction } from 'express';
import { storyService } from './story.service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const storyController = {
  async createStory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const { imageUrl, content } = req.body;
      if (!imageUrl) return res.status(400).json({ success: false, message: 'Image is required' });
      const story = await storyService.createStory(userId, { imageUrl, content });
      return res.status(201).json({ success: true, message: 'Story created', data: { story } });
    } catch (error: any) {
      if (error.status) return res.status(error.status).json({ success: false, message: error.message });
      next(error);
    }
  },

  async getStories(req: Request, res: Response, next: NextFunction) {
    try {
      const stories = await storyService.getStories();
      return res.status(200).json({ success: true, message: 'Stories', data: { stories } });
    } catch (error: any) {
      next(error);
    }
  },

  async deleteStory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const { id } = req.params as any;
      await storyService.deleteStory(id as string, userId);
      return res.status(200).json({ success: true, message: 'Story deleted' });
    } catch (error: any) {
      if (error.status) return res.status(error.status).json({ success: false, message: error.message });
      next(error);
    }
  },
};
