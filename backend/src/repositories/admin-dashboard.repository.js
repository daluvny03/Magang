import { pool } from '../config/database.js';

// Mengambil statistik dashboard dan performa penjualan subscription
// dalam satu query agar data berasal dari snapshot database yang sama.
export const findAdminDashboard = async () => {
  const { rows } = await pool.query(`
    WITH date_bounds AS (
      SELECT
        date_trunc(
          'month',
          CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta'
        ) AS current_month_start
    ),

    period_bounds AS (
      SELECT
        current_month_start - INTERVAL '5 months'
          AS current_period_start,

        current_month_start - INTERVAL '11 months'
          AS previous_period_start,

        current_month_start
          AS current_period_end,

        current_month_start + INTERVAL '1 month'
          AS next_month_start
      FROM date_bounds
    ),

    paid_payments AS (
      SELECT
        p.subscription_tier_id,
        p.paid_at,
        date_trunc(
          'month',
          p.paid_at AT TIME ZONE 'Asia/Jakarta'
        ) AS month_start
      FROM payments p
      CROSS JOIN period_bounds pb
      WHERE p.status = 'paid'
        AND p.paid_at IS NOT NULL
        AND p.paid_at >= (
          pb.previous_period_start AT TIME ZONE 'Asia/Jakarta'
        )
        AND p.paid_at < (
          pb.next_month_start AT TIME ZONE 'Asia/Jakarta'
        )
    ),

    sales_summary AS (
      SELECT
        COUNT(*) FILTER (
          WHERE pp.month_start >= pb.current_period_start
        )::int AS total_transactions,

        COUNT(*) FILTER (
          WHERE pp.month_start < pb.current_period_start
        )::int AS previous_total_transactions
      FROM paid_payments pp
      CROSS JOIN period_bounds pb
    ),

    tier_sales AS (
      SELECT
        st.id,
        st.name,
        st.slug
      FROM paid_payments pp
      JOIN subscription_tiers st
        ON st.id = pp.subscription_tier_id
      CROSS JOIN period_bounds pb
      WHERE pp.month_start >= pb.current_period_start
      GROUP BY st.id, st.name, st.slug
    ),

    monthly_sales AS (
      SELECT
        pp.month_start,
        COUNT(*)::int AS total_transactions
      FROM paid_payments pp
      CROSS JOIN period_bounds pb
      WHERE pp.month_start >= pb.current_period_start
      GROUP BY pp.month_start
    ),

    monthly_tier_sales AS (
      SELECT
        pp.month_start,
        pp.subscription_tier_id,
        COUNT(*)::int AS transaction_count
      FROM paid_payments pp
      CROSS JOIN period_bounds pb
      WHERE pp.month_start >= pb.current_period_start
      GROUP BY pp.month_start, pp.subscription_tier_id
    ),

    monthly_rows AS (
      SELECT
        months.month_start,
        COALESCE(ms.total_transactions, 0)::int
          AS total_transactions,

        COALESCE(
          (
            SELECT jsonb_object_agg(
              mts.subscription_tier_id::text,
              mts.transaction_count
            )
            FROM monthly_tier_sales mts
            WHERE mts.month_start = months.month_start
          ),
          '{}'::jsonb
        ) AS tier_counts

      FROM period_bounds pb
      CROSS JOIN LATERAL generate_series(
        pb.current_period_start,
        pb.current_period_end,
        INTERVAL '1 month'
      ) AS months(month_start)

      LEFT JOIN monthly_sales ms
        ON ms.month_start = months.month_start
    ),

    subscription_sales AS (
      SELECT
        jsonb_build_object(
          'summary',
          jsonb_build_object(
            'totalTransactions',
            ss.total_transactions,

            'previousTotalTransactions',
            ss.previous_total_transactions,

            'growthPercentage',
            CASE
              WHEN ss.previous_total_transactions = 0 THEN NULL
              ELSE ROUND(
                (
                  (
                    ss.total_transactions::numeric
                    - ss.previous_total_transactions::numeric
                  )
                  / ss.previous_total_transactions::numeric
                ) * 100,
                2
              )
            END
          ),

          'tiers',
          COALESCE(
            (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'id', ts.id::text,
                  'name', ts.name,
                  'slug', ts.slug
                )
                ORDER BY ts.name
              )
              FROM tier_sales ts
            ),
            '[]'::jsonb
          ),

          'monthly',
          COALESCE(
            (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'period',
                  to_char(mr.month_start, 'YYYY-MM'),

                  'totalTransactions',
                  mr.total_transactions,

                  'tierCounts',
                  mr.tier_counts
                )
                ORDER BY mr.month_start
              )
              FROM monthly_rows mr
            ),
            '[]'::jsonb
          )
        ) AS data
      FROM sales_summary ss
    )

    SELECT
      (
        SELECT json_build_object(
          'total', COUNT(*)::int,
          'published', COUNT(*) FILTER (
            WHERE status = 'published'
          )::int,
          'draft', COUNT(*) FILTER (
            WHERE status = 'draft'
          )::int,
          'archived', COUNT(*) FILTER (
            WHERE status = 'archived'
          )::int
        )
        FROM tryout_packages
      ) AS tryouts,

      (
        SELECT json_build_object(
          'total', COUNT(*)::int,
          'active', COUNT(*) FILTER (
            WHERE is_active = true
          )::int
        )
        FROM questions
      ) AS questions,

      (
        SELECT json_build_object(
          'total', COUNT(*)::int,
          'active', COUNT(*) FILTER (
            WHERE is_active = true
          )::int
        )
        FROM categories
      ) AS categories,

      (
        SELECT json_build_object(
          'total', COUNT(*)::int,
          'participants', COUNT(*) FILTER (
            WHERE role = 'user'
          )::int
        )
        FROM users
      ) AS users,

      (
        SELECT data
        FROM subscription_sales
      ) AS "subscriptionSales"
  `);

  return rows[0];
};