import { pool } from '../../config/database.js';

export const findActiveSubscriptionByUserId = async (
  userId
) => {
  const { rows } = await pool.query(
    `
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
        AND us.started_at <=
          (statement_timestamp() AT TIME ZONE 'UTC')
        AND us.expired_at >
          (statement_timestamp() AT TIME ZONE 'UTC')

      ORDER BY
        CASE WHEN st.slug = 'free' THEN 1 ELSE 0 END ASC,
        us.started_at DESC,
        us.id DESC

      LIMIT 1
    `,
    [userId]
  )

  return rows[0] || null
}

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
      is_active,
      level
    FROM subscription_tiers
    WHERE is_active = true
    ORDER BY level ASC, id ASC
  `;

  const { rows } = await pool.query(query);

  return rows;
};


export const findCurrentPremiumSubscriptionForUpdate = async (
  userId,
  evaluatedAt,
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
        AND us.started_at <= ($2::timestamptz AT TIME ZONE 'UTC')
        AND us.expired_at > ($2::timestamptz AT TIME ZONE 'UTC')
      ORDER BY us.expired_at DESC
      LIMIT 1
      FOR UPDATE OF us
    `,
    [userId, evaluatedAt]
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
        expired_at = $2::timestamptz AT TIME ZONE 'UTC',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
        AND status = 'active'::subscription_status
      RETURNING *
    `,
    [subscriptionId, expiredAt]
  );

  return rows[0] || null;
};

export const findSubscriptionPurchaseContext = async (
  userId,
  client = pool
) => {
  const { rows } = await client.query(
    `
      SELECT
        us.subscription_tier_id AS tier_id,
        st.slug,
        st.level
      FROM user_subscriptions us
      INNER JOIN subscription_tiers st
        ON st.id = us.subscription_tier_id
      WHERE us.user_id = $1
        AND us.status = 'active'
        AND us.started_at <=
          (statement_timestamp() AT TIME ZONE 'UTC')
        AND us.expired_at >
          (statement_timestamp() AT TIME ZONE 'UTC')
      ORDER BY us.id DESC
    `,
    [userId]
  )

  return rows
}

export const findUpgradeableTargetTierIds = async (
  currentTierId,
  client = pool
) => {
  const { rows } = await client.query(
    `
      WITH RECURSIVE ancestors(tier_id) AS (
        SELECT sti.parent_tier_id
        FROM subscription_tier_inheritances sti
        WHERE sti.child_tier_id = $1

        UNION

        SELECT sti.parent_tier_id
        FROM subscription_tier_inheritances sti
        INNER JOIN ancestors a
          ON sti.child_tier_id = a.tier_id
      )
      SELECT st.id
      FROM ancestors a
      INNER JOIN subscription_tiers st
        ON st.id = a.tier_id
      WHERE st.is_active = true
    `,
    [currentTierId]
  )

  return rows.map((row) => String(row.id))
}

export const findActivePaidSubscriptionsForUpdate = async (
  userId,
  evaluatedAt,
  client
) => {
  const { rows } = await client.query(
    `
      SELECT
        us.id,
        us.user_id,
        us.subscription_tier_id,
        us.status,
        st.slug AS tier_slug,
        st.level AS tier_level,
        to_char(
          us.expired_at,
          'YYYY-MM-DD"T"HH24:MI:SS.US'
        ) AS expired_at_utc
      FROM user_subscriptions us
      INNER JOIN subscription_tiers st
        ON st.id = us.subscription_tier_id
      WHERE us.user_id = $1
        AND us.status = 'active'
        AND st.slug <> 'free'
        AND us.started_at <=
          ($2::timestamptz AT TIME ZONE 'UTC')
        AND us.expired_at >
          ($2::timestamptz AT TIME ZONE 'UTC')
      ORDER BY us.id DESC
      FOR UPDATE OF us
    `,
    [userId, evaluatedAt]
  )

  return rows
}

export const createSubscription = async (
  {
    userId,
    tierId,
    startedAt,
    expiredAt,
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
    [userId, tierId, startedAt, expiredAt]
  )

  return rows[0] || null
}

export const renewSubscription = async (
  subscriptionId,
  expiredAt,
  client
) => {
  const { rows } = await client.query(
    `
      UPDATE user_subscriptions
      SET
        expired_at =
          $2::timestamptz AT TIME ZONE 'UTC',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
        AND status = 'active'::subscription_status
      RETURNING *
    `,
    [subscriptionId, expiredAt]
  )

  return rows[0] || null
}

export const closeSubscriptionForUpgrade = async (
  subscriptionId,
  closedAt,
  client
) => {
  const { rows } = await client.query(
    `
      UPDATE user_subscriptions
      SET
        status = 'expired'::subscription_status,
        expired_at =
          $2::timestamptz AT TIME ZONE 'UTC',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
        AND status = 'active'::subscription_status
      RETURNING *
    `,
    [subscriptionId, closedAt]
  )

  return rows[0] || null
}
