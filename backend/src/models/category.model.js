export const createCategoryModel = ({
  id,
  name,
  slug,
  parentId,
  level,
  is_active,
  description,
  questionCount=0,
  createdAt,
  updatedAt
}) => ({
  id,
  name,
  slug,
  parentId,
  level,
  is_active,
  description,
  questionCount,
  createdAt,
  updatedAt
});