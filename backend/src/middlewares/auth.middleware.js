import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/app-error.js';

export const authenticate = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new AppError(
        'Authentication token is required',
        401,
        'AUTH_TOKEN_REQUIRED'
      );
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AppError(
        'Invalid authorization header',
        401,
        'INVALID_AUTH_HEADER'
      );
    }

    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      role: payload.role
    };

    next();
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
};