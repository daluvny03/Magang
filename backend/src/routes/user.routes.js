import { Router } from 'express';

import { getUserDashboard } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

router.get(
  '/dashboard',
  authenticate,
  authorize('user'),
  getUserDashboard
);

export default router;