import { pool } from '../../config/database.js'

const mapCompletedAttempt = (row) => {
  if (!row) return null

  return {
    id: row.id,
    userId: row.user_id,
    tryoutPackageId: row.tryout_package_id,
    attemptNumber: row.attempt_number,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    expiresAt: row.expires_at,
    totalScore: Number(row.total_score),
    correctAnswers: Number(
      row.correct_answers
    ),
    wrongAnswers: Number(
      row.wrong_answers
    ),
    unanswered: Number(row.unanswered),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const finishTryoutAttempt = async ({
  attemptId,
  userId,
}) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const attemptResult =
      await client.query(
        `
          SELECT
            id,
            user_id,
            tryout_package_id,
            attempt_number,
            status,
            started_at,
            completed_at,
            expires_at

          FROM tryout_attempts

          WHERE id = $1
            AND user_id = $2

          FOR UPDATE
        `,
        [
          attemptId,
          userId,
        ]
      )

    const attempt =
      attemptResult.rows[0]

    if (!attempt) {
      await client.query('ROLLBACK')

      return {
        attempt: null,
        reason: 'not_found',
      }
    }

    if (attempt.status === 'completed') {
      const completedResult =
        await client.query(
          `
            SELECT
              id,
              user_id,
              tryout_package_id,
              attempt_number,
              status,
              started_at,
              completed_at,
              expires_at,
              total_score,
              correct_answers,
              wrong_answers,
              unanswered,
              created_at,
              updated_at

            FROM tryout_attempts

            WHERE id = $1
              AND user_id = $2
          `,
          [
            attemptId,
            userId,
          ]
        )

      await client.query('COMMIT')

      return {
        attempt: mapCompletedAttempt(
          completedResult.rows[0]
        ),
        reason: 'already_completed',
      }
    }

    if (
      attempt.status !== 'in_progress'
    ) {
      await client.query('ROLLBACK')

      return {
        attempt,
        reason: attempt.status,
      }
    }

    const result =
      await client.query(
        `
          WITH package_question_count AS (
            SELECT
              COUNT(*)::integer
                AS total_questions

            FROM tryout_package_questions

            WHERE tryout_package_id = $1
          ),

          answer_stats AS (
            SELECT
              COUNT(*) FILTER (
                WHERE selected_answer
                  IS NOT NULL
              )::integer
                AS answered,

              COUNT(*) FILTER (
                WHERE is_correct = true
              )::integer
                AS correct_answers,

              COUNT(*) FILTER (
                WHERE is_correct = false
              )::integer
                AS wrong_answers,

              COALESCE(
                SUM(score),
                0
              ) AS total_score

            FROM tryout_answers

            WHERE attempt_id = $2
          )

          UPDATE tryout_attempts ta

          SET
            status = 'completed',

            completed_at =
              CURRENT_TIMESTAMP,

            total_score =
              stats.total_score,

            correct_answers =
              stats.correct_answers,

            wrong_answers =
              stats.wrong_answers,

            unanswered =
              GREATEST(
                package.total_questions
                  - stats.answered,
                0
              ),

            updated_at =
              CURRENT_TIMESTAMP

          FROM
            package_question_count package,
            answer_stats stats

          WHERE ta.id = $2
            AND ta.user_id = $3

          RETURNING
            ta.id,
            ta.user_id,
            ta.tryout_package_id,
            ta.attempt_number,
            ta.status,
            ta.started_at,
            ta.completed_at,
            ta.expires_at,
            ta.total_score,
            ta.correct_answers,
            ta.wrong_answers,
            ta.unanswered,
            ta.created_at,
            ta.updated_at
        `,
        [
          attempt.tryout_package_id,
          attemptId,
          userId,
        ]
      )

    await client.query('COMMIT')

    return {
      attempt: mapCompletedAttempt(
        result.rows[0]
      ),
      reason: 'completed',
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}