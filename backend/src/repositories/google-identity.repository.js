import { pool } from '../config/database.js';

const PROVIDER = 'google';

export const findGoogleIdentity = async (
  providerSubject,
  client = pool
) => {
  const { rows } = await client.query(
    `
      SELECT
        id,
        user_id,
        provider,
        provider_subject,
        created_at
      FROM user_auth_identities
      WHERE provider = $1
        AND provider_subject = $2
      LIMIT 1
    `,
    [PROVIDER, providerSubject]
  );

  return rows[0] || null;
};

export const findGoogleIdentityByUserId = async (
  userId,
  client = pool
) => {
  const { rows } = await client.query(
    `
      SELECT
        id,
        user_id,
        provider,
        provider_subject,
        created_at
      FROM user_auth_identities
      WHERE user_id = $1
        AND provider = $2
      LIMIT 1
    `,
    [userId, PROVIDER]
  );

  return rows[0] || null;
};

export const createGoogleIdentity = async (
  { userId, providerSubject },
  client = pool
) => {
  const { rows } = await client.query(
    `
      INSERT INTO user_auth_identities (
        user_id,
        provider,
        provider_subject
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        user_id,
        provider,
        provider_subject,
        created_at
    `,
    [userId, PROVIDER, providerSubject]
  );

  return rows[0];
};