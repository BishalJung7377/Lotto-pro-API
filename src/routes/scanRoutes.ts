import { Router } from 'express';
import { scanTicket, getScanHistory } from '../controllers/scanController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All scan routes require authentication
router.use(authMiddleware);

router.post('/ticket', scanTicket);
router.get('/history/:storeId', getScanHistory);

export default router;
