import {
  finishTryoutAttempt,
  findCompletedAttemptResult,
  findAttemptCategoryResults,
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


export const getAttemptResultForUser = async ({
  userId,
  attemptId,
}) => {
  const attempt =
    await findCompletedAttemptResult({
      userId,
      attemptId,
    })

  if (!attempt) {
    const error = new Error(
      'Completed attempt not found'
    )

    error.statusCode = 404
    error.code = 'ATTEMPT_RESULT_NOT_FOUND'

    throw error
  }

  const categories =
    await findAttemptCategoryResults({
      userId,
      attemptId,
    })

  const startedAt = new Date(
    attempt.started_at
  )

  const completedAt = new Date(
    attempt.completed_at
  )

  const expiresAt = attempt.expires_at
    ? new Date(attempt.expires_at)
    : null

  const effectiveCompletedAt =
    expiresAt && completedAt > expiresAt
      ? expiresAt
      : completedAt

  const durationSeconds = Math.max(
    0,
    Math.floor(
      (
        effectiveCompletedAt.getTime() -
        startedAt.getTime()
      ) / 1000
    )
  )

  const totalQuestions = Number(
    attempt.total_questions
  )

  const correctAnswers = Number(
    attempt.correct_answers
  )

  const wrongAnswers = Number(
    attempt.wrong_answers
  )

  const unanswered = Number(
    attempt.unanswered
  )

  return {
    attempt: {
      id: attempt.id,
      tryoutId: attempt.tryout_package_id,
      tryoutName: attempt.tryout_name,
      attemptNumber: attempt.attempt_number,
      status: attempt.status,
      startedAt: attempt.started_at,
      completedAt: attempt.completed_at,
      durationSeconds,
    },

    summary: {
      totalScore: Number(
        attempt.total_score
      ),
      passingStatus:
        attempt.result_snapshot?.passingStatus ??
        'not_evaluated',
      passingMode: attempt.exam_snapshot?.passingMode ?? null,
      passingScore: attempt.exam_snapshot?.passingMode === 'total'
        ? attempt.exam_snapshot.passingScore
        : null,
      totalQuestions,
      answered:
        totalQuestions - unanswered,
      correctAnswers,
      wrongAnswers,
      unanswered,
    },

    categories: categories.map((category) => {
      const savedResult = attempt.result_snapshot?.categoryScores?.find(
        (item) => item.slug === category.slug
      )
      const passingGrade = savedResult?.passingGrade ?? (
        attempt.exam_snapshot?.passingMode === 'category'
          ? attempt.exam_snapshot.passingGrades?.[category.slug] ?? null
          : null
      )
      const totalScore = savedResult?.score ?? category.totalScore
      return {
        ...category,
        totalScore,
        passingGrade,
        passed: passingGrade == null ? null : Number(totalScore) >= Number(passingGrade),
      }
    }),
  }
}
