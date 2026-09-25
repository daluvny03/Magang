import { Router } from 'express';

import {
  getAllCategories,
  getCategoryDetail,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';

import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';

import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema
} from '../validators/category.validator.js';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize('admin'),
  validate(categoryQuerySchema),
  getAllCategories
);

router.get(
  '/:id',
  authenticate,
  authorize('admin'),
  getCategoryDetail
);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(createCategorySchema),
  createCategory
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateCategorySchema),
  updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteCategory
);

export default router;