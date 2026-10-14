
import {
  getAttemptHistoryForUser,
} from '../services/attempt-history.service.js'

export const getAttemptHistory = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id

    const page = Number(req.query.page ?? 1)
    const limit = Number(req.query.limit ?? 10)

    const result = await getAttemptHistoryForUser({
      userId,
      page,
      limit,
    })

    return res.status(200).json({
      success: true,
      message:
        'Tryout history retrieved successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
