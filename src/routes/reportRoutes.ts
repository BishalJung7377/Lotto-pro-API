import { Router } from 'express';
import {
  getStoreReport,
  getLotteryReport,
  getSalesAnalytics,
} from '../controllers/reportController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All report routes require authentication
router.use(authMiddleware);

router.get('/store/:storeId', getStoreReport);
router.get('/store/:storeId/lottery/:lotteryTypeId', getLotteryReport);
router.get('/store/:storeId/analytics', getSalesAnalytics);

export default router;
