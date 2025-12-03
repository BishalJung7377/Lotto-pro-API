import { Router } from 'express';
import {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
} from '../controllers/storeController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All store routes require authentication
router.use(authMiddleware);

router.get('/', getStores);
router.get('/:id', getStoreById);
router.post('/', createStore);
router.put('/:id', updateStore);
router.delete('/:id', deleteStore);

export default router;
