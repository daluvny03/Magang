import { pool } from '../../config/database.js'

const sanitizeAnswerOptions = (options) => {
  if (!Array.isArray(options)) {
    return []
  }

  return options.map((option) => ({
    key: option.key,
    text: option.text,
  }))
}

const mapAttemptQuestion = (row) => ({
  id: row.id,
  questionOrder: row.question_order,
  questionText: row.question_text,
  questionImage: row.question_image,
  answerOptions: sanitizeAnswerOptions(
    row.answer_options
  ),
  selectedAnswer:
    row.selected_answer || null,
  isDoubtful:
    row.is_doubtful ?? false,
})

export const findQuestionsByAttemptId = async ({
  attemptId,
  userId,
}) => {
  const attemptResult = await pool.query(
    `
      SELECT
        ta.id,
        ta.user_id,
        ta.tryout_package_id,
        ta.status,
        ta.started_at,
        ta.expires_at

      FROM tryout_attempts ta

      WHERE ta.id = $1
        AND ta.user_id = $2

      LIMIT 1
    `,
    [
      attemptId,
      userId,
    ]
  )

  const attempt = attemptResult.rows[0]

  if (!attempt) {
    return {
      attempt: null,
      questions: [],
    }
  }

  const questionsResult = await pool.query(
  `
    SELECT
      q.id,
      q.question_text,
      q.question_image,
      q.answer_options,
      tpq.question_order,
      ta_answer.selected_answer,

    COALESCE(
        ta_answer.is_doubtful,
        FALSE
    ) AS is_doubtful

    FROM tryout_package_questions tpq

    INNER JOIN questions q
      ON q.id = tpq.question_id

    LEFT JOIN tryout_answers ta_answer
      ON ta_answer.attempt_id = $2
      AND ta_answer.question_id = q.id

    WHERE tpq.tryout_package_id = $1
      AND q.is_active = true

    ORDER BY
      tpq.question_order ASC,
      q.id ASC
  `,
  [
    attempt.tryout_package_id,
    attempt.id,
  ]
)

  return {
    attempt,
    questions:
      questionsResult.rows.map(
        mapAttemptQuestion
      ),
  }
}