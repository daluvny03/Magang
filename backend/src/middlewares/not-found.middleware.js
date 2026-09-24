export const notFoundMiddleware = (req, res) => {
  return res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    data: null,
    error: {
      code: 'ROUTE_NOT_FOUND',
      details: null
    }
  });
};