
import {
  findAttemptForAnalysis,
} from '../repositories/attempt-analysis.repository.js'

export const validateAnalysisAccess = async (
  req,
  res,
  next
) => {
  try {
    const attempt = await findAttemptForAnalysis({
      userId: req.user.id,
      attemptId: req.params.attemptId,
    })

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found',
        code: 'ATTEMPT_NOT_FOUND',
      })
    }

    if (attempt.status !== 'completed') {
      return res.status(409).json({
        success: false,
        message:
          'Analysis is available only for completed attempts',
        code: 'ATTEMPT_NOT_COMPLETED',
      })
    }

    return next()
  } catch (error) {
    next(error)
  }
}
