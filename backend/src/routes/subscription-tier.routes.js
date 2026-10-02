import { Router } from 'express';

import {
  getAllSubscriptionTiers
} from '../controllers/subscription-tier.controller.js';

import {
  authenticate
} from '../middlewares/auth.middleware.js';

import {
  authorize
} from '../middlewares/role.middleware.js';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize('admin'),
  getAllSubscriptionTiers
);

export default router;