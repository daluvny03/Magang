import {
  getActiveSubscriptionTiers
} from '../services/subscription-tier.service.js';

export const getAllSubscriptionTiers = async (
  req,
  res,
  next
) => {
  try {
    const tiers =
      await getActiveSubscriptionTiers();

    return res.status(200).json({
      success: true,
      message:
        'Subscription tiers retrieved successfully',
      data: tiers
    });
  } catch (error) {
    next(error);
  }
};