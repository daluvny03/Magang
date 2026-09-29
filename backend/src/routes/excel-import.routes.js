import { Router } from 'express';

import {
  previewQuestionImport
} from '../controllers/excel-import.controller.js';

import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { uploadExcel } from '../middlewares/upload.middleware.js';

const router = Router();

router.post(
  '/preview',
  authenticate,
  authorize('admin'),
  uploadExcel.single('file'),
  previewQuestionImport
);

export default router;