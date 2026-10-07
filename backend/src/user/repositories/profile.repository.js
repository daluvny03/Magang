import { pool } from '../../config/database.js';

export const findProfileByUserId = async (userId) => {
  const query = `
    SELECT
      id,
      name,
      email,
      role,
      is_active,
      email_verified_at,
      last_login_at,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;

  const { rows } = await pool.query(
    query,
    [userId]
  );

  return rows[0] || null;
};