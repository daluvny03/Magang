import { Router } from 'express';

import {
  getAll,
  getById,
  create,
  update,
  remove,
  updateCategories,
  updateQuestions,
  updateSubscriptionTiers,
  publish,
  unpublish
} from '../controllers/tryout-packages.controller.js';

import {
  createPackageSchema,
  updatePackageSchema,
  packageQuerySchema,
  updatePackageCategoriesSchema,
  updatePackageQuestionsSchema,
  updatePackageSubscriptionTiersSchema
} from '../validators/tryout-packages.validator.js';

import { validate } from '../middlewares/validation.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

router.use(
  authenticate,
  authorize('admin')
);

router.get(
  '/',
  validate(packageQuerySchema),
  getAll
);

router.put(
  '/:id/categories',
  authenticate,
  authorize('admin'),
  validate(updatePackageCategoriesSchema),
  updateCategories
);

router.put(
  '/:id/questions',
  authenticate,
  authorize('admin'),
  validate(updatePackageQuestionsSchema),
  updateQuestions
);

router.patch(
  '/:id/publish',
  authenticate,
  authorize('admin'),
  publish
);

router.patch(
  '/:id/unpublish',
  authenticate,
  authorize('admin'),
  unpublish
);

router.put(
  '/:id/subscription-tiers',
  authenticate,
  authorize('admin'),
  validate(
    updatePackageSubscriptionTiersSchema
  ),
  updateSubscriptionTiers
);

router.get(
  '/:id',
  getById
);

router.post(
  '/',
  validate(createPackageSchema),
  create
);

router.put(
  '/:id',
  validate(updatePackageSchema),
  update
);

router.delete(
  '/:id',
  remove
);

export default router;