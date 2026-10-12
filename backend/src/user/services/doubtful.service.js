import {
    findQuestionForAttempt,
    upsertDoubtfulStatus,
} from '../repositories/answers.repository.js'

import { pool } from '../../config/database.js'

const createServiceError = (
    message,
    statusCode,
    code
) => {
    const error = new Error(message)

    error.statusCode = statusCode
    error.code = code

    return error
}

export const updateDoubtfulStatus = async ({
    attemptId,
    userId,
    questionId,
    isDoubtful,
}) => {
    const parsedAttemptId =
        Number(attemptId)

    const parsedQuestionId =
        Number(questionId)

    if (
        !Number.isInteger(parsedAttemptId) ||
        parsedAttemptId <= 0
    ) {
        throw createServiceError(
            'Invalid attempt ID',
            400,
            'INVALID_ATTEMPT_ID'
        )
    }

    if (
        !Number.isInteger(parsedQuestionId) ||
        parsedQuestionId <= 0
    ) {
        throw createServiceError(
            'Invalid question ID',
            400,
            'INVALID_QUESTION_ID'
        )
    }

    if (
        typeof isDoubtful !== 'boolean'
    ) {
        throw createServiceError(
            'Invalid doubtful status',
            400,
            'INVALID_DOUBTFUL_STATUS'
        )
    }

    const client =
        await pool.connect()

    try {
        await client.query('BEGIN')

        const question =
            await findQuestionForAttempt({
                attemptId:
                    parsedAttemptId,
                userId,
                questionId:
                    parsedQuestionId,

                client,
                lockAttempt: true,
            })

        if (!question) {
            throw createServiceError(
                'Attempt or question not found',
                404,
                'ATTEMPT_QUESTION_NOT_FOUND'
            )
        }

        if (
            question.attempt_status ===
            'completed'
        ) {
            throw createServiceError(
                'Attempt has already been completed',
                409,
                'ATTEMPT_COMPLETED'
            )
        }

        const expiresAt =
            new Date(
                question.expires_at
            ).getTime()

        const isExpired =
            question.attempt_status ===
                'expired' ||
            (
                Number.isFinite(expiresAt) &&
                expiresAt <= Date.now()
            )

        if (isExpired) {
            throw createServiceError(
                'Attempt has expired',
                409,
                'ATTEMPT_EXPIRED'
            )
        }

        if (
            question.attempt_status !==
            'in_progress'
        ) {
            throw createServiceError(
                'Attempt is not in progress',
                409,
                'ATTEMPT_NOT_IN_PROGRESS'
            )
        }

        const answer =
            await upsertDoubtfulStatus({
                attemptId:
                    parsedAttemptId,
                questionId:
                    parsedQuestionId,
                isDoubtful,
                client,
            })

        await client.query('COMMIT')

        return answer
    } catch (error) {
        await client.query('ROLLBACK')

        throw error
    } finally {
        client.release()
    }
}