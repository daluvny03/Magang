import { pool } from '../config/database.js';
import { createUserModel } from '../models/user.model.js';

export const findUserByEmail = async (email) => {
  const query = `
    SELECT
      id,
      name,
      email,
      password,
      role,
      created_at,
      updated_at
    FROM users
    WHERE email = $1
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [email]);

  if (!rows[0]) {
    return null;
  }

  return rows[0];
};

export const findUserById = async (id) => {
  const query = `
    SELECT
      id,
      name,
      email,
      role,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [id]);

  if (!rows[0]) {
    return null;
  }

  return createUserModel({
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    role: rows[0].role,
    createdAt: rows[0].created_at,
    updatedAt: rows[0].updated_at
  });
};

export const createUser = async ({
  name,
  email,
  passwordHash,
  role = 'user'
}) => {
  const query = `
    INSERT INTO users (
      name,
      email,
      password,
      role
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      name,
      email,
      role,
      created_at,
      updated_at
  `;

  const values = [
    name,
    email,
    passwordHash,
    role
  ];

  const { rows } = await pool.query(query, values);

  return createUserModel({
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    role: rows[0].role,
    createdAt: rows[0].created_at,
    updatedAt: rows[0].updated_at
  });
};

export const findUsers = async ({
  page = 1,
  limit = 20,
  search = '',
  role
}) => {
  const parsedPage = Math.max(
    1,
    parseInt(page, 10) || 1
  );

  const parsedLimit = Math.min(
    100,
    Math.max(
      1,
      parseInt(limit, 10) || 20
    )
  );

  const offset =
    (parsedPage - 1) * parsedLimit;

  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);

    conditions.push(`
      (
        name ILIKE $${values.length}
        OR email ILIKE $${values.length}
      )
    `);
  }

  if (role) {
    values.push(role);

    conditions.push(
      `role = $${values.length}`
    );
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM users
    ${whereClause}
  `;

  const dataValues = [...values];

  dataValues.push(parsedLimit);
  const limitIndex = dataValues.length;

  dataValues.push(offset);
  const offsetIndex = dataValues.length;

  const dataQuery = `
    SELECT
      id,
      name,
      email,
      role,
      created_at,
      updated_at
    FROM users
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${limitIndex}
    OFFSET $${offsetIndex}
  `;

  const [
    countResult,
    dataResult
  ] = await Promise.all([
    pool.query(
      countQuery,
      values
    ),
    pool.query(
      dataQuery,
      dataValues
    )
  ]);

  return {
    rows: dataResult.rows.map(
      (row) =>
        createUserModel({
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        })
    ),
    total: countResult.rows[0].total,
    page: parsedPage,
    limit: parsedLimit
  };
};