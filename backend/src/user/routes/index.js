import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

import tryoutRoutes from './tryouts.routes.js';
import profileRoutes from './profile.routes.js';
import subscriptionRoutes from './subscription.routes.js';
import attemptsRoutes from './attempts.routes.js'

const router = Router();

router.use(
  authenticate,
  authorize('user')
);

router.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'User API is accessible',
    data: {
      user: {
        id: req.user.id,
        role: req.user.role
      }
    }
  });
});

router.use('/tryouts', tryoutRoutes);
router.use('/profile', profileRoutes);
router.use('/subscription', subscriptionRoutes);
router.use(
  '/attempts',
  attemptsRoutes
)

export default router;