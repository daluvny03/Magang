import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

router.get(
  '/dashboard',
  authenticate,
  authorize('user'),
);

export default router;