import {
  getActiveSubscriptionByUserId
} from '../services/subscription.service.js';

export const getActiveSubscription = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const subscription =
      await getActiveSubscriptionByUserId(userId);

    return res.status(200).json({
      success: true,
      message:
        'Subscription retrieved successfully',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};