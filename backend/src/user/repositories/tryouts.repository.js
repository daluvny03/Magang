import { pool } from '../../config/database.js';

export const findAvailableTryoutsForUser = async (
  userId
) => {
  const { rows } = await pool.query(
    `
      SELECT
        tp.id,
        tp.name,
        tp.slug,
        tp.description,
        tp.duration_minutes,
        tp.question_count,
        tp.passing_score,
        tp.is_free,
        tp.start_at,
        tp.end_at,

        CASE
          WHEN tp.is_free = true THEN true

          WHEN EXISTS (
            SELECT 1
            FROM user_subscriptions us
            INNER JOIN tryout_package_subscription_tiers tpst
              ON tpst.subscription_tier_id =
                 us.subscription_tier_id
            WHERE us.user_id = $1
              AND us.status = 'active'
              AND us.started_at <= CURRENT_TIMESTAMP
              AND us.expired_at > CURRENT_TIMESTAMP
              AND tpst.tryout_package_id = tp.id
          ) THEN true

          ELSE false
        END AS is_accessible

      FROM tryout_packages tp

      WHERE tp.status = 'published'

        AND (
          tp.start_at IS NULL
          OR tp.start_at <= CURRENT_TIMESTAMP
        )

        AND (
          tp.end_at IS NULL
          OR tp.end_at >= CURRENT_TIMESTAMP
        )

      ORDER BY tp.id ASC
    `,
    [userId]
  );

  return rows;
};

export const findAvailableTryoutByIdForUser = async (
  userId,
  tryoutId
) => {
  const { rows } = await pool.query(
    `
      SELECT
        tp.id,
        tp.name,
        tp.slug,
        tp.description,
        tp.duration_minutes,
        tp.question_count,
        tp.passing_score,
        tp.is_free,
        tp.start_at,
        tp.end_at,

        CASE
          WHEN tp.is_free = true THEN true

          WHEN EXISTS (
            SELECT 1
            FROM user_subscriptions us
            INNER JOIN tryout_package_subscription_tiers tpst
              ON tpst.subscription_tier_id =
                 us.subscription_tier_id
            WHERE us.user_id = $1
              AND us.status = 'active'
              AND us.started_at <= CURRENT_TIMESTAMP
              AND us.expired_at > CURRENT_TIMESTAMP
              AND tpst.tryout_package_id = tp.id
          ) THEN true

          ELSE false
        END AS is_accessible

      FROM tryout_packages tp

      WHERE tp.id = $2
        AND tp.status = 'published'

        AND (
          tp.start_at IS NULL
          OR tp.start_at <= CURRENT_TIMESTAMP
        )

        AND (
          tp.end_at IS NULL
          OR tp.end_at >= CURRENT_TIMESTAMP
        )

      LIMIT 1
    `,
    [userId, tryoutId]
  )

  return rows[0] || null
}