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