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
        tpq.question_order

      FROM tryout_package_questions tpq

      INNER JOIN questions q
        ON q.id = tpq.question_id

      WHERE tpq.tryout_package_id =
        $1

        AND q.is_active = true

      ORDER BY
        tpq.question_order ASC,
        q.id ASC
    `,
    [
      attempt.tryout_package_id,
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