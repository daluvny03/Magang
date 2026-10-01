import {
  getPackages,
  getPackageById,
  createTryoutPackage,
  updateTryoutPackage,
  deleteTryoutPackage,
  updatePackageCategories,
  updatePackageQuestions,
  updatePackageSubscriptionTiers,
  publishTryoutPackage,
  unpublishTryoutPackage
} from '../services/tryout-packages.service.js';

export const getAll = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      search,
      status
    } = req.query;

    const result =
      await getPackages({
        page,
        limit,
        search,
        status
      });

    return res.status(200).json({
      success: true,
      message:
        'Tryout packages retrieved successfully',
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req,
  res,
  next
) => {
  try {
    const data = await getPackageById(
      Number(req.params.id)
    );

    return res.status(200).json({
      success: true,
      message: 'Tryout package retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req,
  res,
  next
) => {
  try {
    const result = await createTryoutPackage({
  ...req.body,
  createdBy: req.user.id
});

    return res.status(201).json({
      success: true,
      message: 'Tryout package created successfully',
      result
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req,
  res,
  next
) => {
  try {
    const data = await updateTryoutPackage(
      Number(req.params.id),
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Tryout package updated successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req,
  res,
  next
) => {
  try {
    await deleteTryoutPackage(
      Number(req.params.id)
    );

    return res.status(200).json({
      success: true,
      message: 'Tryout package deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategories = async (
  req,
  res,
  next
) => {
  try {
    const data = await updatePackageCategories(
      Number(req.params.id),
      req.body.categoryIds
    );

    return res.status(200).json({
      success: true,
      message:
        'Package categories updated successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuestions = async (
  req,
  res,
  next
) => {
  try {
    const data = await updatePackageQuestions(
      Number(req.params.id),
      req.body.questions
    );

    return res.status(200).json({
      success: true,
      message:
        'Package questions updated successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubscriptionTiers = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await updatePackageSubscriptionTiers(
        Number(req.params.id),
        req.body.subscriptionTierIds
      );

    return res.status(200).json({
      success: true,
      message:
        'Package subscription tiers updated successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const publish = async (
  req,
  res,
  next
) => {
  try {
    const data = await publishTryoutPackage(
      Number(req.params.id)
    );

    return res.status(200).json({
      success: true,
      message:
        'Tryout package published successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const unpublish = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await unpublishTryoutPackage(
        Number(req.params.id)
      );

    return res.status(200).json({
      success: true,
      message:
        'Tryout package unpublished successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};