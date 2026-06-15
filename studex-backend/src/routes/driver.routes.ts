import { Router } from 'express';
import { registerDriver, setDriverActive } from '../controllers/driver.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', authenticate, registerDriver);
router.patch('/me/active', authenticate, setDriverActive);

export default router;
