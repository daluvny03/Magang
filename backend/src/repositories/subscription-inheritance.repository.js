
import { pool } from '../config/database.js'

export const findInheritedTierIds = async (
  tierId,
  client = pool
) => {
  const { rows } = await client.query(
    `
      WITH RECURSIVE inherited AS (
        SELECT child_tier_id
        FROM subscription_tier_inheritances
        WHERE parent_tier_id = $1

        UNION

        SELECT sti.child_tier_id
        FROM subscription_tier_inheritances sti
        INNER JOIN inherited i
          ON sti.parent_tier_id = i.child_tier_id
      )
      SELECT child_tier_id
      FROM inherited
      ORDER BY child_tier_id
    `,
    [tierId]
  )

  return rows.map((row) => String(row.child_tier_id))
}

export const findDirectInheritedTiers = async (
  tierId,
  client = pool
) => {
  const { rows } = await client.query(
    `
      SELECT
        st.id,
        st.name,
        st.slug,
        st.level
      FROM subscription_tier_inheritances sti
      INNER JOIN subscription_tiers st
        ON st.id = sti.child_tier_id
      WHERE sti.parent_tier_id = $1
      ORDER BY st.level DESC, st.id ASC
    `,
    [tierId]
  )

  return rows
}

export const replaceTierInheritances = async (
  parentTierId,
  childTierIds,
  client
) => {
  await client.query(
    `
      DELETE FROM subscription_tier_inheritances
      WHERE parent_tier_id = $1
    `,
    [parentTierId]
  )

  if (childTierIds.length === 0) {
    return
  }

  await client.query(
    `
      INSERT INTO subscription_tier_inheritances (
        parent_tier_id,
        child_tier_id
      )
      SELECT $1::bigint, child_id
      FROM unnest($2::bigint[]) AS child_id
    `,
    [parentTierId, childTierIds]
  )
}

export const canUpgradeSubscription = async (
  currentTierId,
  targetTierId,
  client = pool
) => {
  const { rows } = await client.query(
    `
      WITH RECURSIVE inherited AS (
        SELECT child_tier_id
        FROM subscription_tier_inheritances
        WHERE parent_tier_id = $1

        UNION

        SELECT sti.child_tier_id
        FROM subscription_tier_inheritances sti
        INNER JOIN inherited i
          ON sti.parent_tier_id = i.child_tier_id
      )
      SELECT EXISTS (
        SELECT 1
        FROM inherited
        WHERE child_tier_id = $2
      ) AS allowed
    `,
    [targetTierId, currentTierId]
  )

  return rows[0].allowed
}


export const findAllDirectTierInheritances = async (
  client = pool
) => {
  const { rows } = await client.query(`
    SELECT
      sti.parent_tier_id,
      child.id,
      child.name,
      child.slug,
      child.level
    FROM subscription_tier_inheritances sti
    INNER JOIN subscription_tiers child
      ON child.id = sti.child_tier_id
    ORDER BY
      sti.parent_tier_id ASC,
      child.level DESC,
      child.id ASC
  `);

  return rows;
};
