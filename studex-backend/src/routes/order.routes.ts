import { Router } from 'express';
import {
  getOrderById,
  createOrder,
  cancelOrder,
  getDriverOrderPool,
  getPoolOrderById,
  claimOrder,
  updateOrderStatus,
  getOrders,
  getActiveOrder,
} from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getOrders);
router.post('/', createOrder);
router.get('/active', getActiveOrder);
router.get('/pool', getDriverOrderPool);
router.get('/pool/:id', getPoolOrderById);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);
router.patch('/:id/claim', claimOrder);
router.patch('/:id/status', updateOrderStatus);

export default router;

