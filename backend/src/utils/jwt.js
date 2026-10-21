import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    env.jwt.accessSecret,
    {
      expiresIn: env.jwt.accessExpiresIn,
      algorithm: 'HS256'
    }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwt.accessSecret, { algorithms: ['HS256'] });
};
