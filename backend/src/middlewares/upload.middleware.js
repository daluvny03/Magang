import multer from 'multer';
import { AppError } from '../utils/app-error.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  const isValidMimeType = allowedMimeTypes.includes(
    file.mimetype
  );

  const isValidExtension = /\.(xlsx|xls)$/i.test(
    file.originalname
  );

  if (!isValidMimeType || !isValidExtension) {
    return cb(
      new AppError(
        'Only Excel files (.xlsx or .xls) are allowed',
        422,
        'INVALID_EXCEL_FILE'
      )
    );
  }

  cb(null, true);
};

export const uploadExcel = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});