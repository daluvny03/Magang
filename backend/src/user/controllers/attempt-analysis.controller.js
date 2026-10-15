
import {
  getAttemptAnalysisForUser,
} from '../services/attempt-analysis.service.js'

export const getAttemptAnalysis = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await getAttemptAnalysisForUser({
        userId: req.user.id,
        attemptId: req.params.attemptId,
      })

    return res.status(200).json({
      success: true,
      message:
        'Tryout analysis retrieved successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
