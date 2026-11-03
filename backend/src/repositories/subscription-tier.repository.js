import { pool } from '../config/database.js';

export const findActiveSubscriptionTiers = async () => {
  const { rows } = await pool.query(`
    SELECT
      st.id,
      st.name,
      st.slug,
      st.description,
      st.price,
      st.duration_days,
      st.level,
      st.is_active,
      st.created_at,
      st.updated_at,

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', stf.id,
              'featureText', stf.feature_text,
              'sortOrder', stf.sort_order
            )
            ORDER BY stf.sort_order ASC, stf.id ASC
          )
          FROM subscription_tier_features stf
          WHERE stf.subscription_tier_id = st.id
        ),
        '[]'::json
      ) AS features

    FROM subscription_tiers st
    WHERE st.is_active = true
    ORDER BY st.level ASC, st.id ASC
  `);

  return rows;
};