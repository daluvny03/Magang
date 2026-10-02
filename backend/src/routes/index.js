import { Router } from 'express';
import healthRoutes from './cek.routes.js';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import userRoutes from './user.routes.js';
import categoryRoutes from './category.routes.js';
import questionRoutes from './question.routes.js';
import excelImportRoutes from './excel-import.routes.js';
import tryoutPackageRoutes from './tryout-packages.routes.js';
import subscriptionTierRoutes
  from './subscription-tier.routes.js';
  import userManagementRoutes
  from './user-management.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use(
  '/users',
  userManagementRoutes
);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/user', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/questions', questionRoutes);
router.use(
  '/questions/import',
  excelImportRoutes
);
router.use('/tryout-packages', tryoutPackageRoutes);
router.use(
  '/subscription-tiers',
  subscriptionTierRoutes
);

export default router;