// CAT timestamps follow the PostgreSQL session timezone used by existing writes.
// Return timestamptz so pg does not reinterpret them using the Node process timezone.
import { pool } from '../../config/database.js'

export const findAttemptForAnalysis = async ({
  attemptId,
  userId,
}) => {
  const { rows } = await pool.query(
    `
      SELECT
        ta.id,
        ta.user_id,
        ta.tryout_package_id,
        tp.name AS tryout_name,
        ta.status,
        ta.started_at::timestamptz AS started_at,
        ta.completed_at::timestamptz AS completed_at,
        ta.total_score,
        ta.correct_answers,
        ta.wrong_answers,
        ta.unanswered,
        ta.exam_snapshot,
        ta.result_snapshot,

        EXTRACT(
          EPOCH FROM (
            ta.completed_at - ta.started_at
          )
        )::integer AS duration_seconds

      FROM tryout_attempts ta

      INNER JOIN tryout_packages tp
        ON tp.id = ta.tryout_package_id

      WHERE ta.id = $1
        AND ta.user_id = $2
    `,
    [attemptId, userId]
  )

  return rows[0] ?? null
}


export const findAttemptAnalysisQuestions = async ({
  attemptId,
  tryoutPackageId,
}) => {
  const { rows } = await pool.query(
    `
      WITH RECURSIVE category_hierarchy AS (
        SELECT
          id,
          parent_id,
          slug AS root_slug
        FROM categories
        WHERE parent_id IS NULL

        UNION ALL

        SELECT
          c.id,
          c.parent_id,
          ch.root_slug
        FROM categories c
        INNER JOIN category_hierarchy ch
          ON c.parent_id = ch.id
      )

      SELECT
        q.id AS question_id,
        tpq.question_order,
        ch.root_slug AS category_slug,

        q.question_text,
        q.question_image,
        q.answer_options,
        q.correct_answer,
        q.explanation,
        q.score AS question_score,

        ta.selected_answer,
        ta.score AS earned_score,
        ta.is_correct

      FROM tryout_package_questions tpq

      INNER JOIN questions q
        ON q.id = tpq.question_id

      INNER JOIN category_hierarchy ch
        ON ch.id = q.category_id

      LEFT JOIN tryout_answers ta
        ON ta.question_id = q.id
        AND ta.attempt_id = $1

      WHERE tpq.tryout_package_id = $2

      ORDER BY
        tpq.question_order ASC,
        q.id ASC
    `,
    [attemptId, tryoutPackageId]
  )

  return rows
}


export const findAttemptAnalysisProgress = async ({
  attemptId,
}) => {
  const { rows } = await pool.query(
    `
      SELECT
        question_id,
        COALESCE(
          time_spent_seconds,
          0
        ) AS recorded_time_seconds,
        COALESCE(
          visit_count,
          0
        ) AS visit_count

      FROM tryout_question_progress

      WHERE attempt_id = $1
    `,
    [attemptId]
  )

  return rows
}
