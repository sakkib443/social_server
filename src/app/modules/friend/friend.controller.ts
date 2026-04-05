import { Request, Response, NextFunction } from 'express';
import { friendService } from './friend.service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const friendController = {
  async sendRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const { userId: targetId } = req.params as any;
      const result = await friendService.sendRequest(userId, targetId as string);
      return res.status(201).json({ success: true, message: 'Friend request sent', data: result });
    } catch (error: any) {
      if (error.status) return res.status(error.status).json({ success: false, message: error.message });
      next(error);
    }
  },

  async acceptRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const { requestId } = req.params as any;
      const result = await friendService.acceptRequest(requestId as string, userId);
      return res.status(200).json({ success: true, message: 'Friend request accepted', data: result });
    } catch (error: any) {
      if (error.status) return res.status(error.status).json({ success: false, message: error.message });
      next(error);
    }
  },

  async rejectRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const { requestId } = req.params as any;
      const result = await friendService.rejectRequest(requestId as string, userId);
      return res.status(200).json({ success: true, message: 'Friend request rejected', data: result });
    } catch (error: any) {
      if (error.status) return res.status(error.status).json({ success: false, message: error.message });
      next(error);
    }
  },

  async getPendingRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const requests = await friendService.getPendingRequests(userId);
      return res.status(200).json({ success: true, message: 'Pending requests', data: { requests } });
    } catch (error: any) {
      next(error);
    }
  },

  async getSentRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const requests = await friendService.getSentRequests(userId);
      return res.status(200).json({ success: true, message: 'Sent requests', data: { requests } });
    } catch (error: any) {
      next(error);
    }
  },

  async cancelRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const { requestId } = req.params as any;
      await friendService.cancelRequest(requestId as string, userId);
      return res.status(200).json({ success: true, message: 'Request cancelled' });
    } catch (error: any) {
      if (error.status) return res.status(error.status).json({ success: false, message: error.message });
      next(error);
    }
  },

  async getFriends(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const friends = await friendService.getFriends(userId);
      return res.status(200).json({ success: true, message: 'Friends list', data: { friends } });
    } catch (error: any) {
      next(error);
    }
  },

  async getSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const suggestions = await friendService.getSuggestions(userId);
      return res.status(200).json({ success: true, message: 'Suggestions', data: { suggestions } });
    } catch (error: any) {
      next(error);
    }
  },

  async removeFriend(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const { friendId } = req.params as any;
      await friendService.removeFriend(userId, friendId as string);
      return res.status(200).json({ success: true, message: 'Friend removed' });
    } catch (error: any) {
      if (error.status) return res.status(error.status).json({ success: false, message: error.message });
      next(error);
    }
  },
};
