import { normalizeEmail } from '../utils/email.js';
import { pool } from '../config/database.js';
import { createUserModel } from '../models/user.model.js';
const selectedSubscriptionQuery = `
  SELECT
    u.id,
    u.name,
    u.email,
    u.role,
    u.created_at,
    u.updated_at,
    selected_subscription.subscription,
    selected_subscription.tier_id,
    selected_subscription.effective_status

  FROM users u

  LEFT JOIN LATERAL (
    SELECT
      st.id AS tier_id,

      CASE
        WHEN us.status <> 'active' THEN us.status::text
        WHEN us.expired_at <= CURRENT_TIMESTAMP THEN 'expired'
        WHEN us.started_at > CURRENT_TIMESTAMP THEN 'upcoming'
        WHEN us.started_at <= CURRENT_TIMESTAMP
          AND us.expired_at > CURRENT_TIMESTAMP THEN 'active'
        ELSE 'inactive'
      END AS effective_status,

      jsonb_build_object(
        'id', us.id,
        'status', us.status,
        'effectiveStatus', CASE
          WHEN us.status <> 'active' THEN us.status::text
          WHEN us.expired_at <= CURRENT_TIMESTAMP THEN 'expired'
          WHEN us.started_at > CURRENT_TIMESTAMP THEN 'upcoming'
          WHEN us.started_at <= CURRENT_TIMESTAMP
            AND us.expired_at > CURRENT_TIMESTAMP THEN 'active'
          ELSE 'inactive'
        END,
        'startedAt', us.started_at,
        'expiredAt', us.expired_at,
        'tier', jsonb_build_object(
          'id', st.id,
          'name', st.name,
          'slug', st.slug,
          'level', st.level
        )
      ) AS subscription

    FROM user_subscriptions us

    INNER JOIN subscription_tiers st
      ON st.id = us.subscription_tier_id

    WHERE us.user_id = u.id

    ORDER BY
      (
        us.status = 'active'
        AND us.started_at <= CURRENT_TIMESTAMP
        AND us.expired_at > CURRENT_TIMESTAMP
      ) DESC,
      us.started_at DESC NULLS LAST,
      us.created_at DESC,
      us.id DESC

    LIMIT 1
  ) selected_subscription ON true
`;
export const findUserByEmail = async (email) => {
  const query = `
    SELECT
      id,
      name,
      email,
      password,
      role,
      is_active,
      email_verified_at,
      email_verification_required,
      auth_version,
      created_at,
      updated_at
    FROM users
    WHERE public.normalize_user_email(email) = public.normalize_user_email($1)
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [normalizeEmail(email)]);

  if (!rows[0]) {
    return null;
  }

  return rows[0];
};

export const findUserForAuthentication = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, role, is_active, email_verified_at, email_verification_required, auth_version FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows[0] ?? null;
};

export const findUserById = async (id) => {
  const query = `
    SELECT
      id,
      name,
      email,
      role,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [id]);

  if (!rows[0]) {
    return null;
  }

  return createUserModel({
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    role: rows[0].role,
    createdAt: rows[0].created_at,
    updatedAt: rows[0].updated_at
  });
};

export const createUser = async ({
  name,
  email,
  passwordHash,
  role = 'user',
  emailVerifiedAt = null
}, client = pool) => {
  const query = `
    INSERT INTO users (
      name,
      email,
      password,
      role,
      email_verified_at
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      name,
      email,
      role,
      auth_version,
      created_at,
      updated_at
  `;

  const values = [
    name,
    normalizeEmail(email),
    passwordHash,
    role,
    emailVerifiedAt
  ];

  const { rows } = await client.query(query, values);

  return createUserModel({
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    role: rows[0].role,
    createdAt: rows[0].created_at,
    updatedAt: rows[0].updated_at
  });
};

