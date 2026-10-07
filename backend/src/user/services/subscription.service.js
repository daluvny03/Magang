import {
  findActiveSubscriptionByUserId
} from '../repositories/subscription.repository.js';

const mapSubscription = (row) => ({
  id: row.id,
  status: row.status,
  startedAt: row.started_at,
  expiredAt: row.expired_at,
  tier: {
    id: row.tier_id,
    name: row.tier_name,
    slug: row.tier_slug,
    description: row.tier_description,
    durationDays: row.tier_duration_days,
    level: row.tier_level,
    isActive: row.tier_is_active
  }
});

export const getActiveSubscriptionByUserId = async (
  userId
) => {
  const subscription =
    await findActiveSubscriptionByUserId(userId);

  if (!subscription) {
    return null;
  }

  return mapSubscription(subscription);
};