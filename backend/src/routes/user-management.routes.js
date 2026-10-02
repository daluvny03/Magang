import { Router } from 'express';

import {
  getAll,
  getById
} from '../controllers/user.controller.js';

import {
  authenticate
} from '../middlewares/auth.middleware.js';

import {
  authorize
} from '../middlewares/role.middleware.js';

import {
  validateQuery
} from '../middlewares/validation.middleware.js';

import {
  userQuerySchema
} from '../validators/user.validator.js';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize('admin'),
  validateQuery(userQuerySchema),
  getAll
);

router.get(
  '/:id',
  authenticate,
  authorize('admin'),
  getById
);

export default router;