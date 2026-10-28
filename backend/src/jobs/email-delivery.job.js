import { isExpiryNotificationObsolete } from '../repositories/subscription-expiry.repository.js';
import { pool } from '../config/database.js';
import { getEmailConfig } from '../email/email-config.js';
import { decryptEmailPayload } from '../email/verification-crypto.js';
import { sendEmail, classifyEmailError } from '../email/email-provider.js';
import { prepareSubscriptionActivated, prepareSubscriptionExpired } from '../repositories/subscription-email.repository.js';
import { preparePasswordChanged } from '../repositories/password-changed.repository.js';

const MAX_ATTEMPTS = 12;

export const deliverEmail = async (id, config, send) => {
  await preparePasswordChanged(id, config);
  await prepareSubscriptionActivated(id, config);
  await prepareSubscriptionExpired(id, config);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // All authentication email flows lock user first. Skip busy users rather than block workers.
    const locked = await client.query(`SELECT u.id FROM public.users u
      JOIN public.email_outbox e ON e.user_id = u.id WHERE e.id = $1
      FOR UPDATE OF u SKIP LOCKED`, [id]);
    if (!locked.rows.length) { await client.query('ROLLBACK'); return; }
    const { rows } = await client.query(`SELECT e.*, COALESCE(t.email, r.email) AS email, u.email AS current_email,
      u.is_active, u.email_verified_at, u.auth_version, u.password IS NOT NULL AS has_password, r.auth_version AS token_auth_version,
      COALESCE(t.consumed_at, r.consumed_at) AS consumed_at,
      COALESCE(t.revoked_at, r.revoked_at) AS revoked_at,
      LEAST(e.expires_at, COALESCE(t.expires_at, r.expires_at)) <= clock_timestamp() + INTERVAL '1 minute' AS expired
      FROM public.email_outbox e
      LEFT JOIN public.email_verification_tokens t ON t.id = e.verification_id
      LEFT JOIN public.password_reset_tokens r ON r.id = e.password_reset_id
      JOIN public.users u ON u.id = e.user_id
      WHERE e.id = $1 AND e.status = 'pending' AND e.available_at <= clock_timestamp()
      FOR UPDATE OF e SKIP LOCKED`, [id]);
    const email = rows[0];
    if (!email) { await client.query('ROLLBACK'); return; }
    const tokenInvalid = ['email_verification', 'password_reset'].includes(email.kind) && (email.consumed_at || email.revoked_at ||
        (email.kind === 'email_verification' && email.email_verified_at) ||
        (email.kind === 'password_reset' && (!email.has_password || email.token_auth_version !== email.auth_version)) ||
        !email.is_active || email.email !== email.current_email);
    const obsoleteExpiry = email.kind === 'subscription_expired' && await isExpiryNotificationObsolete(client, email);
    if (obsoleteExpiry || email.expired || tokenInvalid || email.attempts >= MAX_ATTEMPTS) {
      await client.query(`UPDATE public.email_outbox SET status = 'cancelled', payload_encrypted = NULL
        WHERE id = $1`, [id]);
    } else {
      try {
        // Resend deduplicates retries; SMTP Message-ID is stable but cannot guarantee deduplication.
        // Every kind expires within 24h of creation, inside Resend's dedupe window.
        const payload = decryptEmailPayload(email.payload_encrypted, config.encryptionKey, id);
        const providerId = await (send ?? ((args) => sendEmail(config, args)))({ apiKey: config.apiKey, payload, idempotencyKey: `${email.kind.replaceAll('_', '-')}/${id}` });
        await client.query(`UPDATE public.email_outbox SET status = 'sent', sent_at = clock_timestamp(),
          provider_message_id = $2, attempts = attempts + 1, payload_encrypted = NULL,
          first_attempt_at = COALESCE(first_attempt_at, clock_timestamp()), last_error_code = NULL WHERE id = $1`, [id, providerId]);
      } catch (error) {
        const failure = classifyEmailError(error, config.provider ?? 'resend');
        const permanent = failure.permanent || email.attempts + 1 >= MAX_ATTEMPTS;
        // Store only sanitized codes, never provider responses or credentials.
        const code = failure.code;
        await client.query(`UPDATE public.email_outbox SET attempts = attempts + 1,
          first_attempt_at = COALESCE(first_attempt_at, clock_timestamp()), last_error_code = $2,
          available_at = clock_timestamp() + ($3 * INTERVAL '1 second'),
          status = CASE WHEN $4 THEN 'failed' ELSE 'pending' END,
          payload_encrypted = CASE WHEN $4 THEN NULL ELSE payload_encrypted END WHERE id = $1`,
        [id, code, Math.min(900, 30 * 2 ** email.attempts), permanent]);
      }
    }
    await client.query('COMMIT');
  } catch {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Email delivery transaction failed');
  } finally { client.release(); }
};

export const processEmailBatch = async (config, send, shouldStop = () => false) => {
  const { rows } = await pool.query(`SELECT id FROM public.email_outbox
    WHERE status = 'pending' AND available_at <= clock_timestamp() ORDER BY available_at LIMIT 10`);
  for (const row of rows) {
    if (shouldStop()) break;
    await deliverEmail(row.id, config, send);
  }
  // Remove expired encrypted payloads even if their retry time is in the future.
  await pool.query(`UPDATE public.email_outbox SET status = 'cancelled', payload_encrypted = NULL
    WHERE status = 'pending' AND expires_at <= clock_timestamp()`);
  for (const table of ['email_verification_tokens', 'password_reset_tokens']) {
    await pool.query(`DELETE FROM public.${table} WHERE id IN (
      SELECT id FROM public.${table} WHERE expires_at < clock_timestamp() - INTERVAL '7 days'
      LIMIT 100 FOR UPDATE SKIP LOCKED)`);
  }
};

export const startEmailDeliveryJob = () => {
  const config = getEmailConfig();
  let stopped = false;
  let current = null;
  const tick = () => {
    if (stopped || current) return;
    current = processEmailBatch(config, undefined, () => stopped)
      .catch(() => console.error('Email delivery worker unavailable'))
      .finally(() => { current = null; });
  };
  const timer = setInterval(tick, 15000);
  timer.unref();
  tick();
  return async () => { stopped = true; clearInterval(timer); await current; };
};
