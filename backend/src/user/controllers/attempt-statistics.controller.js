
import {
  getAttemptStatisticsForUser,
} from '../services/attempt-statistics.service.js'

export const getAttemptStatistics = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await getAttemptStatisticsForUser(
        req.user.id
      )

    return res.status(200).json({
      success: true,
      message:
        'Tryout statistics retrieved successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
