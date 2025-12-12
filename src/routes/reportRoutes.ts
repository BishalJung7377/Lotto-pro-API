import { Router } from 'express';
import {
  getStoreReport,
  getLotteryReport,
  getSalesAnalytics,
  getDailySalesReport,
  getMonthlySalesReport,
  getTicketScanLogs,
} from '../controllers/reportController';
import { authMiddleware, storeAccessAuthMiddleware } from '../middleware/auth';

const router = Router();

router.get('/store/:storeId', authMiddleware, getStoreReport);
router.get('/store/:storeId/lottery/:lotteryTypeId', authMiddleware, getLotteryReport);
router.get('/store/:storeId/analytics', authMiddleware, getSalesAnalytics);
router.get('/store/:storeId/daily', storeAccessAuthMiddleware, getDailySalesReport);
router.get('/store/:storeId/monthly', storeAccessAuthMiddleware, getMonthlySalesReport);
router.get('/store/:storeId/scan-logs', storeAccessAuthMiddleware, getTicketScanLogs);

export default router;
