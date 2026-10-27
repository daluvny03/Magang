
import { pool } from '../../config/database.js'

const SCORE_PERCENTAGE_SQL = `
  CASE
    WHEN jsonb_typeof(
      ta.result_snapshot -> 'maximumScore'
    ) = 'number'
    THEN (
      ta.result_snapshot ->> 'maximumScore'
    )::numeric
    ELSE NULL
  END
`

const PASSING_STATUS_SQL = `
  CASE
    WHEN ta.result_snapshot ->> 'passingStatus'
      IN ('passed', 'failed', 'not_evaluated')
    THEN ta.result_snapshot ->> 'passingStatus'
    ELSE 'not_evaluated'
  END
`

export const findAttemptStatisticsSummary = async (
  userId
) => {
  const { rows } = await pool.query(
    `
      WITH completed_attempts AS (
        SELECT
          ta.total_score,
          ${SCORE_PERCENTAGE_SQL} AS maximum_score,
          ${PASSING_STATUS_SQL} AS passing_status

        FROM tryout_attempts ta

        WHERE ta.user_id = $1
          AND ta.status = 'completed'
      ),
      calculated AS (
        SELECT
          passing_status,
          CASE
            WHEN maximum_score > 0
              AND total_score IS NOT NULL
              AND total_score >= 0
            THEN (
              total_score::numeric /
              maximum_score
            ) * 100
            ELSE NULL
          END AS score_percentage

        FROM completed_attempts
      )

      SELECT
        COUNT(*)::integer AS "totalAttempts",

        ROUND(
          AVG(score_percentage),
          2
        ) AS "averageScorePercentage",

        ROUND(
          MAX(score_percentage),
          2
        ) AS "bestScorePercentage",

        COUNT(*) FILTER (
          WHERE passing_status = 'passed'
        )::integer AS "passedAttempts",

        COUNT(*) FILTER (
          WHERE passing_status = 'failed'
        )::integer AS "failedAttempts",

        COUNT(*) FILTER (
          WHERE passing_status = 'not_evaluated'
        )::integer AS "notEvaluatedAttempts"

      FROM calculated
    `,
    [userId]
  )

  return rows[0]
}

export const findAttemptStatisticsTrend = async ({
  userId,
  limit = 20,
}) => {
  const { rows } = await pool.query(
    `
      WITH recent_attempts AS (
        SELECT
          ta.id AS attempt_id,
          tp.name AS tryout_name,
          ta.completed_at::timestamptz AS completed_at,
          ta.total_score,
          ${SCORE_PERCENTAGE_SQL} AS maximum_score,
          ${PASSING_STATUS_SQL} AS passing_status

        FROM tryout_attempts ta

        INNER JOIN tryout_packages tp
          ON tp.id = ta.tryout_package_id

        WHERE ta.user_id = $1
          AND ta.status = 'completed'

        ORDER BY
          ta.completed_at DESC,
          ta.id DESC

        LIMIT $2
      )

      SELECT
        attempt_id AS "attemptId",
        tryout_name AS "tryoutName",
        completed_at AS "completedAt",
        total_score AS "totalScore",
        maximum_score AS "maximumScore",

        CASE
          WHEN maximum_score > 0
            AND total_score IS NOT NULL
            AND total_score >= 0
          THEN ROUND(
            (
              total_score::numeric /
              maximum_score
            ) * 100,
            2
          )
          ELSE NULL
        END AS "scorePercentage",

        passing_status AS "passingStatus"

      FROM recent_attempts

      ORDER BY
        completed_at ASC,
        attempt_id ASC
    `,
    [userId, limit]
  )

  return rows
}
