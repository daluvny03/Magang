import { pool } from '../config/database.js';
import { createTryoutPackageModel } from '../models/tryout-packages.model.js';

const mapPackage = (row) => {
  return createTryoutPackageModel({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    durationMinutes: row.duration_minutes,
    questionCount: row.question_count,
    passingScore: row.passing_score,
    status: row.status,
    isFree: row.is_free,
    startAt: row.start_at,
    endAt: row.end_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
};

export const findPackages = async ({
  page = 1,
  limit = 10,
  search,
  status
}) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const offset = (parsedPage - 1) * parsedLimit;

  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `name ILIKE $${values.length}`
    );
  }

  if (status) {
    values.push(status);
    conditions.push(
      `status = $${values.length}`
    );
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM tryout_packages
    ${whereClause}
  `;

  const dataValues = [...values];

  dataValues.push(parsedLimit);
  const limitIndex = dataValues.length;

  dataValues.push(offset);
  const offsetIndex = dataValues.length;

  const dataQuery = `
    SELECT
    p.id,
    p.name,
    p.slug,
    p.description,
    p.duration_minutes,
    p.question_count,
    p.passing_score,
    p.status,
    p.is_free,
    p.start_at,
    p.end_at,
    p.created_by,
    p.created_at,
    p.updated_at
FROM tryout_packages p
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${limitIndex}
    OFFSET $${offsetIndex}
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, values),
    pool.query(dataQuery, dataValues)
  ]);

  return {
    rows: dataResult.rows.map(mapPackage),
    total: countResult.rows[0].total,
    page: parsedPage,
    limit: parsedLimit
    };
};

export const findPackageById = async (id) => {
  const query = `
    SELECT
      id,
      name,
      slug,
      description,
      duration_minutes,
      question_count,
      passing_score,
      status,
      is_free,
      start_at,
      end_at,
      created_by,
      created_at,
      updated_at
    FROM tryout_packages
    WHERE id = $1
    LIMIT 1
  `;

  const { rows } = await pool.query(
    query,
    [id]
  );

  if (!rows[0]) {
    return null;
  }

  return mapPackage(rows[0]);
};

export const findPackageByIdWithClient = async (
  client,
  id
) => {
  const query = `
    SELECT
      id,
      name,
      slug,
      description,
      duration_minutes,
      question_count,
      passing_score,
      status,
      is_free,
      start_at,
      end_at,
      created_by,
      created_at,
      updated_at
    FROM tryout_packages
    WHERE id = $1
    LIMIT 1
  `;

  const { rows } = await client.query(
    query,
    [id]
  );

  if (!rows[0]) {
    return null;
  }

  return mapPackage(rows[0]);
};

export const findPackageByName = async (name) => {
  const query = `
    SELECT id
    FROM tryout_packages
    WHERE LOWER(name) = LOWER($1)
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [name]);

  return rows[0] || null;
};

export const createPackage = async (
  client,
  {
    name,
    slug,
    description,
    durationMinutes,
    passingScore,
    status,
    isFree,
    startAt,
    endAt,
    questions,
    createdBy
  }
) => {
  const questionCount = questions.length;

  const { rows } = await client.query(
    `
      INSERT INTO tryout_packages (
        name,
        slug,
        description,
        duration_minutes,
        question_count,
        passing_score,
        status,
        is_free,
        start_at,
        end_at,
        created_by
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11
      )
      RETURNING *
    `,
    [
      name,
      slug,
      description ?? null,
      durationMinutes,
      questionCount,
      passingScore ?? null,
      status,
      isFree,
      startAt ?? null,
      endAt ?? null,
      createdBy
    ]
  );

  return rows[0];
};

export const updatePackage = async (
  client,
  id,
  {
    name,
    slug,
    description,
    durationMinutes,
    passingScore,
    status,
    isFree,
    startAt,
    endAt,
    questions
  }
) => {
  const questionCount = questions.length;

  const query = `
    UPDATE tryout_packages
    SET
      name = $1,
      slug = $2,
      description = $3,
      duration_minutes = $4,
      question_count = $5,
      passing_score = $6,
      status = $7,
      is_free = $8,
      start_at = $9,
      end_at = $10,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $11
    RETURNING
      id,
      name,
      slug,
      description,
      duration_minutes,
      question_count,
      passing_score,
      status,
      is_free,
      start_at,
      end_at,
      created_by,
      created_at,
      updated_at
  `;

  const values = [
    name,
    slug,
    description ?? null,
    durationMinutes,
    questionCount,
    passingScore ?? null,
    status,
    isFree,
    startAt ?? null,
    endAt ?? null,
    id
  ];

  const { rows } = await client.query(
    query,
    values
  );

  if (!rows[0]) {
    return null;
  }

  return mapPackage(rows[0]);
};

export const deletePackage = async (
  client,
  id
) => {
  const query = `
    DELETE FROM tryout_packages
    WHERE id = $1
  `;

  const result = await client.query(query, [id]);

  return result.rowCount > 0;
};