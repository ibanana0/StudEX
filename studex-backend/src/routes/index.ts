import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import orderRoutes from './order.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/orders', orderRoutes);

export default router;
