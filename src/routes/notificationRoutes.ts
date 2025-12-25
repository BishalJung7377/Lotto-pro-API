import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middleware/auth';
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '../controllers/notificationController';

const router = Router();

router.get('/notifications', authMiddleware, asyncHandler(getNotificationSettings));
router.put('/notifications', authMiddleware, asyncHandler(updateNotificationSettings));

export default router;
