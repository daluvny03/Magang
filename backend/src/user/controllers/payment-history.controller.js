
import {
  getPaymentHistoryForUser,
} from '../services/payment-history.service.js'

export const getPaymentHistory = async (
  req,
  res,
  next
) => {
  try {
    const result = await getPaymentHistoryForUser({
      userId: req.user.id,
      page: req.query.page ?? 1,
      limit: req.query.limit ?? 10,
    })

    return res.status(200).json({
      success: true,
      message:
        'Payment history retrieved successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