export const findUsers = async ({
  page = 1,
  limit = 20,
  search = '',
  role,
  startDate,
  endDate,
  tierId
}) => {
  const parsedPage = Math.max(
    1,
    parseInt(page, 10) || 1
  );

  const parsedLimit = Math.min(
    100,
    Math.max(1, parseInt(limit, 10) || 20)
  );

  const offset = (parsedPage - 1) * parsedLimit;
  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`
      (
        u.name ILIKE $${values.length}
        OR u.email ILIKE $${values.length}
      )
    `);
  }

  if (role) {
    values.push(role);
    conditions.push(`u.role = $${values.length}`);
  }

  if (startDate) {
    values.push(startDate);

    const startDateIndex = values.length;
    if (endDate) {
      values.push(endDate);
    }

    conditions.push(`
      EXISTS (
        SELECT 1
        FROM user_subscriptions filter_us
        WHERE filter_us.user_id = u.id
          AND filter_us.started_at >= $${startDateIndex}::date
          ${
            endDate
              ? `AND filter_us.started_at < ($${startDateIndex + 1}::date + INTERVAL '1 day')`
              : ''
          }
      )
    `);
  } else if (endDate) {
    values.push(endDate);
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM user_subscriptions filter_us
        WHERE filter_us.user_id = u.id
          AND filter_us.started_at < ($${values.length}::date + INTERVAL '1 day')
      )
    `);
  }

  if (tierId !== undefined && tierId !== null && tierId !== '') {
    const parsedTierId = Number(tierId);
    if (!Number.isSafeInteger(parsedTierId) || parsedTierId < 1) {
      throw new Error('Invalid subscription tier ID');
    }
    values.push(parsedTierId);
    const tierIndex = values.length;
    if (parsedTierId === 1) {
      conditions.push(`
        (
          u.tier_id = $${tierIndex}
          OR u.tier_id IS NULL
        )
      `);
    } else {
      conditions.push(`u.tier_id = $${tierIndex}`);
    }
  }
  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';
  const countQuery = `
    WITH user_records AS (
      ${selectedSubscriptionQuery}
    )
    SELECT COUNT(*)::int AS total
    FROM user_records u
    ${whereClause}
  `;

  const dataValues = [...values];
  dataValues.push(parsedLimit);
  const limitIndex = dataValues.length;
  dataValues.push(offset);
  const offsetIndex = dataValues.length;
  const dataQuery = `
    WITH user_records AS (
      ${selectedSubscriptionQuery}
    ),
    filtered_users AS (
      SELECT *
      FROM user_records u
      ${whereClause}
    )
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.created_at,
      u.updated_at,
      u.subscription

    FROM filtered_users u

    ORDER BY
      CASE u.effective_status
        WHEN 'active' THEN 1
        WHEN 'upcoming' THEN 2
        WHEN 'expired' THEN 3
        WHEN 'cancelled' THEN 4
        WHEN 'canceled' THEN 4
        WHEN 'inactive' THEN 5
        ELSE 6
      END ASC,
      u.created_at DESC,
      u.id DESC

    LIMIT $${limitIndex}
    OFFSET $${offsetIndex}
  `;
  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, values),
    pool.query(dataQuery, dataValues)
  ]);
  return {
    rows: dataResult.rows.map((row) => ({
      ...createUserModel({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }),
      subscription: row.subscription ?? null
    })),
    total: countResult.rows[0].total,
    page: parsedPage,
    limit: parsedLimit
  };
};

export const findUserSubscriptionDistribution = async ({
  startDate,
  endDate
}) => {
  const values = [];
  const conditions = [];

  if (startDate) {
    values.push(startDate);

    const startDateIndex = values.length;

    if (endDate) {
      values.push(endDate);
    }

    conditions.push(`
      EXISTS (
        SELECT 1
        FROM user_subscriptions filter_us
        WHERE filter_us.user_id = u.id
          AND filter_us.started_at >= $${startDateIndex}::date
          ${
            endDate
              ? `AND filter_us.started_at < ($${startDateIndex + 1}::date + INTERVAL '1 day')`
              : ''
          }
      )
    `);
  } else if (endDate) {
    values.push(endDate);

    conditions.push(`
      EXISTS (
        SELECT 1
        FROM user_subscriptions filter_us
        WHERE filter_us.user_id = u.id
          AND filter_us.started_at < ($${values.length}::date + INTERVAL '1 day')
      )
    `);
  }

  const whereClause = conditions.length
    ? `AND ${conditions.join(' AND ')}`
    : '';

  const { rows } = await pool.query(
    `
      WITH user_records AS (
        ${selectedSubscriptionQuery}
      ),

      filtered_users AS (
        SELECT *
        FROM user_records u
        WHERE u.role = 'user'
        ${whereClause}
      ),

      tier_distribution AS (
        SELECT
          COALESCE(tier_id, 1) AS tier_id,

          COUNT(*)::int AS total,

          COUNT(*) FILTER (
            WHERE effective_status = 'active'
          )::int AS active,

          COUNT(*) FILTER (
            WHERE effective_status = 'upcoming'
          )::int AS upcoming,

          COUNT(*) FILTER (
            WHERE effective_status = 'expired'
          )::int AS expired,

          COUNT(*) FILTER (
            WHERE effective_status IN ('cancelled', 'canceled')
          )::int AS cancelled

        FROM filtered_users
        GROUP BY COALESCE(tier_id, 1)
      )

      SELECT
        'all' AS "tierId",
        'All Users' AS "tierName",
        'all' AS "tierSlug",

        COUNT(*)::int AS total,

        COUNT(*) FILTER (
          WHERE effective_status = 'active'
        )::int AS active,

        COUNT(*) FILTER (
          WHERE effective_status = 'upcoming'
        )::int AS upcoming,

        COUNT(*) FILTER (
          WHERE effective_status = 'expired'
        )::int AS expired,

        COUNT(*) FILTER (
          WHERE effective_status IN ('cancelled', 'canceled')
        )::int AS cancelled,

        0 AS "tierLevel"

      FROM filtered_users

      UNION ALL

      SELECT
        st.id::text AS "tierId",
        st.name AS "tierName",
        st.slug AS "tierSlug",

        COALESCE(td.total, 0)::int AS total,
        COALESCE(td.active, 0)::int AS active,
        COALESCE(td.upcoming, 0)::int AS upcoming,
        COALESCE(td.expired, 0)::int AS expired,
        COALESCE(td.cancelled, 0)::int AS cancelled,

        st.level AS "tierLevel"

      FROM subscription_tiers st

      LEFT JOIN tier_distribution td
        ON td.tier_id = st.id

      ORDER BY "tierLevel" ASC, "tierId" ASC
    `,
    values
  );

  return rows;
};
