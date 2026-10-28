import { requestPasswordReset, completePasswordReset } from '../controllers/password-reset.controller.js';
import { limitEmailAction } from '../middlewares/email-rate-limit.middleware.js';
import { Router } from 'express';

import {
  register,
  login,
  getMe,
  verify,
  resend,
  googleLogin
} from '../controllers/auth.controller.js';

import { validate } from '../middlewares/validation.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { limitLoginAttempts } from '../middlewares/login-rate-limit.middleware.js';

import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleLoginSchema
} from '../validators/auth.validator.js';

const router = Router();

router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

router.post(
  '/register',
  validate(registerSchema),
  limitEmailAction('register'),
  register
);

router.post(
  '/login',
  validate(loginSchema),
  limitLoginAttempts,
  login
);

router.post(
  '/google',
  validate(googleLoginSchema),
  limitLoginAttempts,
  googleLogin
);

router.get(
  '/me',
  authenticate,
  getMe
);

router.post('/verify-email', validate(verifyEmailSchema), limitEmailAction('verify'), verify);
router.post('/resend-verification', validate(resendVerificationSchema), limitEmailAction('resend'), resend);

router.post('/forgot-password', validate(forgotPasswordSchema), limitEmailAction('forgot'), requestPasswordReset);
router.post('/reset-password', validate(resetPasswordSchema), limitEmailAction('reset'), completePasswordReset);

export default router;
