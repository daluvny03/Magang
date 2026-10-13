import {
  finishAttemptForUser,
  getAttemptResultForUser,
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


export const getAttemptResult = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id
    const { attemptId } = req.params

    if (
      !/^[1-9]\d*$/.test(attemptId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attempt ID',
        code: 'INVALID_ATTEMPT_ID',
      })
    }

    const result =
      await getAttemptResultForUser({
        userId,
        attemptId,
      })

    return res.status(200).json({
      success: true,
      message:
        'Attempt result retrieved successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
