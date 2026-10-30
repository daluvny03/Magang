// CAT timestamps follow the PostgreSQL session timezone used by existing writes.
// Return timestamptz so pg does not reinterpret them using the Node process timezone.
import { pool } from '../../config/database.js';
import { validateTryoutId } from '../utils/tryout-id.js'
const buildEffectiveAccessSql = (evaluatedAtSql) => `
  EXISTS (
    WITH RECURSIVE effective_tiers(tier_id) AS (
      -- Tier dari subscription aktif User.
      SELECT us.subscription_tier_id
      FROM user_subscriptions us
      INNER JOIN subscription_tiers st
        ON st.id = us.subscription_tier_id
      WHERE us.user_id = $1
        AND us.status = 'active'
        AND us.started_at <= (
          ${evaluatedAtSql} AT TIME ZONE 'UTC'
        )
        AND us.expired_at > (
          ${evaluatedAtSql} AT TIME ZONE 'UTC'
        )

      UNION

      -- Free adalah akses dasar universal.
      SELECT id
      FROM subscription_tiers
      WHERE slug = 'free'

      UNION

      -- Seluruh tier yang diwarisi secara transitif.
      SELECT sti.child_tier_id
      FROM subscription_tier_inheritances sti
      INNER JOIN effective_tiers et
        ON sti.parent_tier_id = et.tier_id
    )

    SELECT 1
    FROM tryout_package_subscription_tiers tpst
    INNER JOIN effective_tiers et
      ON et.tier_id = tpst.subscription_tier_id
    WHERE tpst.tryout_package_id = tp.id
  )
`
export const findAvailableTryoutsForUser = async (
  userId
) => {
  const effectiveAccessSql =
  buildEffectiveAccessSql('statement_timestamp()')
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
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', st_allowed.id,
                'name', st_allowed.name,
                'slug', st_allowed.slug
              )
              ORDER BY st_allowed.level ASC, st_allowed.id ASC
            )
            FROM tryout_package_subscription_tiers tpst_allowed
            INNER JOIN subscription_tiers st_allowed
              ON st_allowed.id = tpst_allowed.subscription_tier_id
            WHERE tpst_allowed.tryout_package_id = tp.id
          ),
          '[]'::jsonb
        ) AS allowed_tiers,
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
          WHEN ${effectiveAccessSql} THEN true
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
            WHERE tpst_visible.tryout_package_id = tp.id
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
  tryoutId = validateTryoutId(tryoutId)
  const effectiveAccessSql =
  buildEffectiveAccessSql(
    'COALESCE($3::timestamptz, statement_timestamp())'
  )
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
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', st_allowed.id,
                'name', st_allowed.name,
                'slug', st_allowed.slug
              )
              ORDER BY st_allowed.level ASC, st_allowed.id ASC
            )
            FROM tryout_package_subscription_tiers tpst_allowed
            INNER JOIN subscription_tiers st_allowed
              ON st_allowed.id = tpst_allowed.subscription_tier_id
            WHERE tpst_allowed.tryout_package_id = tp.id
          ),
          '[]'::jsonb
        ) AS allowed_tiers,
        tp.start_at::timestamptz AS start_at,
        tp.end_at::timestamptz AS end_at,

        CASE
          WHEN tp.start_at > COALESCE($3::timestamptz, statement_timestamp()) THEN 'upcoming'
          WHEN tp.end_at < COALESCE($3::timestamptz, statement_timestamp()) THEN 'ended'
          ELSE 'active'
        END AS schedule_status,

        CASE
          WHEN tp.is_free = true THEN true
          WHEN ${effectiveAccessSql} THEN true
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
            WHERE tpst_visible.tryout_package_id = tp.id
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
