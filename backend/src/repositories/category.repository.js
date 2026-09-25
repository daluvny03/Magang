import { pool } from '../config/database.js';
import { createCategoryModel } from '../models/category.model.js';

const mapCategory = (row) => {
  if (!row) return null;

  return createCategoryModel({
    id: row.id,
    name: row.name,
    slug: row.slug,
    parentId: row.parent_id,
    level: row.level,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
};

export const findCategories = async ({
  page = 1,
  limit = 20,
  search
}) => {
  const offset = (page - 1) * limit;

  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);

    conditions.push(`
      (
        c.name ILIKE $${values.length}
        OR c.slug ILIKE $${values.length}
      )
    `);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM categories c
    ${whereClause}
  `;

  const dataValues = [...values];

  dataValues.push(limit);
  const limitIndex = dataValues.length;

  dataValues.push(offset);
  const offsetIndex = dataValues.length;

  const dataQuery = `
    SELECT
      c.id,
      c.name,
      c.slug,
      c.parent_id,
      c.level,
      c.created_at,
      c.updated_at
    FROM categories c
    ${whereClause}
    ORDER BY c.level ASC, c.name ASC, c.id ASC
    LIMIT $${limitIndex}
    OFFSET $${offsetIndex}
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, values),
    pool.query(dataQuery, dataValues)
  ]);

  return {
    rows: dataResult.rows.map(mapCategory),
    total: countResult.rows[0].total
  };
};

export const findCategoryById = async (id) => {
  const query = `
    SELECT
      c.id,
      c.name,
      c.slug,
      c.parent_id,
      c.level,
      c.created_at,
      c.updated_at
    FROM categories c
    WHERE c.id = $1
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [id]);

  return mapCategory(rows[0]);
};

export const findCategoryByNameAndParent = async ({
  name,
  parentId,
  excludeId = null
}) => {
  const query = `
    SELECT
      id,
      name,
      slug,
      parent_id,
      level,
      created_at,
      updated_at
    FROM categories
    WHERE LOWER(name) = LOWER($1)
      AND (
        parent_id = $2
        OR (parent_id IS NULL AND $2 IS NULL)
      )
      AND ($3::int IS NULL OR id <> $3)
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [
    name,
    parentId,
    excludeId
  ]);

  return mapCategory(rows[0]);
};

export const findCategoryBySlug = async (
  slug,
  excludeId = null
) => {
  const query = `
    SELECT
      id,
      name,
      slug,
      parent_id,
      level,
      created_at,
      updated_at
    FROM categories
    WHERE slug = $1
      AND ($2::int IS NULL OR id <> $2)
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [
    slug,
    excludeId
  ]);

  return mapCategory(rows[0]);
};

export const createCategory = async ({
  name,
  slug,
  parentId,
  level = 1
}) => {
  const query = `
    INSERT INTO categories (
      name,
      slug,
      parent_id,
      level
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      name,
      slug,
      parent_id,
      level,
      created_at,
      updated_at
  `;

  const { rows } = await pool.query(query, [
    name,
    slug,
    parentId,
    level
  ]);

  return mapCategory(rows[0]);
};

export const updateCategory = async ({
  id,
  name,
  slug,
  parentId,
  level
}) => {
  const query = `
    UPDATE categories
    SET
      name = $1,
      slug = $2,
      parent_id = $3,
      level = $4,
      updated_at = NOW()
    WHERE id = $5
    RETURNING
      id,
      name,
      slug,
      parent_id,
      level,
      created_at,
      updated_at
  `;

  const { rows } = await pool.query(query, [
    name,
    slug,
    parentId,
    level,
    id
  ]);

  return mapCategory(rows[0]);
};

export const countChildren = async (categoryId) => {
  const query = `
    SELECT COUNT(*)::int AS count
    FROM categories
    WHERE parent_id = $1
  `;

  const { rows } = await pool.query(query, [categoryId]);

  return rows[0].count;
};

export const deleteCategory = async (id) => {
  const query = `
    DELETE FROM categories
    WHERE id = $1
    RETURNING id
  `;

  const { rows } = await pool.query(query, [id]);

  return rows[0] || null;
};