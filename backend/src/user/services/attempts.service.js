import {
  expireElapsedTryoutAttempts,
  findActiveTryoutAttempt,
  tryoutPackageExists,
} from '../repositories/attempts.repository.js'
import { AppError } from '../../utils/app-error.js'

export const getActiveTryoutAttemptForUser = async (
  userId,
  tryoutId
) => {
  // Existence only: an existing attempt may still resume after unpublishing.
  if (!await tryoutPackageExists(tryoutId)) {
    throw new AppError('Tryout not found', 404, 'TRYOUT_NOT_FOUND')
  }
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
