import { Router } from 'express';
import { getPendingDrivers, verifyDriver, rejectDriver } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Melindungi seluruh route admin dengan AuthGuard & Role ADMIN
router.use(authenticate, requireRole('ADMIN'));

router.get('/drivers/pending', getPendingDrivers);
router.patch('/drivers/:userId/verify', verifyDriver);
router.delete('/drivers/:userId/reject', rejectDriver);

export default router;
