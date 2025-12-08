import { Router } from 'express';
import {
  getLotteryTypes,
  getStoreInventory,
  getLotteryDetail,
  updateInventory,
} from '../controllers/lotteryController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All lottery routes require authentication
router.use(authMiddleware);

router.get('/types/store/:storeId', getLotteryTypes);
router.get('/store/:storeId/inventory', getStoreInventory);
router.get('/store/:storeId/lottery/:lotteryTypeId', getLotteryDetail);
router.put('/store/:storeId/lottery/:lotteryTypeId', updateInventory);

export default router;
