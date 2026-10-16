import { Router } from 'express';

import {
  getAllQuestions,
  getQuestionDetail,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  updateQuestionStatus
} from '../controllers/question.controller.js';

import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';

import {
  createQuestionSchema,
  updateQuestionSchema,
  questionQuerySchema,
  questionStatusSchema
} from '../validators/question.validator.js';
import {
  questionImageUpload
} from '../middlewares/question-upload.middleware.js';

import {
  parseQuestionForm
} from '../middlewares/parse-question-form.middleware.js';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize('admin'),
  validate(questionQuerySchema),
  getAllQuestions
);

router.get(
  '/:id',
  authenticate,
  authorize('admin'),
  getQuestionDetail
);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  questionImageUpload,
  parseQuestionForm,
  validate(createQuestionSchema),
  createQuestion
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  questionImageUpload,
  parseQuestionForm,
  validate(updateQuestionSchema),
  updateQuestion
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  validate(questionStatusSchema),
  updateQuestionStatus
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteQuestion
);

export default router;
