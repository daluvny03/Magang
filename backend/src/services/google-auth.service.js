import { normalizeEmail } from '../utils/email.js';
import { createUserModel } from '../models/user.model.js';
import { OAuth2Client } from 'google-auth-library';

import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';
import { pool } from '../config/database.js';

import {
  findGoogleIdentity,
  createGoogleIdentity
} from '../repositories/google-identity.repository.js';

import { createUser } from '../repositories/user.repository.js';
import { generateAccessToken } from '../utils/jwt.js';

const googleClient = new OAuth2Client();

export const verifyGoogleCredential = async (credential) => {
  if (!env.google.clientId) {
    throw new AppError(
      'Google authentication is unavailable',
      503,
      'GOOGLE_AUTH_UNAVAILABLE'
    );
  }

  if (
    typeof credential !== 'string' ||
    !credential.trim() ||
    credential.length > 8192
  ) {
    throw new AppError(
      'Invalid Google credential',
      401,
      'INVALID_GOOGLE_CREDENTIAL'
    );
  }

  let payload;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.google.clientId
    });

    payload = ticket.getPayload();
  } catch {
    throw new AppError(
      'Invalid or expired Google credential',
      401,
      'INVALID_GOOGLE_CREDENTIAL'
    );
  }

  if (
    !payload ||
    typeof payload.sub !== 'string' ||
    !payload.sub ||
    !/^[0-9]+$/.test(payload.sub) ||
    typeof payload.email !== 'string' ||
    !payload.email ||
    payload.email_verified !== true
  ) {
    throw new AppError(
      'Google account identity could not be verified',
      401,
      'GOOGLE_IDENTITY_INVALID'
    );
  }

  const email = normalizeEmail(payload.email);

  if (!email || email.length > 255) {
    throw new AppError(
      'Google account email is invalid',
      401,
      'GOOGLE_IDENTITY_INVALID'
    );
  }

  const name =
    typeof payload.name === 'string' && payload.name.trim()
      ? payload.name.trim().slice(0, 100)
      : email.split('@')[0].slice(0, 100);

  return {
    providerSubject: payload.sub,
    email,
    name,
    emailVerified: true,
    emailAuthorityConfirmed:
      email.endsWith('@gmail.com') ||
      (
        typeof payload.hd === 'string' &&
        payload.hd.length > 0
      )
  };
};

export const loginOrRegisterWithGoogle = async (credential) => {
  const googleUser = await verifyGoogleCredential(credential);

  const client = await pool.connect();
  let transactionActive = false;

  try {
    await client.query('BEGIN');
    transactionActive = true;

    const identity = await findGoogleIdentity(
      googleUser.providerSubject,
      client
    );

    let user;

    if (identity) {
      const { rows } = await client.query(
        `
          SELECT
            id,
            name,
            email,
            role,
            is_active,
            email_verified_at,
            email_verification_required,
            auth_version,
            created_at,
            updated_at
          FROM users
          WHERE id = $1
          FOR UPDATE
        `,
        [identity.user_id]
      );

      user = rows[0];

      if (!user || user.is_active !== true) {
        throw new AppError(
          'Account is unavailable',
          403,
          'ACCOUNT_UNAVAILABLE'
        );
      }

      if (
        user.email_verification_required &&
        !user.email_verified_at
      ) {
        throw new AppError(
          'Email verification is required',
          403,
          'EMAIL_NOT_VERIFIED'
        );
      }
    } else {
      if (!googleUser.emailAuthorityConfirmed) {
        throw new AppError(
          'Additional email verification is required',
          403,
          'GOOGLE_EMAIL_VERIFICATION_REQUIRED'
        );
      }

      // Jangan menggabungkan akun hanya karena email sama.
      const { rows: existingUsers } = await client.query(
        `
          SELECT id
          FROM users
          WHERE public.normalize_user_email(email) = public.normalize_user_email($1)
          LIMIT 1
        `,
        [googleUser.email]
      );

      if (existingUsers.length > 0) {
        throw new AppError(
          'This email is already associated with an account',
          409,
          'GOOGLE_ACCOUNT_LINK_REQUIRED'
        );
      }

      const newUser = await createUser(
        {
          name: googleUser.name,
          email: googleUser.email,
          passwordHash: null,
          role: 'user',
          emailVerifiedAt: new Date()
        },
        client
      );

      await createGoogleIdentity(
        {
          userId: newUser.id,
          providerSubject: googleUser.providerSubject
        },
        client
      );

      const { rows } = await client.query(
        `
          SELECT
            id,
            name,
            email,
            role,
            is_active,
            email_verified_at,
            email_verification_required,
            auth_version,
            created_at,
            updated_at
          FROM users
          WHERE id = $1
          FOR UPDATE
        `,
        [newUser.id]
      );

      user = rows[0];
    }

    if (!user) {
      throw new AppError(
        'Account is unavailable',
        403,
        'ACCOUNT_UNAVAILABLE'
      );
    }

    const safeUser = createUserModel({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });

    const accessToken = generateAccessToken(user);

    await client.query('COMMIT');
    transactionActive = false;

    return {
      user: safeUser,
      accessToken
    };
  } catch (error) {
    if (transactionActive) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error(
          'Google authentication rollback failed:',
          rollbackError
        );
      }
    }

    if (error.code === '23505') {
      throw new AppError(
        'Google account registration conflict',
        409,
        'GOOGLE_REGISTRATION_CONFLICT'
      );
    }

    throw error;
  } finally {
    client.release();
  }
};
