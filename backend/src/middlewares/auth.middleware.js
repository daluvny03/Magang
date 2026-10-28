import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/app-error.js';
import { findUserForAuthentication } from '../repositories/user.repository.js';

// users.id is PostgreSQL UUID; accept canonical UUIDs without restricting version.
const USER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const authenticate = async (req, res, next) => {
  let payload;
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new AppError(
        'Authentication token is required',
        401,
        'AUTH_TOKEN_REQUIRED'
      );
    }

    const [scheme, token, extra] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token || extra) {
      throw new AppError(
        'Invalid authorization header',
        401,
        'INVALID_AUTH_HEADER'
      );
    }

    payload = verifyAccessToken(token);
    if (typeof payload?.sub !== 'string' || !USER_ID_PATTERN.test(payload.sub) ||
        !['admin', 'user'].includes(payload.role) ||
        (!Number.isSafeInteger(payload.authVersion) ||
          payload.authVersion < 0)) {
      throw new AppError('Invalid token claims', 401, 'INVALID_TOKEN');
    }
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    return next(
      new AppError(
        'Invalid or expired token',
        401,
        'INVALID_TOKEN'
      )
    );
  }
  try {
    const user = await findUserForAuthentication(payload.sub);
    if (!user || user.is_active !== true || user.role !== payload.role ||
        payload.authVersion !== user.auth_version) {
      return next(new AppError('Session is no longer valid', 401, 'SESSION_INVALID'));
    }
    if (user.email_verification_required && !user.email_verified_at) {
      return next(new AppError('Verifikasi email Anda sebelum masuk.', 403, 'EMAIL_NOT_VERIFIED'));
    }
    req.user = { id: user.id, role: user.role };
    return next();
  } catch (error) {
    // Kegagalan database bukan bukti token invalid; jangan memaksa logout.
    return next(error);
  }
};
