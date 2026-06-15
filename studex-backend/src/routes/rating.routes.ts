import { Router } from 'express';
import { createDriverRating } from '../controllers/rating.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createDriverRating);

export default router;
