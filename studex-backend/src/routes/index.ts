import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import driverRoutes from './driver.routes';
import orderRoutes from './order.routes';
import ratingRoutes from './rating.routes';
import reportRoutes from './report.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/drivers', driverRoutes);
router.use('/orders', orderRoutes);
router.use('/ratings', ratingRoutes);
router.use('/reports', reportRoutes);

export default router;

