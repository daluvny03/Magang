import { Router } from 'express';

import {
  getActiveSubscription
} from '../controllers/subscription.controller.js';

const router = Router();

router.get('/', getActiveSubscription);

export default router;