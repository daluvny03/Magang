export { withTransaction as withVerificationTransaction } from '../utils/transaction.js';

export const lockVerificationUser = async (client, email) => {
  const { rows } = await client.query(
    `SELECT id, email, is_active, email_verified_at, email_verification_required
     FROM public.users WHERE public.normalize_user_email(email) = public.normalize_user_email($1) FOR UPDATE`, [email]);
  return rows[0];
};

export const canIssueVerification = async (client, userId) => {
  const { rows } = await client.query(
    `SELECT 1 FROM public.email_verification_tokens
     WHERE user_id = $1 AND created_at > clock_timestamp() - INTERVAL '60 seconds' LIMIT 1`, [userId]);
  return rows.length === 0;
};

export const saveVerification = async (client, { id, userId, email, hash, outboxId, payload }) => {
  await client.query(`UPDATE public.email_verification_tokens SET revoked_at = clock_timestamp()
    WHERE user_id = $1 AND consumed_at IS NULL AND revoked_at IS NULL`, [userId]);
  await client.query(`UPDATE public.email_outbox SET status = 'cancelled', payload_encrypted = NULL
    WHERE user_id = $1 AND kind = 'email_verification' AND status = 'pending'`, [userId]);
  const { rows } = await client.query(`INSERT INTO public.email_verification_tokens
    (id, user_id, email, token_hash, expires_at)
    VALUES ($1, $2, $3, $4, clock_timestamp() + INTERVAL '24 hours') RETURNING expires_at`,
  [id, userId, email, hash]);
  await client.query(`INSERT INTO public.email_outbox
    (id, user_id, verification_id, kind, payload_encrypted, expires_at)
    VALUES ($1, $2, $3, 'email_verification', $4, $5)`,
  [outboxId, userId, id, payload, rows[0].expires_at]);
};

export const consumeVerification = async (client, hash) => {
  // Match the lock order used by issuance and delivery: user first, then token/outbox.
  const { rows } = await client.query(`SELECT u.id FROM public.users u
    JOIN public.email_verification_tokens t ON t.user_id = u.id
    WHERE t.token_hash = $1 FOR UPDATE OF u`, [hash]);
  if (!rows.length) return false;
  const consumed = await client.query(`UPDATE public.email_verification_tokens t
    SET consumed_at = clock_timestamp() FROM public.users u
    WHERE t.token_hash = $1 AND u.id = t.user_id AND u.is_active = true
      AND u.email = t.email AND t.consumed_at IS NULL AND t.revoked_at IS NULL
      AND t.expires_at > clock_timestamp() RETURNING t.id, t.user_id`, [hash]);
  if (!consumed.rows.length) return false;
  const token = consumed.rows[0];
  await client.query(`UPDATE public.users SET email_verified_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [token.user_id]);
  await client.query(`UPDATE public.email_outbox SET status = 'cancelled', payload_encrypted = NULL
    WHERE verification_id = $1 AND status = 'pending'`, [token.id]);
  return true;
};
