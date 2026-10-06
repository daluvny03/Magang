import { Router } from 'express';

import {
  previewQuestionImport,
  importQuestions
} from '../controllers/excel-import.controller.js';

import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { uploadExcel } from '../middlewares/upload.middleware.js';
import {
  questionImportUpload
} from '../middlewares/question-import-upload.middleware.js';

const router = Router();

router.post(
  '/preview',
  authenticate,
  authorize('admin'),
  questionImportUpload,
  previewQuestionImport
);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  questionImportUpload,
  importQuestions
);

export default router;