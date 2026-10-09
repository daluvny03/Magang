import {
    findQuestionForAttempt,
    upsertDoubtfulStatus,
} from '../repositories/answers.repository.js'

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

    if (typeof isDoubtful !== 'boolean') {
        throw createServiceError(
            'Invalid doubtful status',
            400,
            'INVALID_DOUBTFUL_STATUS'
        )
    }

    const question =
        await findQuestionForAttempt({
            attemptId: parsedAttemptId,
            userId,
            questionId:
                parsedQuestionId,
        })

    if (!question) {
        throw createServiceError(
            'Attempt or question not found',
            404,
            'QUESTION_NOT_FOUND'
        )
    }

    if (
        question.attempt_status !==
        'in_progress'
    ) {
        throw createServiceError(
            'Attempt is no longer in progress',
            409,
            'ATTEMPT_NOT_IN_PROGRESS'
        )
    }

    const expiresAt =
        new Date(
            question.expires_at
        ).getTime()

    if (
        Number.isFinite(expiresAt) &&
        expiresAt <= Date.now()
    ) {
        throw createServiceError(
            'Attempt has expired',
            409,
            'ATTEMPT_EXPIRED'
        )
    }

    return upsertDoubtfulStatus({
        attemptId: parsedAttemptId,
        questionId:
            parsedQuestionId,
        isDoubtful,
    })
}