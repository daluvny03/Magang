import {
  findActiveSubscriptionByUserId,
  findAvailableSubscriptionTiers,
  findSubscriptionPurchaseContext,
  findUpgradeableTargetTierIds,
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

const resolvePurchaseEligibility = ({
  tier,
  currentTier,
  upgradeableTierIds,
}) => {
  const tierId = String(tier.id)

  if (!tier.is_active) {
    return {
      isPurchasable: false,
      purchaseAction: null,
      purchaseBlockReason: 'inactive',
    }
  }

  if (tier.slug === 'free') {
    return {
      isPurchasable: false,
      purchaseAction: null,
      purchaseBlockReason: 'free_tier',
    }
  }

  const price = Number(tier.price)

  if (!Number.isFinite(price) || price <= 0) {
    return {
      isPurchasable: false,
      purchaseAction: null,
      purchaseBlockReason: 'invalid_price',
    }
  }

  const durationValue = Number(tier.duration_value)

  if (
    !Number.isSafeInteger(durationValue) ||
    durationValue <= 0 ||
    !['day', 'month', 'year'].includes(tier.duration_unit)
  ) {
    return {
      isPurchasable: false,
      purchaseAction: null,
      purchaseBlockReason: 'invalid_duration',
    }
  }

  if (!currentTier) {
    return {
      isPurchasable: true,
      purchaseAction: 'new',
      purchaseBlockReason: null,
    }
  }

  if (String(currentTier.tier_id) === tierId) {
    return {
      isPurchasable: true,
      purchaseAction: 'renewal',
      purchaseBlockReason: null,
    }
  }

  if (upgradeableTierIds.has(tierId)) {
    return {
      isPurchasable: true,
      purchaseAction: 'upgrade',
      purchaseBlockReason: null,
    }
  }

  return {
    isPurchasable: false,
    purchaseAction: null,
    purchaseBlockReason: 'upgrade_not_allowed',
  }
}

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

export const getSubscriptionCatalog = async (userId) => {  
  const [tiers, activeRows] = await Promise.all([
    findAvailableSubscriptionTiers(),
    findSubscriptionPurchaseContext(userId),
  ])

  // Free merupakan akses universal, bukan penghalang
  // untuk membeli subscription berbayar.
  const paidActiveRows = activeRows.filter(
    (row) => row.slug !== 'free'
  )

  // Jangan menentukan checkout jika database mempunyai
  // lebih dari satu subscription berbayar aktif.
  const hasConflict = paidActiveRows.length > 1

  const currentTier = hasConflict
    ? null
    : paidActiveRows[0] ?? null

  const upgradeableTierIds = currentTier
    ? new Set(
        await findUpgradeableTargetTierIds(
          currentTier.tier_id
        )
      )
    : new Set()

  return tiers.map((row) => {
    const eligibility = hasConflict
      ? {
          isPurchasable: false,
          purchaseAction: null,
          purchaseBlockReason: 'subscription_conflict',
        }
      : resolvePurchaseEligibility({
          tier: row,
          currentTier,
          upgradeableTierIds,
        })

    return {
      // Pertahankan seluruh mapping katalog lama.
      id: String(row.id),
      name: row.name,
      slug: row.slug,
      description: row.description,
      price: Number(row.price),
      duration: row.slug === 'free'
        ? null
        : {
            value: Number(row.duration_value),
            unit: row.duration_unit,
          },
      level: Number(row.level),
      isActive: row.is_active,

      isCurrentTier:
        currentTier !== null &&
        String(currentTier.tier_id) === String(row.id),

      ...eligibility,
    }
  })
};
