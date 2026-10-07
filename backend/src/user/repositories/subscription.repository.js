import { pool } from '../../config/database.js';

export const findActiveSubscriptionByUserId = async (
  userId
) => {
  const query = `
    SELECT
      us.id,
      us.user_id,
      us.status,
      us.started_at,
      us.expired_at,
      us.created_at,
      us.updated_at,

      st.id AS tier_id,
      st.name AS tier_name,
      st.slug AS tier_slug,
      st.description AS tier_description,
      st.duration_days AS tier_duration_days,
      st.level AS tier_level,
      st.is_active AS tier_is_active

    FROM user_subscriptions us

    INNER JOIN subscription_tiers st
      ON st.id = us.subscription_tier_id

    WHERE us.user_id = $1
      AND us.status = 'active'
      AND us.started_at <= CURRENT_TIMESTAMP
      AND us.expired_at > CURRENT_TIMESTAMP

    ORDER BY us.started_at DESC

    LIMIT 1
  `;

  const { rows } = await pool.query(
    query,
    [userId]
  );

  return rows[0] || null;
};