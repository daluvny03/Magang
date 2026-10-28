import { randomUUID } from 'node:crypto';
import { withTransaction } from '../utils/transaction.js';

const activePremium = `SELECT 1 FROM public.user_subscriptions active
  JOIN public.subscription_tiers tier ON tier.id = active.subscription_tier_id
  WHERE active.user_id = $1 AND tier.slug = 'premium' AND active.status = 'active'
    AND active.started_at <= (clock_timestamp() AT TIME ZONE 'UTC')
    AND active.expired_at > (clock_timestamp() AT TIME ZONE 'UTC')`;

export const expireSubscription = (id) => withTransaction(async (client) => {
  // Match payment lifecycle lock order: user first, subscription second.
  const locked = await client.query(`SELECT u.id, u.email, u.is_active FROM public.users u
    JOIN public.user_subscriptions s ON s.user_id = u.id WHERE s.id = $1
    FOR UPDATE OF u SKIP LOCKED`, [id]);
  if (!locked.rows.length) return;
  const user = locked.rows[0];
  const { rows } = await client.query(`SELECT s.id, t.name,
    to_char(s.expired_at, 'YYYY-MM-DD"T"HH24:MI:SS.US') AS expiration,
    s.expired_at >= (settings.enabled_from AT TIME ZONE 'UTC') AS notify
    FROM public.user_subscriptions s
    JOIN public.subscription_tiers t ON t.id = s.subscription_tier_id
    CROSS JOIN public.subscription_notification_settings settings
    WHERE s.id = $1 AND s.user_id = $2 AND s.status = 'active' AND t.slug = 'premium'
      AND s.expired_at <= (clock_timestamp() AT TIME ZONE 'UTC')
    FOR UPDATE OF s`, [id, user.id]);
  if (!rows.length) return;
  const subscription = rows[0];
  await client.query(`UPDATE public.user_subscriptions SET status = 'expired',
    updated_at = (clock_timestamp() AT TIME ZONE 'UTC') WHERE id = $1`, [id]);
  if (!subscription.notify || !user.is_active || (await client.query(activePremium, [user.id])).rows.length) return;
  await client.query(`INSERT INTO public.email_outbox
    (id, user_id, kind, recipient_email, subscription_id, subscription_expired_at, subscription_snapshot, expires_at)
    VALUES ($1, $2, 'subscription_expired', $3, $4, $5::timestamp, $6, clock_timestamp() + INTERVAL '24 hours')
    ON CONFLICT (subscription_id, subscription_expired_at) WHERE kind = 'subscription_expired' DO NOTHING`,
  [randomUUID(), user.id, user.email, id, subscription.expiration,
    JSON.stringify({ tierName: subscription.name, expiredAt: `${subscription.expiration}Z` })]);
});

// Called while delivery holds the user lock, serializing with activation/renewal.
export const isExpiryNotificationObsolete = async (client, email) => {
  if (!email.is_active || email.recipient_email !== email.current_email) return true;
  const source = await client.query(`SELECT 1 FROM public.user_subscriptions s
    JOIN public.email_outbox e ON e.subscription_id = s.id
    WHERE e.id = $1 AND s.user_id = e.user_id AND s.status = 'expired'
      AND s.expired_at = e.subscription_expired_at
      AND s.expired_at <= (clock_timestamp() AT TIME ZONE 'UTC')`, [email.id]);
  return !source.rows.length || (await client.query(activePremium, [email.user_id])).rows.length > 0;
};
