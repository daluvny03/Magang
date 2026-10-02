import {
  getCategories,
  getCategoryById,
  getCategoryTree,
  createNewCategory,
  updateExistingCategory,
  removeCategory,
  getCategoryQuestionIds
} from '../services/category.service.js';

export const getAllCategories = async (req, res, next) => {
  try {
    const result = await getCategories(req.query);

    return res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryDetail = async (req, res, next) => {
  try {
    const category = await getCategoryById(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await createNewCategory(req.body);

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await updateExistingCategory({
      id: Number(req.params.id),
      ...req.body
    });

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await removeCategory(Number(req.params.id));

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryTreeController = async (
  req,
  res,
  next
) => {
  try {
    const categories = await getCategoryTree({
      search: req.query.search
    });

    return res.status(200).json({
      success: true,
      message: 'Category tree retrieved successfully',
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryQuestionIdsController = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const result = await getCategoryQuestionIds(id);

    return res.status(200).json({
      success: true,
      message: 'Category question IDs retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};