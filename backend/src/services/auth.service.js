import { isUserEmailConflict } from '../utils/email.js';
import { withVerificationTransaction } from '../repositories/email-verification.repository.js';
import { queueVerification } from './email-verification.service.js';
import { getEmailConfig } from '../email/email-config.js';
import bcrypt from 'bcryptjs';

import {
  createUser,
  findUserByEmail,
  findUserById
} from '../repositories/user.repository.js';

import { generateAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/app-error.js';

export const registerUser = async ({
  name,
  email,
  password
}) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError(
      'Email is already registered',
      409,
      'EMAIL_ALREADY_REGISTERED'
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  getEmailConfig();
  try {
    return await withVerificationTransaction(async (client) => {
      const user = await createUser({ name, email, passwordHash, role: 'user' }, client);
      await queueVerification(client, user);
      return user;
    });
  } catch (error) {
    if (isUserEmailConflict(error)) {
      throw new AppError('Email is already registered', 409, 'EMAIL_ALREADY_REGISTERED');
    }
    throw error;
  }
};

export const loginUser = async ({
  email,
  password
}) => {
  const user = await findUserByEmail(email);

  if (!user || user.is_active !== true || typeof user.password !== 'string' || !user.password) {
    throw new AppError(
      'Invalid email or password',
      401,
      'INVALID_CREDENTIALS'
    );
  }

  const passwordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordValid) {
    throw new AppError(
      'Invalid email or password',
      401,
      'INVALID_CREDENTIALS'
    );
  }

  if (user.email_verification_required && !user.email_verified_at) {
    throw new AppError('Verifikasi email Anda sebelum masuk.', 403, 'EMAIL_NOT_VERIFIED');
  }

  const accessToken = generateAccessToken(user);

  const safeUser = await findUserById(user.id);

  return {
    user: safeUser,
    accessToken
  };
};
