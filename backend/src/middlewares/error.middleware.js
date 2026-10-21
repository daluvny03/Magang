import { randomUUID } from 'node:crypto';
import multer from 'multer';

export const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  const requestId = randomUUID();
  const declaredStatus = error.statusCode ?? error.status;
  const isClientError = Number.isInteger(declaredStatus) && declaredStatus >= 400 && declaredStatus < 500;
  const isUploadError = error instanceof multer.MulterError;
  const statusCode = isUploadError ? 422 : isClientError ? declaredStatus :
    Number.isInteger(declaredStatus) && declaredStatus >= 500 && declaredStatus <= 599
      ? declaredStatus : 500;
  const safeCode = /^[A-Z][A-Z0-9_]{0,79}$/.test(error.code ?? '')
    ? error.code : 'INTERNAL_SERVER_ERROR';

  // Tidak mencetak request body, header, query SQL, atau error object mentah.
  console.error('Request failed', { requestId, statusCode, code: safeCode });
  res.setHeader('X-Request-Id', requestId);
  return res.status(statusCode).json({
    success: false,
    message: isUploadError ? 'Upload failed' :
      statusCode >= 500 ? (statusCode === 503 ? 'Service temporarily unavailable' : 'Internal server error') :
      error.type === 'entity.parse.failed' ? 'Invalid JSON body' :
      error.message || 'Request failed',
    errors: statusCode >= 500 ? [{ code: statusCode === 503 ? 'SERVICE_UNAVAILABLE' : 'INTERNAL_SERVER_ERROR' }] :
      error.type === 'entity.parse.failed' ? [{ code: 'INVALID_JSON' }] :
      Array.isArray(error.errors) && error.errors.length ? error.errors : [{ code: safeCode }],
    requestId,
  });
};

export const errorHandler = errorMiddleware;
