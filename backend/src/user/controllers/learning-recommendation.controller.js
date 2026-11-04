
import {
  getLatestLearningRecommendations,
} from '../services/learning-recommendation.service.js'

export const getLearningRecommendations = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await getLatestLearningRecommendations({
        userId: req.user.id,
      })

    return res.status(200).json({
      success: true,
      message:
        'Learning recommendations retrieved successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
