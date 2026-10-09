import {
    addQuestionTime,
    findTrackableQuestion,
} from '../repositories/question-progress.repository.js'

const MAX_DURATION_SECONDS = 300

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

export const trackQuestionProgress = async ({
    attemptId,
    userId,
    questionId,
    durationSeconds,
}) => {
    const parsedAttemptId =
        Number(attemptId)

    const parsedQuestionId =
        Number(questionId)

    const parsedDuration =
        Number(durationSeconds)

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
        !Number.isInteger(parsedDuration) ||
        parsedDuration < 0 ||
        parsedDuration > MAX_DURATION_SECONDS
    ) {
        throw createServiceError(
            'Invalid question duration',
            400,
            'INVALID_DURATION'
        )
    }

    const question =
        await findTrackableQuestion({
            attemptId: parsedAttemptId,
            userId,
            questionId: parsedQuestionId,
        })

    if (!question) {
        throw createServiceError(
            'Attempt or question not found',
            404,
            'QUESTION_NOT_FOUND'
        )
    }

    if (question.status !== 'in_progress') {
        throw createServiceError(
            'Attempt is no longer in progress',
            409,
            'ATTEMPT_NOT_IN_PROGRESS'
        )
    }

    const expiresAt =
        new Date(question.expires_at).getTime()

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

    if (parsedDuration === 0) {
        return null
    }

    return addQuestionTime({
        attemptId: parsedAttemptId,
        questionId: parsedQuestionId,
        durationSeconds: parsedDuration,
    })
}