import { Router } from 'express';
import { 
  getOrderById, 
  createOrder, 
  cancelOrder,
  getDriverOrderPool,
  claimOrder,
  updateOrderStatus
} from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createOrder);
router.get('/pool', getDriverOrderPool);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);
router.patch('/:id/claim', claimOrder);
router.patch('/:id/status', updateOrderStatus);

export default router;
