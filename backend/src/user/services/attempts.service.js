import {
  expireElapsedTryoutAttempts,
  findActiveTryoutAttempt,
} from '../repositories/attempts.repository.js'

export const getActiveTryoutAttemptForUser = async (
  userId,
  tryoutId
) => {
  await expireElapsedTryoutAttempts({
    userId,
    tryoutPackageId: tryoutId,
  })

  const attempt =
    await findActiveTryoutAttempt({
      userId,
      tryoutPackageId: tryoutId,
    })

  return attempt
}