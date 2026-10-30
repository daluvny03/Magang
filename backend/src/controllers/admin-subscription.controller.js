
import {
  getAdminSubscriptionTiers,
  getAdminSubscriptionTierById,
  createAdminSubscriptionTier,
  updateAdminSubscriptionTier,
  changeAdminSubscriptionTierStatus
} from '../services/admin-subscription.service.js';

export const getSubscriptionTiers = async (
  req,
  res,
  next
) => {
  try {
    const tiers = await getAdminSubscriptionTiers();

    return res.status(200).json({
      success: true,
      message: 'Subscription tiers retrieved successfully',
      data: tiers
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionTierDetail = async (
  req,
  res,
  next
) => {
  try {
    const tier = await getAdminSubscriptionTierById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: 'Subscription tier retrieved successfully',
      data: tier
    });
  } catch (error) {
    next(error);
  }
};

export const createSubscriptionTier = async (
  req,
  res,
  next
) => {
  try {
    const tier = await createAdminSubscriptionTier(
      req.body
    );

    return res.status(201).json({
      success: true,
      message: 'Subscription tier created successfully',
      data: tier
    });
  } catch (error) {
    next(error);
  }
};

export const editSubscriptionTier = async (
  req,
  res,
  next
) => {
  try {
    const tier = await updateAdminSubscriptionTier(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Subscription tier updated successfully',
      data: tier
    });
  } catch (error) {
    next(error);
  }
};

export const changeSubscriptionTierStatus = async (
  req,
  res,
  next
) => {
  try {
    const tier =
      await changeAdminSubscriptionTierStatus(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: 'Subscription tier status updated successfully',
      data: tier
    });
  } catch (error) {
    next(error);
  }
};
