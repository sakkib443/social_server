import { Router } from 'express';
import multer from 'multer';
import { uploadController } from './upload.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Protected upload route
router.post('/', authMiddleware, upload.single('image'), uploadController.uploadImage);

export const UploadRoutes = router;
