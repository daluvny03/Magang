import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/questions');
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    ).toLowerCase();

    const filename = `${crypto.randomUUID()}${extension}`;

    cb(null, filename);
  }
});

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        'Only JPG, PNG, and WEBP images are allowed'
      )
    );
  }

  cb(null, true);
};

export const questionUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 6
  },
  fileFilter
});

export const questionImageUpload =
  questionUpload.fields([
    {
      name: 'questionImage',
      maxCount: 1
    },
    {
      name: 'optionImageA',
      maxCount: 1
    },
    {
      name: 'optionImageB',
      maxCount: 1
    },
    {
      name: 'optionImageC',
      maxCount: 1
    },
    {
      name: 'optionImageD',
      maxCount: 1
    },
    {
      name: 'optionImageE',
      maxCount: 1
    }
  ]);