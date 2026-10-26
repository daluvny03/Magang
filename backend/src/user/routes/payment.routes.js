
import { Router } from 'express';

import {
  createCheckout,
  getPaymentDetail
} from '../controllers/payment.controller.js';
import {
  getPaymentHistory,
} from '../controllers/payment-history.controller.js'

const router = Router();

router.post('/checkout', createCheckout);
router.get('/history', getPaymentHistory)
router.get('/:id', getPaymentDetail);

export default router;
