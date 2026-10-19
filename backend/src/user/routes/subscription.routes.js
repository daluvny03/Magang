import { Router } from 'express';

import {
  getActiveSubscription,
  getAvailableSubscriptionCatalog
} from '../controllers/subscription.controller.js';

const router = Router();

router.get('/catalog', getAvailableSubscriptionCatalog);
router.get('/', getActiveSubscription);

export default router;
