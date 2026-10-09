import { pool } from '../../config/database.js'

export const findTrackableQuestion = async ({
    attemptId,
    userId,
    questionId,
}) => {
    const result = await pool.query(
        `
        SELECT
            ta.id AS attempt_id,
            ta.status,
            ta.expires_at,
            tpq.question_id
        FROM tryout_attempts ta

        INNER JOIN tryout_package_questions tpq
            ON tpq.tryout_package_id =
                ta.tryout_package_id
            AND tpq.question_id = $3

        WHERE ta.id = $1
          AND ta.user_id = $2

        LIMIT 1
        `,
        [
            attemptId,
            userId,
            questionId,
        ]
    )

    return result.rows[0] ?? null
}

export const addQuestionTime = async ({
    attemptId,
    questionId,
    durationSeconds,
}) => {
    const result = await pool.query(
        `
        INSERT INTO tryout_question_progress (
            attempt_id,
            question_id,
            time_spent_seconds,
            visit_count
        )
        VALUES ($1, $2, $3, 1)

        ON CONFLICT (
            attempt_id,
            question_id
        )
        DO UPDATE SET
            time_spent_seconds =
                tryout_question_progress.time_spent_seconds
                + EXCLUDED.time_spent_seconds,

            visit_count =
                tryout_question_progress.visit_count
                + 1,

            updated_at =
                CURRENT_TIMESTAMP

        RETURNING
            id,
            attempt_id,
            question_id,
            time_spent_seconds,
            visit_count,
            created_at,
            updated_at
        `,
        [
            attemptId,
            questionId,
            durationSeconds,
        ]
    )

    return result.rows[0]
}