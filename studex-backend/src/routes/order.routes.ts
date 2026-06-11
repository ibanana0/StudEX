import { Router } from 'express';
import { getOrderById, createOrder, cancelOrder } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createOrder);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);

export default router;
