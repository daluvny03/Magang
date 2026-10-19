import {
  findActiveSubscriptionByUserId,
  findAvailableSubscriptionTiers
} from '../repositories/subscription.repository.js';

const mapDuration = (value, unit) => {
  if (value == null || unit == null) {
    return null;
  }

  return {
    value: Number(value),
    unit
  };
};

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

    duration: mapDuration(
      row.tier_duration_value,
      row.tier_duration_unit
    ),

    level: row.tier_level,
    isActive: row.tier_is_active
  }
});

const mapSubscriptionTier = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  price: Number(row.price),
  duration:
    row.slug === 'free'
      ? null
      : mapDuration(
          row.duration_value,
          row.duration_unit
        ),
  isPurchasable: row.slug === 'premium'
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

export const getSubscriptionCatalog = async () => {
  const tiers = await findAvailableSubscriptionTiers();

  return tiers.map(mapSubscriptionTier);
};
