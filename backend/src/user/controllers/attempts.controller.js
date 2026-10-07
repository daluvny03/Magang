import {
  getActiveTryoutAttemptForUser,
} from '../services/attempts.service.js'

export const getActiveAttempt = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id
    const { tryoutId } = req.params

    const attempt =
      await getActiveTryoutAttemptForUser(
        userId,
        tryoutId
      )

    return res.status(200).json({
      success: true,
      message: attempt
        ? 'Active attempt retrieved successfully'
        : 'No active attempt found',
      data: {
        attempt,
      },
    })
  } catch (error) {
    next(error)
  }
}