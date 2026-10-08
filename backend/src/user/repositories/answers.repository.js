import { pool } from '../../config/database.js'

const mapAnswer = (row) => {
  if (!row) return null

  return {
    id: row.id,
    attemptId: row.attempt_id,
    questionId: row.question_id,
    selectedAnswer: row.selected_answer,
    isCorrect: row.is_correct,
    score: Number(row.score),
    answeredAt: row.answered_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const findQuestionForAttempt = async ({
  attemptId,
  userId,
  questionId,
}) => {
  const { rows } = await pool.query(
    `
      WITH RECURSIVE category_tree AS (
        SELECT
          c.id,
          c.parent_id,
          c.name,
          c.slug,
          c.level
        FROM categories c
        INNER JOIN questions q
          ON q.category_id = c.id
        WHERE q.id = $3

        UNION ALL

        SELECT
          parent.id,
          parent.parent_id,
          parent.name,
          parent.slug,
          parent.level
        FROM categories parent
        INNER JOIN category_tree child
          ON child.parent_id = parent.id
      )

      SELECT
        ta.id AS attempt_id,
        ta.status AS attempt_status,
        ta.expires_at,

        q.id AS question_id,
        q.correct_answer,
        q.answer_options,
        q.score AS question_score,

        root.id AS root_category_id,
        root.slug AS root_category_slug

      FROM tryout_attempts ta

      INNER JOIN tryout_package_questions tpq
        ON tpq.tryout_package_id =
          ta.tryout_package_id

      INNER JOIN questions q
        ON q.id = tpq.question_id

      LEFT JOIN category_tree root
        ON root.parent_id IS NULL

      WHERE ta.id = $1
        AND ta.user_id = $2
        AND q.id = $3

      LIMIT 1
    `,
    [
      attemptId,
      userId,
      questionId,
    ]
  )

  return rows[0] || null
}

export const upsertTryoutAnswer = async ({
  attemptId,
  questionId,
  selectedAnswer,
  isCorrect,
  score,
}) => {
  const { rows } = await pool.query(
    `
      INSERT INTO tryout_answers (
        attempt_id,
        question_id,
        selected_answer,
        is_correct,
        score,
        answered_at
      )

      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        CURRENT_TIMESTAMP
      )

      ON CONFLICT (
        attempt_id,
        question_id
      )

      DO UPDATE SET
        selected_answer =
          EXCLUDED.selected_answer,

        is_correct =
          EXCLUDED.is_correct,

        score =
          EXCLUDED.score,

        answered_at =
          CURRENT_TIMESTAMP,

        updated_at =
          CURRENT_TIMESTAMP

      RETURNING
        id,
        attempt_id,
        question_id,
        selected_answer,
        is_correct,
        score,
        answered_at,
        created_at,
        updated_at
    `,
    [
      attemptId,
      questionId,
      selectedAnswer,
      isCorrect,
      score,
    ]
  )

  return mapAnswer(rows[0])
}