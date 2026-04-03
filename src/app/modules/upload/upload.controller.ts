import { Request, Response, NextFunction } from 'express';
import { uploadService } from './upload.service';
import { AuthRequest } from '../../middlewares/auth.middleware';

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadController = {
  // POST /api/upload - Upload image
  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP',
        });
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 5MB limit',
        });
      }

      const result = await uploadService.uploadImage(file);

      return res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
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
