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
          WHEN tp.start_at > CURRENT_TIMESTAMP THEN 'upcoming'
          WHEN tp.end_at < CURRENT_TIMESTAMP THEN 'ended'
          ELSE 'active'
        END AS schedule_status,

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

      ORDER BY tp.id ASC
    `,
    [userId]
  );

  return rows;
};

export const findAvailableTryoutByIdForUser = async (
  userId,
  tryoutId,
  {
    client = pool,
    ignoreSchedule = false,
    lockPackage = false,
  } = {}
) => {
  const { rows } = await client.query(
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
          WHEN tp.start_at > CURRENT_TIMESTAMP THEN 'upcoming'
          WHEN tp.end_at < CURRENT_TIMESTAMP THEN 'ended'
          ELSE 'active'
        END AS schedule_status,

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

        ${ignoreSchedule ? '' : `AND (
          tp.start_at IS NULL
          OR tp.start_at <= CURRENT_TIMESTAMP
        )

        AND (
          tp.end_at IS NULL
          OR tp.end_at >= CURRENT_TIMESTAMP
        )`}

      LIMIT 1
      ${lockPackage ? 'FOR SHARE OF tp' : ''}
    `,
    [userId, tryoutId]
  )

  return rows[0] || null
}
