
import {
  getActiveSubscriptionByUserId,
} from '../services/subscription.service.js'

export const requirePremium = async (
  req,
  res,
  next
) => {
  try {
    const subscription =
      await getActiveSubscriptionByUserId(
        req.user.id
      )

    const hasPremiumAccess =
      subscription?.status === 'active' &&
      subscription?.tier?.slug === 'premium' &&
      subscription?.tier?.isActive === true

    if (!hasPremiumAccess) {
      return res.status(403).json({
        success: false,
        message:
          'Fitur ini membutuhkan subscription Premium yang aktif.',
        code: 'SUBSCRIPTION_REQUIRED',
      })
    }

    return next()
  } catch (error) {
    next(error)
  }
}
