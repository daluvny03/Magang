import {
  getActiveSubscriptionByUserId,
  getSubscriptionCatalog
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
      message: 'Subscription retrieved successfully',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableSubscriptionCatalog = async (
  req,
  res,
  next
) => {
  try {
    const tiers = await getSubscriptionCatalog(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Subscription catalog retrieved successfully',
      data: tiers
    });
  } catch (error) {
    next(error);
  }
};
