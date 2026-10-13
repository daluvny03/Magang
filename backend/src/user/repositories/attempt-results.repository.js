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

export const findCompletedAttemptResult = async ({
  attemptId,
  userId,
}) => {
  const result = await pool.query(
    `
      SELECT
        ta.id,
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
        tp.name AS tryout_name,
        tp.duration_minutes,

        (
          SELECT COUNT(*)::integer
          FROM tryout_package_questions tpq
          WHERE tpq.tryout_package_id =
            ta.tryout_package_id
        ) AS total_questions

      FROM tryout_attempts ta

      INNER JOIN tryout_packages tp
        ON tp.id = ta.tryout_package_id

      WHERE ta.id = $1
        AND ta.user_id = $2
        AND ta.status = 'completed'

      LIMIT 1
    `,
    [attemptId, userId]
  )

  return result.rows[0] ?? null
}


export const findAttemptCategoryResults = async ({
  attemptId,
  userId,
}) => {
  const result = await pool.query(
    `
      WITH RECURSIVE category_tree AS (
        SELECT
          id,
          parent_id,
          name,
          slug,
          id AS root_id,
          name AS root_name,
          slug AS root_slug

        FROM categories
        WHERE parent_id IS NULL
          AND slug IN ('twk', 'tiu', 'tkp')

        UNION ALL

        SELECT
          c.id,
          c.parent_id,
          c.name,
          c.slug,
          ct.root_id,
          ct.root_name,
          ct.root_slug

        FROM categories c

        INNER JOIN category_tree ct
          ON c.parent_id = ct.id
      ),

      category_stats AS (
        SELECT
          ct.root_id,
          ct.root_name,
          ct.root_slug,

          COUNT(tpq.question_id)::integer
            AS total_questions,

          COUNT(ta_ans.selected_answer)::integer
            AS answered,

          COUNT(*) FILTER (
            WHERE ta_ans.selected_answer IS NOT NULL
              AND ta_ans.is_correct = true
          )::integer AS correct_answers,

          COUNT(*) FILTER (
            WHERE ta_ans.selected_answer IS NOT NULL
              AND ta_ans.is_correct = false
          )::integer AS wrong_answers,

          COALESCE(
            SUM(ta_ans.score),
            0
          ) AS total_score

        FROM tryout_attempts ta

        INNER JOIN tryout_package_questions tpq
          ON tpq.tryout_package_id =
            ta.tryout_package_id

        INNER JOIN questions q
          ON q.id = tpq.question_id

        INNER JOIN category_tree ct
          ON ct.id = q.category_id

        LEFT JOIN tryout_answers ta_ans
          ON ta_ans.attempt_id = ta.id
          AND ta_ans.question_id = q.id

        WHERE ta.id = $1
          AND ta.user_id = $2
          AND ta.status = 'completed'

        GROUP BY
          ct.root_id,
          ct.root_name,
          ct.root_slug
      )

      SELECT
        root_slug AS slug,
        root_name AS name,
        total_questions,
        answered,
        correct_answers,
        wrong_answers,

        (
          total_questions - answered
        )::integer AS unanswered,

        total_score

      FROM category_stats

      ORDER BY
        CASE root_slug
          WHEN 'twk' THEN 1
          WHEN 'tiu' THEN 2
          WHEN 'tkp' THEN 3
          ELSE 4
        END
    `,
    [attemptId, userId]
  )

  return result.rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    totalQuestions: Number(row.total_questions),
    answered: Number(row.answered),
    correctAnswers: Number(row.correct_answers),
    wrongAnswers: Number(row.wrong_answers),
    unanswered: Number(row.unanswered),
    totalScore: Number(row.total_score),
  }))
}
