
import { Router } from 'express';

import {
  getSubscriptionTiers,
  getSubscriptionTierDetail,
  createSubscriptionTier,
  editSubscriptionTier,
  changeSubscriptionTierStatus
} from '../controllers/admin-subscription.controller.js';

import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

// Semua endpoint hanya dapat diakses Admin.
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', getSubscriptionTiers);

router.get('/:id', getSubscriptionTierDetail);

router.post('/', createSubscriptionTier);

router.patch('/:id', editSubscriptionTier);

router.patch(
  '/:id/status',
  changeSubscriptionTierStatus
);

export default router;
