import { Router } from 'express';
import {
  superAdminLogin,
  getSuperAdminProfile,
  updateSuperAdminProfile,
} from '../controllers/superAdminController';
import {
  createLotteryMaster,
  getLotteryMasters,
  assignLotteryToSuperAdmin,
  removeLotteryAssignment,
  updateLotteryStatus,
  deleteLotteryMaster,
} from '../controllers/lotteryMasterController';
import { asyncHandler } from '../utils/asyncHandler';
import { superAdminAuthMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', asyncHandler(superAdminLogin));
router.get(
  '/profile',
  superAdminAuthMiddleware,
  asyncHandler(getSuperAdminProfile)
);
router.put(
  '/profile',
  superAdminAuthMiddleware,
  asyncHandler(updateSuperAdminProfile)
);

router.post(
  '/lotteries',
  superAdminAuthMiddleware,
  asyncHandler(createLotteryMaster)
);

router.get(
  '/lotteries',
  superAdminAuthMiddleware,
  asyncHandler(getLotteryMasters)
);

router.post(
  '/lotteries/:lotteryId/assign',
  superAdminAuthMiddleware,
  asyncHandler(assignLotteryToSuperAdmin)
);

router.delete(
  '/lotteries/:lotteryId/assign',
  superAdminAuthMiddleware,
  asyncHandler(removeLotteryAssignment)
);

router.patch(
  '/lotteries/:lotteryId/status',
  superAdminAuthMiddleware,
  asyncHandler(updateLotteryStatus)
);

router.delete(
  '/lotteries/:lotteryId',
  superAdminAuthMiddleware,
  asyncHandler(deleteLotteryMaster)
);

export default router;
