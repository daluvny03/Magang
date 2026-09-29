export const errorMiddleware = (error, req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;

  // Cek apakah array errors ada dan berisi item
  const errors = (error.errors && error.errors.length > 0)
    ? error.errors
    : [{ code: error.code || 'INTERNAL_SERVER_ERROR' }];

  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    errors
  });
};
import multer from 'multer';

export const errorHandler = (
  error,
  req,
  res,
  next
) => {
  if (error instanceof multer.MulterError) {
    return res.status(422).json({
      success: false,
      message: 'Excel upload failed',
      errors: [
        {
          field: 'file',
          message: error.message
        }
      ]
    });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors || []
    });
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};