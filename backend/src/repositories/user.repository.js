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