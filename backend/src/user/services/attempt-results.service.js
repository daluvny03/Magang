import {
  finishTryoutAttempt,
} from '../repositories/attempt-results.repository.js'

export const finishAttemptForUser = async ({
  userId,
  attemptId,
}) => {
  const result = await finishTryoutAttempt({
    userId,
    attemptId,
  })

  if (result.reason === 'not_found') {
    const error = new Error(
      'Attempt not found'
    )

    error.statusCode = 404
    error.code = 'ATTEMPT_NOT_FOUND'

    throw error
  }

  if (result.reason === 'expired') {
    const error = new Error(
      'Attempt has expired'
    )

    error.statusCode = 409
    error.code = 'ATTEMPT_EXPIRED'

    throw error
  }

  if (
    result.reason !== 'completed' &&
    result.reason !== 'already_completed'
  ) {
    const error = new Error(
      'Attempt cannot be completed'
    )

    error.statusCode = 409
    error.code =
      'ATTEMPT_CANNOT_BE_COMPLETED'

    throw error
  }

  return {
    attempt: result.attempt,
    alreadyCompleted:
      result.reason === 'already_completed',
  }
}