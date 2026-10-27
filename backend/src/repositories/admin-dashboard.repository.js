import { pool } from '../config/database.js';

// One statement keeps the totals and recent packages in the same database snapshot.
export const findAdminDashboard = async () => {
  const { rows } = await pool.query(`
    SELECT
      (SELECT json_build_object(
        'total', COUNT(*)::int,
        'published', COUNT(*) FILTER (WHERE status = 'published')::int,
        'draft', COUNT(*) FILTER (WHERE status = 'draft')::int,
        'archived', COUNT(*) FILTER (WHERE status = 'archived')::int
      ) FROM tryout_packages) AS tryouts,
      (SELECT json_build_object(
        'total', COUNT(*)::int,
        'active', COUNT(*) FILTER (WHERE is_active = true)::int
      ) FROM questions) AS questions,
      (SELECT json_build_object(
        'total', COUNT(*)::int,
        'active', COUNT(*) FILTER (WHERE is_active = true)::int
      ) FROM categories) AS categories,
      (SELECT json_build_object(
        'total', COUNT(*)::int,
        'participants', COUNT(*) FILTER (WHERE role = 'user')::int
      ) FROM users) AS users,
      COALESCE((SELECT json_agg(recent ORDER BY recent."createdAt" DESC, recent.id DESC)
        FROM (
          SELECT id, name, status, duration_minutes AS "durationMinutes",
            question_count AS "questionCount", created_at AS "createdAt"
          FROM tryout_packages
          ORDER BY created_at DESC, id DESC
          LIMIT 5
        ) recent), '[]'::json) AS "recentTryouts"
  `);
  return rows[0];
};
