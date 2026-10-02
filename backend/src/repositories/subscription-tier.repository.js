import { pool } from '../config/database.js';

export const findActiveSubscriptionTiers = async () => {
  const { rows } = await pool.query(`
    SELECT
      id,
      name,
      slug,
      description,
      price,
      duration_days,
      level,
      is_active,
      created_at,
      updated_at
    FROM subscription_tiers
    WHERE is_active = true
    ORDER BY level ASC, id ASC
  `);

  return rows;
};