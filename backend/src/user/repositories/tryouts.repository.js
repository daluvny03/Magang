// CAT timestamps follow the PostgreSQL session timezone used by existing writes.
// Return timestamptz so pg does not reinterpret them using the Node process timezone.
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
        tp.passing_mode,
        tp.passing_grades,
        tp.is_free,
        CASE
          WHEN tp.is_free = true THEN NULL
          ELSE 'premium'
        END AS required_tier,
        tp.start_at::timestamptz AS start_at,
        tp.end_at::timestamptz AS end_at,
        active_attempt.id AS active_attempt_id,
        active_attempt.expires_at::timestamptz AS active_attempt_expires_at,

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

            INNER JOIN subscription_tiers st
              ON st.id = us.subscription_tier_id

            INNER JOIN tryout_package_subscription_tiers tpst
              ON tpst.subscription_tier_id = st.id

            WHERE us.user_id = $1
              AND st.slug = 'premium'
              AND st.is_active = true
              AND us.status = 'active'
              AND us.started_at <= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
              AND us.expired_at > (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
              AND tpst.tryout_package_id = tp.id
          ) THEN true

          ELSE false
        END AS is_accessible

      FROM tryout_packages tp

      LEFT JOIN LATERAL (
        SELECT ta.id, ta.expires_at
        FROM tryout_attempts ta
        WHERE ta.user_id = $1 AND ta.tryout_package_id = tp.id
          AND ta.status = 'in_progress' AND ta.expires_at > CURRENT_TIMESTAMP
        ORDER BY ta.attempt_number DESC LIMIT 1
      ) active_attempt ON true

      WHERE tp.status = 'published'
        AND (
          tp.is_free = true
          OR EXISTS (
            SELECT 1
            FROM tryout_package_subscription_tiers tpst_visible
            INNER JOIN subscription_tiers st_visible
              ON st_visible.id =
                tpst_visible.subscription_tier_id
            WHERE tpst_visible.tryout_package_id = tp.id
              AND st_visible.slug = 'premium'
              AND st_visible.is_active = true
          )
        )

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
    evaluatedAt = null,
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
        tp.passing_mode,
        tp.passing_grades,
        tp.is_free,
        CASE
          WHEN tp.is_free = true THEN NULL
          ELSE 'premium'
        END AS required_tier,
        tp.start_at::timestamptz AS start_at,
        tp.end_at::timestamptz AS end_at,

        CASE
          WHEN tp.start_at > COALESCE($3::timestamptz, statement_timestamp()) THEN 'upcoming'
          WHEN tp.end_at < COALESCE($3::timestamptz, statement_timestamp()) THEN 'ended'
          ELSE 'active'
        END AS schedule_status,

        CASE
          WHEN tp.is_free = true THEN true

          WHEN EXISTS (
            SELECT 1
            FROM user_subscriptions us

            INNER JOIN subscription_tiers st
              ON st.id = us.subscription_tier_id

            INNER JOIN tryout_package_subscription_tiers tpst
              ON tpst.subscription_tier_id = st.id

            WHERE us.user_id = $1
              AND st.slug = 'premium'
              AND st.is_active = true
              AND us.status = 'active'
              AND us.started_at <= (COALESCE($3::timestamptz, statement_timestamp()) AT TIME ZONE 'UTC')
              AND us.expired_at > (COALESCE($3::timestamptz, statement_timestamp()) AT TIME ZONE 'UTC')
              AND tpst.tryout_package_id = tp.id
          ) THEN true

          ELSE false
        END AS is_accessible

      FROM tryout_packages tp

      WHERE tp.id = $2
        AND tp.status = 'published'
        AND (
          tp.is_free = true
          OR EXISTS (
            SELECT 1
            FROM tryout_package_subscription_tiers tpst_visible
            INNER JOIN subscription_tiers st_visible
              ON st_visible.id =
                tpst_visible.subscription_tier_id
            WHERE tpst_visible.tryout_package_id = tp.id
              AND st_visible.slug = 'premium'
              AND st_visible.is_active = true
          )
        )

        ${ignoreSchedule ? '' : `AND (
          tp.start_at IS NULL
          OR tp.start_at <= COALESCE($3::timestamptz, statement_timestamp())
        )

        AND (
          tp.end_at IS NULL
          OR tp.end_at >= COALESCE($3::timestamptz, statement_timestamp())
        )`}

      LIMIT 1
      ${lockPackage ? 'FOR SHARE OF tp' : ''}
    `,
    [userId, tryoutId, evaluatedAt]
  )

  return rows[0] || null
}
