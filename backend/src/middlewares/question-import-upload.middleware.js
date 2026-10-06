import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp');
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    cb(
      null,
      `${crypto.randomUUID()}${extension}`
    );
  }
});

const fileFilter = (req, file, cb) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (extension !== '.zip') {
    return cb(
      new Error(
        'Only ZIP files are allowed'
      )
    );
  }

  cb(null, true);
};

export const questionImportUpload =
  multer({
    storage,

    limits: {
      fileSize: 50 * 1024 * 1024,
      files: 1
    },

    fileFilter
  }).single('file');