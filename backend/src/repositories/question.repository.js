import { pool } from '../config/database.js';
import { createQuestionModel } from '../models/question.model.js';

const mapQuestion = (row) => {
  if (!row) return null;

  return createQuestionModel({
    id: row.id,
    categoryId: row.category_id,
    questionText: row.question_text,
    answerOptions: row.answer_options,
    correctAnswer: row.correct_answer,
    explanation: row.explanation,
    score: row.score,
    difficulty: row.difficulty,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    category: row.category_id
      ? {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
          parentId: row.category_parent_id,
          level: row.category_level
        }
      : undefined
  });
};

const baseSelect = `
  SELECT
    q.id,
    q.category_id,
    q.question_text,
    q.answer_options,
    q.correct_answer,
    q.explanation,
    q.score,
    q.difficulty,
    q.is_active,
    q.created_at,
    q.updated_at,

    c.name AS category_name,
    c.slug AS category_slug,
    c.parent_id AS category_parent_id,
    c.level AS category_level

  FROM questions q

  INNER JOIN categories c
    ON c.id = q.category_id
`;

export const findQuestions = async ({
  page=1,
  limit=10,
  search,
  categoryId,
  difficulty,
  isActive
}) => {
  const conditions = [];
  const values = [];

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const offset = (parsedPage - 1) * parsedLimit;

  if (search) {
    values.push(`%${search}%`);

    conditions.push(`
      q.question_text ILIKE $${values.length}
    `);
  }

  if (categoryId !== undefined && categoryId !== null && categoryId !== '' && !isNaN(categoryId)) {
    values.push(Number(categoryId));
    conditions.push(`q.category_id = $${values.length}`);
  }

  if (difficulty !== undefined) {
    values.push(difficulty);

    conditions.push(`
      q.difficulty = $${values.length}
    `);
  }

  if (isActive !== undefined && isActive !== null && isActive !== '') {
    const boolActive = isActive === true || isActive === 'true';
    values.push(boolActive);
    conditions.push(`q.is_active = $${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM questions q
    INNER JOIN categories c
      ON c.id = q.category_id
    ${whereClause}
  `;

  const dataValues = [...values];

  dataValues.push(limit);
  const limitIndex = dataValues.length;

  dataValues.push((page - 1) * limit);
  const offsetIndex = dataValues.length;

  const dataQuery = `
    ${baseSelect}
    ${whereClause}
    ORDER BY q.created_at DESC, q.id DESC
    LIMIT $${limitIndex}
    OFFSET $${offsetIndex}
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, values),
    pool.query(dataQuery, dataValues)
  ]);

  return {
    rows: dataResult.rows.map(mapQuestion),
    total: countResult.rows[0].total
  };
};

export const findQuestionById = async (id) => {
  const query = `
    ${baseSelect}
    WHERE q.id = $1
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [id]);

  return mapQuestion(rows[0]);
};

export const createQuestion = async ({
  categoryId,
  questionText,
  answerOptions,
  correctAnswer,
  explanation,
  score,
  difficulty,
  isActive
}) => {
  const query = `
    INSERT INTO questions (
      category_id,
      question_text,
      answer_options,
      correct_answer,
      explanation,
      score,
      difficulty,
      is_active
    )
    VALUES (
      $1,
      $2,
      $3::jsonb,
      $4,
      $5::jsonb,
      $6,
      $7,
      $8
    )
    RETURNING id
  `;

  const { rows } = await pool.query(query, [
    categoryId,
    questionText,
    JSON.stringify(answerOptions),
    correctAnswer,
    JSON.stringify(explanation),
    score,
    difficulty,
    isActive
  ]);

  return findQuestionById(rows[0].id);
};

export const updateQuestion = async ({
  id,
  categoryId,
  questionText,
  answerOptions,
  correctAnswer,
  explanation,
  score,
  difficulty,
  isActive
}) => {
  const query = `
    UPDATE questions
    SET
      category_id = $1,
      question_text = $2,
      answer_options = $3::jsonb,
      correct_answer = $4,
      explanation = $5::jsonb,
      score = $6,
      difficulty = $7,
      is_active = $8,
      updated_at = NOW()
    WHERE id = $9
    RETURNING id
  `;

  const { rows } = await pool.query(query, [
    categoryId,
    questionText,
    JSON.stringify(answerOptions),
    correctAnswer,
    JSON.stringify(explanation),
    score,
    difficulty,
    isActive,
    id
  ]);

  if (!rows[0]) {
    return null;
  }

  return findQuestionById(rows[0].id);
};

export const deactivateQuestion = async (id) => {
  const query = `
    UPDATE questions
    SET
      is_active = false,
      updated_at = NOW()
    WHERE id = $1
    RETURNING id
  `;

  const { rows } = await pool.query(query, [id]);

  return rows[0] || null;
};