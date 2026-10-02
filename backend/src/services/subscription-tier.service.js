import {
  findActiveSubscriptionTiers
} from '../repositories/subscription-tier.repository.js';

import {
  createSubscriptionTierModel
} from '../models/subscription-tier.model.js';

export const getActiveSubscriptionTiers =
  async () => {
    const rows =
      await findActiveSubscriptionTiers();

    return rows.map((row) =>
      createSubscriptionTierModel({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        price: row.price,
        durationDays: row.duration_days,
        level: row.level,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })
    );
  };