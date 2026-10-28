import { createHash } from 'node:crypto';
import { pool } from '../config/database.js';
import { AppError } from '../utils/app-error.js';

// Separate buckets preserve the existing login limiter and work across processes.
export const limitEmailAction = (action) => async (req, res, next) => {
  const digest = (value) => createHash('sha256').update(String(value)).digest('hex');
  const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  const buckets = [{ key: `${action}:ip:${digest(ip)}`, seconds: 900, limit: action === 'verify' ? 60 : 20 }];
  if (action === 'resend' || action === 'forgot') {
    const email = digest(req.body.email);
    buckets.push({ key: `${action}:email:${email}`, seconds: 3600, limit: 5 });
    buckets.push({ key: `${action}:cooldown:${email}`, seconds: 60, limit: 1 });
  }
  if (action === 'reset') {
    buckets.push({ key: `reset:token:${digest(req.body.token)}`, seconds: 900, limit: 10 });
  }
  const client = await pool.connect().catch(() => null);
  if (!client) return next(new AppError('Authentication temporarily unavailable', 503, 'EMAIL_LIMITER_UNAVAILABLE'));
  try {
    await client.query('BEGIN');
    let retryAfter = 0;
    for (const bucket of buckets.sort((a, b) => a.key.localeCompare(b.key))) {
      const { rows } = await client.query({ text: `
        INSERT INTO public.auth_email_limits AS b (bucket_key, window_started_at, attempts)
        VALUES ($1, clock_timestamp(), 1)
        ON CONFLICT (bucket_key) DO UPDATE SET
          attempts = CASE WHEN b.window_started_at <= EXCLUDED.window_started_at - ($2 * INTERVAL '1 second')
            THEN 1 ELSE LEAST(b.attempts + 1, 1000000) END,
          window_started_at = CASE WHEN b.window_started_at <= EXCLUDED.window_started_at - ($2 * INTERVAL '1 second')
            THEN EXCLUDED.window_started_at ELSE b.window_started_at END
        RETURNING attempts, GREATEST(1, CEIL(EXTRACT(EPOCH FROM
          window_started_at + ($2 * INTERVAL '1 second') - clock_timestamp())))::integer AS retry_after`,
      values: [bucket.key, bucket.seconds], query_timeout: 5000 });
      if (rows[0].attempts > bucket.limit) retryAfter = Math.max(retryAfter, rows[0].retry_after);
    }
    await client.query(`DELETE FROM public.auth_email_limits WHERE bucket_key IN (
      SELECT bucket_key FROM public.auth_email_limits WHERE window_started_at < clock_timestamp() - INTERVAL '1 day'
      LIMIT 50 FOR UPDATE SKIP LOCKED)`);
    await client.query('COMMIT');
    if (retryAfter) {
      res.setHeader('Retry-After', String(retryAfter));
      return next(new AppError('Terlalu banyak permintaan. Silakan coba kembali nanti.', 429, 'EMAIL_RATE_LIMITED'));
    }
    return next();
  } catch {
    await client.query('ROLLBACK').catch(() => {});
    return next(new AppError('Authentication temporarily unavailable', 503, 'EMAIL_LIMITER_UNAVAILABLE'));
  } finally { client.release(); }
};
