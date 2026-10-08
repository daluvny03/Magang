import {
  findQuestionsByAttemptId,
} from '../repositories/attempt-questions.repository.js'

export const getAttemptQuestionsForUser = async (
  userId,
  attemptId
) => {
  const {
    attempt,
    questions,
  } = await findQuestionsByAttemptId({
    userId,
    attemptId,
  })

  if (!attempt) {
    const error = new Error(
      'Attempt not found'
    )

    error.statusCode = 404
    error.code = 'ATTEMPT_NOT_FOUND'

    throw error
  }

  if (attempt.status === 'completed') {
    const error = new Error(
      'Attempt has already been completed'
    )

    error.statusCode = 409
    error.code = 'ATTEMPT_COMPLETED'

    throw error
  }

  const isExpired =
    attempt.status === 'expired' ||
    new Date(attempt.expires_at).getTime() <=
      Date.now()

  if (isExpired) {
    const error = new Error(
      'Attempt has expired'
    )

    error.statusCode = 409
    error.code = 'ATTEMPT_EXPIRED'

    throw error
  }

  if (attempt.status !== 'in_progress') {
    const error = new Error(
      'Attempt is not in progress'
    )

    error.statusCode = 409
    error.code = 'ATTEMPT_NOT_IN_PROGRESS'

    throw error
  }

  return {
    attempt: {
      id: attempt.id,
      tryoutPackageId:
        attempt.tryout_package_id,
      status: attempt.status,
      startedAt: attempt.started_at,
      expiresAt: attempt.expires_at,
    },
    questions,
  }
}