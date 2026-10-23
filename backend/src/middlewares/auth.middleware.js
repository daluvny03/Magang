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
        !['admin', 'user'].includes(payload.role)) {
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
    if (!user || user.is_active !== true || user.role !== payload.role) {
      return next(new AppError('Session is no longer valid', 401, 'SESSION_INVALID'));
    }
    req.user = { id: user.id, role: user.role };
    return next();
  } catch (error) {
    // Kegagalan database bukan bukti token invalid; jangan memaksa logout.
    return next(error);
  }
};
