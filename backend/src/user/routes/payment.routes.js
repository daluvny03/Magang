
import { Router } from 'express';

import {
  createCheckout,
  getPaymentDetail
} from '../controllers/payment.controller.js';

const router = Router();

router.post('/checkout', createCheckout);

router.get('/:id', getPaymentDetail);

export default router;
