
// CAT timestamps follow the PostgreSQL session timezone used by existing writes.
// Return timestamptz so pg does not reinterpret them using the Node process timezone.
import { pool } from '../../config/database.js'

export const findCompletedAttemptsByUser = async ({
  userId,
  limit,
  offset,
}) => {
  const query = `
    SELECT
      ta.id AS "attemptId",
      ta.tryout_package_id AS "tryoutId",
      tp.name AS "tryoutName",
      ta.completed_at::timestamptz AS "completedAt",
      ta.total_score AS "totalScore",

      CASE
        WHEN jsonb_typeof(
          ta.result_snapshot -> 'maximumScore'
        ) = 'number'
        THEN (
          ta.result_snapshot ->> 'maximumScore'
        )::numeric
        ELSE NULL
      END AS "maximumScore",

      CASE
        WHEN ta.result_snapshot ->> 'passingStatus'
          IN ('passed', 'failed', 'not_evaluated')
        THEN ta.result_snapshot ->> 'passingStatus'
        ELSE 'not_evaluated'
      END AS "passingStatus"

    FROM tryout_attempts ta

    INNER JOIN tryout_packages tp
      ON tp.id = ta.tryout_package_id

    WHERE ta.user_id = $1
      AND ta.status = 'completed'

    ORDER BY
      ta.completed_at DESC,
      ta.id DESC

    LIMIT $2
    OFFSET $3
  `

  const { rows } = await pool.query(query, [
    userId,
    limit,
    offset,
  ])

  return rows.map((row) => ({
    attemptId: row.attemptId,
    tryoutId: row.tryoutId,
    tryoutName: row.tryoutName,
    completedAt: row.completedAt,
    totalScore: Number(row.totalScore ?? 0),
    maximumScore:
      row.maximumScore == null
        ? null
        : Number(row.maximumScore),
    passingStatus: row.passingStatus,
  }))
}

export const countCompletedAttemptsByUser =
  async (userId) => {
    const { rows } = await pool.query(
      `
        SELECT COUNT(*)::integer AS total
        FROM tryout_attempts
        WHERE user_id = $1
          AND status = 'completed'
      `,
      [userId]
    )

    return rows[0].total
  }
