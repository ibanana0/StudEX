import { Router } from 'express';
import { createReport } from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createReport);

export default router;
