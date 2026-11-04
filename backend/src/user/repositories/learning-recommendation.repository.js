
import { pool } from '../../config/database.js'

// ==========================================
// 1. AMBIL TRYOUT COMPLETED TERBARU
// ==========================================

export const findLatestCompletedRecommendationAttempt = async ({
  userId,
}) => {
  const { rows } = await pool.query(
    `
      SELECT
        ta.id AS attempt_id,
        ta.user_id,
        ta.tryout_package_id,
        tp.name AS tryout_name,
        ta.completed_at::timestamptz AS completed_at,
        ta.total_score,
        ta.correct_answers,
        ta.wrong_answers,
        ta.unanswered

      FROM tryout_attempts ta

      INNER JOIN tryout_packages tp
        ON tp.id = ta.tryout_package_id

      WHERE ta.user_id = $1
        AND ta.status = 'completed'

      ORDER BY
        ta.completed_at DESC NULLS LAST,
        ta.id DESC

      LIMIT 1
    `,
    [userId]
  )

  return rows[0] ?? null
}

// ==========================================
// 2. AMBIL DATA SOAL, KATEGORI, DAN WAKTU
// ==========================================

export const findLatestAttemptRecommendationQuestions = async ({
  attemptId,
  tryoutPackageId,
}) => {
  const { rows } = await pool.query(
    `
      WITH RECURSIVE category_hierarchy AS (
        SELECT
          c.id,
          c.parent_id,
          c.slug AS root_category_slug,
          c.name AS category_name,
          c.name::text AS category_path

        FROM categories c

        WHERE c.parent_id IS NULL

        UNION ALL

        SELECT
          c.id,
          c.parent_id,
          ch.root_category_slug AS category_slug,
          c.name AS category_name,
          ch.category_path || ' / ' || c.name

        FROM categories c

        INNER JOIN category_hierarchy ch
          ON c.parent_id = ch.id
      )

      SELECT
        q.id AS question_id,
        tpq.question_order,

        q.category_id,
        ch.category_name,
        ch.category_path,
        ch.root_category_slug AS category_slug,

        q.answer_options,
        q.score AS question_score,

        ta.selected_answer,
        (ta.selected_answer IS NOT NULL) AS is_answered,
        ta.score AS earned_score,
        ta.is_correct,

        COALESCE(tqp.time_spent_seconds, 0)
            AS recorded_time_seconds,

        COALESCE(tqp.visit_count, 0)
            AS visit_count

      FROM tryout_package_questions tpq

      INNER JOIN questions q
        ON q.id = tpq.question_id

      INNER JOIN category_hierarchy ch
        ON ch.id = q.category_id

      LEFT JOIN tryout_answers ta
        ON ta.question_id = q.id
        AND ta.attempt_id = $1

      LEFT JOIN tryout_question_progress tqp
        ON tqp.question_id = q.id
        AND tqp.attempt_id = $1

      WHERE tpq.tryout_package_id = $2

      ORDER BY
        tpq.question_order ASC,
        q.id ASC
    `,
    [attemptId, tryoutPackageId]
  )

  return rows
}
