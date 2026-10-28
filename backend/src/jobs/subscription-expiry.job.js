import { pool } from '../config/database.js';
import { expireSubscription } from '../repositories/subscription-expiry.repository.js';

export const processSubscriptionExpiryBatch = async (shouldStop = () => false) => {
  const { rows } = await pool.query(`SELECT s.id FROM public.user_subscriptions s
    JOIN public.subscription_tiers t ON t.id = s.subscription_tier_id
    WHERE s.status = 'active' AND t.slug = 'premium'
      AND s.expired_at <= (clock_timestamp() AT TIME ZONE 'UTC')
    ORDER BY s.expired_at, s.id LIMIT 50`);
  for (const row of rows) {
    if (shouldStop()) break;
    await expireSubscription(row.id);
  }
};

export const startSubscriptionExpiryJob = () => {
  let stopped = false;
  let current = null;
  const tick = () => {
    if (stopped || current) return;
    current = processSubscriptionExpiryBatch(() => stopped)
      .catch(() => console.error('Subscription expiry worker unavailable'))
      .finally(() => { current = null; });
  };
  const timer = setInterval(tick, 60000);
  timer.unref();
  tick();
  return async () => { stopped = true; clearInterval(timer); await current; };
};
