import {
  finishAttemptForUser,
} from '../services/attempt-results.service.js'

export const finishAttempt = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id
    const { attemptId } = req.params

    const result =
      await finishAttemptForUser({
        userId,
        attemptId,
      })

    return res.status(200).json({
      success: true,
      message: result.alreadyCompleted
        ? 'Attempt already completed'
        : 'Attempt completed successfully',
      data: {
        attempt: result.attempt,
      },
    })
  } catch (error) {
    next(error)
  }
}