import {
  findCategories,
  findCategoryById,
  findCategoryByNameAndParent,
  findCategoryBySlug,
  createCategory,
  updateCategory,
  countChildren,
  deleteCategory
} from '../repositories/category.repository.js';

import { generateSlug } from '../utils/slug.js';
import { AppError } from '../utils/app-error.js';

const normalizeName = (name) => {
  return name.trim();
};

const getParentLevel = async (parentId) => {
  if (parentId === null || parentId === undefined) {
    return null;
  }

  const parent = await findCategoryById(parentId);

  if (!parent) {
    throw new AppError(
      'Parent category not found',
      404,
      'PARENT_CATEGORY_NOT_FOUND'
    );
  }

  return parent.level;
};

const validateParentHierarchy = async ({
  categoryId,
  parentId
}) => {
  if (parentId === null || parentId === undefined) {
    return null;
  }

  if (
    categoryId &&
    Number(categoryId) === Number(parentId)
  ) {
    throw new AppError(
      'Category cannot be its own parent',
      422,
      'INVALID_PARENT_CATEGORY'
    );
  }

  const parent = await findCategoryById(parentId);

  if (!parent) {
    throw new AppError(
      'Parent category not found',
      404,
      'PARENT_CATEGORY_NOT_FOUND'
    );
  }

  let currentParentId = parent.id;

  while (currentParentId !== null) {
    if (
      categoryId &&
      Number(currentParentId) === Number(categoryId)
    ) {
      throw new AppError(
        'Category hierarchy cannot contain a cycle',
        422,
        'CATEGORY_HIERARCHY_CYCLE'
      );
    }

    const currentParent = await findCategoryById(
      currentParentId
    );

    if (!currentParent) {
      break;
    }

    currentParentId = currentParent.parentId;
  }

  return parent.level + 1;
};

const validateUniqueSlug = async ({
  slug,
  excludeId = null
}) => {
  const existingCategory = await findCategoryBySlug(
    slug,
    excludeId
  );

  if (existingCategory) {
    throw new AppError(
      'Category slug already exists',
      409,
      'CATEGORY_SLUG_ALREADY_EXISTS'
    );
  }
};

export const getCategories = async ({
  page,
  limit,
  search
}) => {
  const result = await findCategories({
    page,
    limit,
    search
  });

  return {
    data: result.rows,
    meta: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit)
    }
  };
};

export const getCategoryById = async (id) => {
  const category = await findCategoryById(id);

  if (!category) {
    throw new AppError(
      'Category not found',
      404,
      'CATEGORY_NOT_FOUND'
    );
  }

  return category;
};

export const createNewCategory = async ({
  name,
  parentId = null
}) => {
  const normalizedName = normalizeName(name);
  const slug = generateSlug(normalizedName);

  if (!slug) {
    throw new AppError(
      'Category name cannot generate a valid slug',
      422,
      'INVALID_CATEGORY_SLUG'
    );
  }

  const duplicateName = await findCategoryByNameAndParent({
    name: normalizedName,
    parentId
  });

  if (duplicateName) {
    throw new AppError(
      'Category with the same name already exists under this parent',
      409,
      'CATEGORY_ALREADY_EXISTS'
    );
  }

  await validateUniqueSlug({
    slug
  });

  const parentLevel = await getParentLevel(parentId);

  const level = parentLevel === null
    ? 1
    : parentLevel + 1;

  return createCategory({
    name: normalizedName,
    slug,
    parentId,
    level
  });
};

export const updateExistingCategory = async ({
  id,
  name,
  parentId = null
}) => {
  const existingCategory = await findCategoryById(id);

  if (!existingCategory) {
    throw new AppError(
      'Category not found',
      404,
      'CATEGORY_NOT_FOUND'
    );
  }

  const normalizedName = normalizeName(name);
  const slug = generateSlug(normalizedName);

  if (!slug) {
    throw new AppError(
      'Category name cannot generate a valid slug',
      422,
      'INVALID_CATEGORY_SLUG'
    );
  }

  const duplicateName = await findCategoryByNameAndParent({
    name: normalizedName,
    parentId,
    excludeId: id
  });

  if (duplicateName) {
    throw new AppError(
      'Category with the same name already exists under this parent',
      409,
      'CATEGORY_ALREADY_EXISTS'
    );
  }

  await validateUniqueSlug({
    slug,
    excludeId: id
  });

  const parentLevel = await validateParentHierarchy({
    categoryId: id,
    parentId
  });

  const level = parentLevel === null
    ? 0
    : parentLevel;

  return updateCategory({
    id,
    name: normalizedName,
    slug,
    parentId,
    level
  });
};

export const removeCategory = async (id) => {
  const category = await findCategoryById(id);

  if (!category) {
    throw new AppError(
      'Category not found',
      404,
      'CATEGORY_NOT_FOUND'
    );
  }

  const childrenCount = await countChildren(id);

  if (childrenCount > 0) {
    throw new AppError(
      'Category cannot be deleted because it has child categories',
      409,
      'CATEGORY_HAS_CHILDREN'
    );
  }

  const deleted = await deleteCategory(id);

  if (!deleted) {
    throw new AppError(
      'Category could not be deleted',
      500,
      'CATEGORY_DELETE_FAILED'
    );
  }
};