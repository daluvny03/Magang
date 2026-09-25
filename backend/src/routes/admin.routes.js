import { Router } from 'express';

import { getAdminDashboard } from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

router.get(
  '/dashboard',
  authenticate,
  authorize('admin'),
  getAdminDashboard
);

export default router;