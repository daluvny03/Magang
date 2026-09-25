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

  const user = await createUser({
    name,
    email,
    passwordHash,
    role: 'user'
  });

  return user;
};

export const loginUser = async ({
  email,
  password
}) => {
  const user = await findUserByEmail(email);

  if (!user) {
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

  const accessToken = generateAccessToken(user);

  const safeUser = await findUserById(user.id);

  return {
    user: safeUser,
    accessToken
  };
};