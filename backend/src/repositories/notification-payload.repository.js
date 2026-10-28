import { withTransaction } from '../utils/transaction.js';
import { encryptEmailPayload } from '../email/verification-crypto.js';

// Commit the immutable payload BEFORE contacting Resend, including on the first attempt.
// A crash or a configuration change must not change a retried idempotent request.
export const prepareNotificationPayload = async (id, kind, config, buildMessage) => withTransaction(async (client) => {
  const { rows } = await client.query(`SELECT * FROM public.email_outbox
    WHERE id = $1 AND kind = $2 AND status = 'pending'
      AND payload_encrypted IS NULL AND available_at <= clock_timestamp()
      AND expires_at > clock_timestamp() + INTERVAL '1 minute'
    FOR UPDATE SKIP LOCKED`, [id, kind]);
  if (!rows.length) return;
  const event = rows[0];
  const payload = buildMessage(event, config);
  await client.query('UPDATE public.email_outbox SET payload_encrypted = $2 WHERE id = $1',
    [id, encryptEmailPayload(payload, config.encryptionKey, id)]);
});
