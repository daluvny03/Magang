import { createHash } from 'node:crypto';
import { pool } from '../config/database.js';
import { AppError } from '../utils/app-error.js';

const WINDOW_SECONDS = 15 * 60;
const keyFor = (kind, value) => `${kind}:${createHash('sha256').update(value).digest('hex')}`;

export const limitLoginAttempts = async (req, res, next) => {
  // req.ip memakai kebijakan trust proxy Express; tidak mempercayai header IP mentah.
  const keys = [keyFor('ip', req.ip ?? req.socket.remoteAddress ?? 'unknown'),
    keyFor('account', req.body.email)];
  try {
    const { rows } = await pool.query({
      text: `
        WITH incoming AS (
          SELECT key, clock_timestamp() AS observed_at
          FROM unnest($1::text[]) AS keys(key) ORDER BY key
        ), counters AS (
          INSERT INTO public.auth_login_limits AS bucket (bucket_key, window_started_at, attempts)
          SELECT key, observed_at, 1 FROM incoming ORDER BY key
          ON CONFLICT (bucket_key) DO UPDATE SET
            attempts = CASE
              WHEN bucket.window_started_at <= EXCLUDED.window_started_at - ($2 * INTERVAL '1 second')
                THEN 1 ELSE LEAST(bucket.attempts + 1, 1000000) END,
            window_started_at = CASE
              WHEN bucket.window_started_at <= EXCLUDED.window_started_at - ($2 * INTERVAL '1 second')
                THEN EXCLUDED.window_started_at ELSE bucket.window_started_at END
          RETURNING bucket_key, attempts, window_started_at
        ), cleanup AS (
          DELETE FROM public.auth_login_limits WHERE bucket_key IN (
            SELECT bucket_key FROM public.auth_login_limits
            WHERE window_started_at < clock_timestamp() - INTERVAL '1 day'
              AND NOT (bucket_key = ANY($1::text[]))
            ORDER BY window_started_at LIMIT 50
            FOR UPDATE SKIP LOCKED
          )
        )
        SELECT bucket_key, attempts,
          GREATEST(1, CEIL(EXTRACT(EPOCH FROM
            (window_started_at + ($2 * INTERVAL '1 second') - clock_timestamp()))))::integer AS retry_after
        FROM counters`,
      values: [keys, WINDOW_SECONDS],
      query_timeout: 5000,
    });
    const blocked = rows.filter((row) => row.attempts >
      (row.bucket_key.startsWith('ip:') ? 60 : 20));
    if (blocked.length) {
      res.setHeader('Retry-After', String(Math.max(...blocked.map((row) => row.retry_after))));
      return next(new AppError('Too many login attempts. Please try again later.', 429, 'LOGIN_RATE_LIMITED'));
    }
    return next();
  } catch {
    // Gagal tertutup: schema/store tidak tersedia tidak boleh melewati limiter.
    return next(new AppError('Login temporarily unavailable', 503, 'LOGIN_LIMITER_UNAVAILABLE'));
  }
};
