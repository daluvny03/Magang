import {
  findAvailableTryoutByIdForUser,
  findAvailableTryoutsForUser,
} from '../repositories/tryouts.repository.js'

import {
  startTryoutAttempt,
} from '../repositories/attempts.repository.js'

import {
  AppError
} from '../../utils/app-error.js'

const mapTryout = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  durationMinutes: row.duration_minutes,
  questionCount: row.question_count,
  passingScore: row.passing_score,
  isFree: row.is_free,
  startAt: row.start_at,
  endAt: row.end_at,
  isAccessible: row.is_accessible
});

export const getAvailableTryoutsForUser = async (
  userId
) => {
  const rows = await findAvailableTryoutsForUser(
    userId
  );

  return rows.map(mapTryout);
};

export const getAvailableTryoutByIdForUser = async (
  userId,
  tryoutId
) => {
  const row = await findAvailableTryoutByIdForUser(
    userId,
    tryoutId
  )

  if (!row) {
    throw new AppError(
      'Tryout not found',
      404,
      'TRYOUT_NOT_FOUND'
    )
  }

  return mapTryout(row)
}

export const startTryoutForUser = async (
  userId,
  tryoutId
) => {
  const row = await findAvailableTryoutByIdForUser(
    userId,
    tryoutId
  )

  if (!row) {
    const error = new Error('Tryout not found')
    error.statusCode = 404
    error.code = 'TRYOUT_NOT_FOUND'

    throw error
  }

  const tryout = mapTryout(row)

  if (!tryout.isAccessible) {
    const error = new Error(
      'You do not have access to this tryout'
    )

    error.statusCode = 403
    error.code = 'TRYOUT_ACCESS_DENIED'

    throw error
  }

  if (
    !tryout.durationMinutes ||
    tryout.durationMinutes <= 0
  ) {
    const error = new Error(
      'Tryout duration is invalid'
    )

    error.statusCode = 422
    error.code = 'INVALID_TRYOUT_DURATION'

    throw error
  }

  const result = await startTryoutAttempt({
    userId,
    tryoutPackageId: tryout.id,
    durationMinutes: tryout.durationMinutes,
  })

  return result
}