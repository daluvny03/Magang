
import { pool } from '../config/database.js';

const TIER_COLUMNS = `
  id,
  name,
  slug,
  description,
  price,
  duration_days,
  duration_value,
  duration_unit,
  level,
  is_active,
  created_at,
  updated_at
`;

export const findAllSubscriptionTiers = async () => {
  const { rows } = await pool.query(`
    SELECT ${TIER_COLUMNS}
    FROM subscription_tiers
    ORDER BY level ASC, id ASC
  `);

  return rows;
};

export const findSubscriptionTierById = async (
  id,
  client = pool
) => {
  const { rows } = await client.query(
    `
      SELECT ${TIER_COLUMNS}
      FROM subscription_tiers
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  )

  return rows[0] || null
}

export const createSubscriptionTier = async (
  {
    name,
    slug,
    description,
    price,
    durationDays,
    durationValue,
    durationUnit,
    level,
  },
  client = pool
) => {
  const { rows } = await client.query(
    `
      INSERT INTO subscription_tiers (
        name,
        slug,
        description,
        price,
        duration_days,
        duration_value,
        duration_unit,
        level,
        is_active
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, true
      )
      RETURNING ${TIER_COLUMNS}
    `,
    [
      name,
      slug,
      description,
      price,
      durationDays,
      durationValue,
      durationUnit,
      level,
    ]
  )

  return rows[0]
}

export const updateSubscriptionTier = async (
  id,
  {
    name,
    description,
    price,
    durationDays,
    durationValue,
    durationUnit,
    level,
  },
  client = pool
) => {
  const { rows } = await client.query(
    `
      UPDATE subscription_tiers
      SET
        name = $2,
        description = $3,
        price = $4,
        duration_days = $5,
        duration_value = $6,
        duration_unit = $7,
        level = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
        AND slug <> 'free'
      RETURNING ${TIER_COLUMNS}
    `,
    [
      id,
      name,
      description,
      price,
      durationDays,
      durationValue,
      durationUnit,
      level,
    ]
  )

  return rows[0] || null
}

export const updateSubscriptionTierStatus = async (
  id,
  isActive
) => {
  const { rows } = await pool.query(
    `
      UPDATE subscription_tiers
      SET
        is_active = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
        AND slug <> 'free'
      RETURNING ${TIER_COLUMNS}
    `,
    [id, isActive]
  );

  return rows[0] || null;
};

export const withSubscriptionTierTransaction = async (
  callback
) => {
  const client = await pool.connect()

  let transactionFailed = false

  try {
    await client.query('BEGIN')

    const result = await callback(client)

    await client.query('COMMIT')

    return result
  } catch (error) {
    transactionFailed = true

    try {
      await client.query('ROLLBACK')
      transactionFailed = false
    } catch {
      // Jangan gunakan kembali koneksi
      // apabila rollback gagal.
    }

    throw error
  } finally {
    client.release(transactionFailed)
  }
}