import { Router } from 'express';
import { registerDriver } from '../controllers/driver.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', authenticate, registerDriver);

export default router;
