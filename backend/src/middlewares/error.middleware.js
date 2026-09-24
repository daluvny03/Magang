export const errorMiddleware = (error, req, res, next) => {
  console.error(error);

  return res.status(error.statusCode || 500).json({
    status: 'error',
    message: error.message || 'Internal server error',
    data: null,
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      details: error.details || null
    }
  });
};