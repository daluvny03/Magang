import { pool } from '../config/database.js';
import { queuePasswordChanged } from './password-changed.repository.js';

export const lockResetUser = async (client, email) => {
  const { rows } = await client.query(`SELECT id, email, is_active, auth_version, password IS NOT NULL AS has_password FROM public.users
    WHERE public.normalize_user_email(email) = public.normalize_user_email($1) FOR UPDATE`, [email]);
  return rows[0];
};

export const canIssuePasswordReset = async (client, userId) => {
  const { rows } = await client.query(`SELECT 1 FROM public.password_reset_tokens
    WHERE user_id = $1 AND created_at > clock_timestamp() - INTERVAL '60 seconds' LIMIT 1`, [userId]);
  return rows.length === 0;
};

export const savePasswordReset = async (client, { id, user, hash, outboxId, payload }) => {
  await client.query(`UPDATE public.password_reset_tokens SET revoked_at = clock_timestamp()
    WHERE user_id = $1 AND consumed_at IS NULL AND revoked_at IS NULL`, [user.id]);
  await client.query(`UPDATE public.email_outbox SET status = 'cancelled', payload_encrypted = NULL
    WHERE user_id = $1 AND kind = 'password_reset' AND status = 'pending'`, [user.id]);
  const { rows } = await client.query(`INSERT INTO public.password_reset_tokens
    (id, user_id, email, auth_version, token_hash, expires_at)
    VALUES ($1, $2, $3, $4, $5, clock_timestamp() + INTERVAL '30 minutes') RETURNING expires_at`,
  [id, user.id, user.email, user.auth_version, hash]);
  await client.query(`INSERT INTO public.email_outbox
    (id, user_id, password_reset_id, kind, payload_encrypted, expires_at)
    VALUES ($1, $2, $3, 'password_reset', $4, $5)`, [outboxId, user.id, id, payload, rows[0].expires_at]);
};

// Cheap check before expensive bcrypt. The same conditions are checked under lock below.
export const isPasswordResetUsable = async (hash) => {
  const { rows } = await pool.query(`SELECT 1 FROM public.password_reset_tokens t
    JOIN public.users u ON u.id = t.user_id WHERE t.token_hash = $1
    AND t.consumed_at IS NULL AND t.revoked_at IS NULL AND t.expires_at > clock_timestamp()
    AND u.is_active = true AND u.password IS NOT NULL
    AND u.email = t.email AND u.auth_version = t.auth_version`, [hash]);
  return rows.length > 0;
};

export const consumePasswordReset = async (client, hash, passwordHash) => {
  // Same user-first lock order as issuance, verification and email delivery.
  const locked = await client.query(`SELECT u.id FROM public.users u
    JOIN public.password_reset_tokens t ON t.user_id = u.id WHERE t.token_hash = $1 FOR UPDATE OF u`, [hash]);
  if (!locked.rows.length) return false;
  const { rows } = await client.query(`UPDATE public.password_reset_tokens t SET consumed_at = clock_timestamp()
    FROM public.users u WHERE t.token_hash = $1 AND u.id = t.user_id AND u.is_active = true
    AND u.password IS NOT NULL AND u.email = t.email AND u.auth_version = t.auth_version
    AND t.consumed_at IS NULL AND t.revoked_at IS NULL AND t.expires_at > clock_timestamp()
    RETURNING t.user_id`, [hash]);
  if (!rows.length) return false;
  const userId = rows[0].user_id;
  const updated = await client.query(`UPDATE public.users SET password = $2, auth_version = auth_version + 1,
    updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, email, auth_version`, [userId, passwordHash]);
  await queuePasswordChanged(client, updated.rows[0]);
  await client.query(`UPDATE public.password_reset_tokens SET revoked_at = clock_timestamp()
    WHERE user_id = $1 AND consumed_at IS NULL AND revoked_at IS NULL`, [userId]);
  await client.query(`UPDATE public.email_outbox SET status = 'cancelled', payload_encrypted = NULL
    WHERE user_id = $1 AND kind = 'password_reset' AND status = 'pending'`, [userId]);
  return userId;
};
