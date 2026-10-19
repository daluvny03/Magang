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
      st.duration_value AS tier_duration_value,
      st.duration_unit AS tier_duration_unit,
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

export const findAvailableSubscriptionTiers = async () => {
  const query = `
    SELECT
      id,
      name,
      slug,
      description,
      price,
      duration_value,
      duration_unit,
      level
    FROM subscription_tiers
    WHERE is_active = true
      AND slug IN ('free', 'premium')
    ORDER BY level ASC, id ASC
  `;

  const { rows } = await pool.query(query);

  return rows;
};


export const findCurrentPremiumSubscriptionForUpdate = async (
  userId,
  client
) => {
  const { rows } = await client.query(
    `
      SELECT
        us.id,
        us.user_id,
        us.subscription_tier_id,
        us.status,
        to_char(
          us.started_at,
          'YYYY-MM-DD"T"HH24:MI:SS.US'
        ) AS started_at_utc,
        to_char(
          us.expired_at,
          'YYYY-MM-DD"T"HH24:MI:SS.US'
        ) AS expired_at_utc
      FROM user_subscriptions us
      INNER JOIN subscription_tiers st
        ON st.id = us.subscription_tier_id
      WHERE us.user_id = $1
        AND st.slug = 'premium'
        AND us.status = 'active'
        AND us.started_at <= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
        AND us.expired_at > (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
      ORDER BY us.expired_at DESC
      LIMIT 1
      FOR UPDATE OF us
    `,
    [userId]
  );

  return rows[0] || null;
};

export const createPremiumSubscription = async (
  {
    userId,
    tierId,
    startedAt,
    expiredAt
  },
  client
) => {
  const { rows } = await client.query(
    `
      INSERT INTO user_subscriptions (
        user_id,
        subscription_tier_id,
        status,
        started_at,
        expired_at
      )
      VALUES (
        $1,
        $2,
        'active'::subscription_status,
        $3::timestamptz AT TIME ZONE 'UTC',
        $4::timestamptz AT TIME ZONE 'UTC'
      )
      RETURNING *
    `,
    [
      userId,
      tierId,
      startedAt,
      expiredAt
    ]
  );

  return rows[0];
};

export const renewPremiumSubscription = async (
  subscriptionId,
  expiredAt,
  client
) => {
  const { rows } = await client.query(
    `
      UPDATE user_subscriptions
      SET
        expired_at = $2::timestamptz AT TIME ZONE 'UTC'
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
        AND status = 'active'::subscription_status
      RETURNING *
    `,
    [subscriptionId, expiredAt]
  );

  return rows[0] || null;
};