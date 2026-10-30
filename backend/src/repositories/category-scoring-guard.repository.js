import { AppError } from '../utils/app-error.js'

// Category writers take SHARE ROW EXCLUSIVE before reading hierarchy.
// CAT start takes SHARE before advisory/package/question locks. Writers never
// lock package/question/attempt rows, so they cannot invert that lock order.
// Table locking also blocks implicit ROW EXCLUSIVE locks from category CRUD.
export const lockCategoryScoring = (client, writing = false) => client.query(
  writing
    ? 'LOCK TABLE categories IN SHARE ROW EXCLUSIVE MODE'
    : 'LOCK TABLE categories IN SHARE MODE'
)

export const categoryHasAttempts = async (client, id) => {
  const { rows } = await client.query(`
    WITH RECURSIVE subtree(id) AS (
      SELECT id FROM categories WHERE id = $1
      UNION
      SELECT c.id FROM categories c JOIN subtree s ON c.parent_id = s.id
    )
    SELECT EXISTS (
      SELECT 1 FROM subtree s
      JOIN questions q ON q.category_id = s.id
      JOIN tryout_package_questions pq ON pq.question_id = q.id
      JOIN tryout_attempts a ON a.tryout_package_id = pq.tryout_package_id
    ) AS used`, [id])
  // All statuses: completed/expired results also resolve the live hierarchy.
  return rows[0].used
}

const rootSlug = async (client, id) => {
  const { rows } = await client.query(`
    WITH RECURSIVE ancestors AS (
      SELECT id, parent_id, slug FROM categories WHERE id = $1
      UNION
      SELECT c.id, c.parent_id, c.slug FROM categories c
      JOIN ancestors a ON a.parent_id = c.id
    ) SELECT slug FROM ancestors WHERE parent_id IS NULL`, [id])
  return rows[0]?.slug
}

export const categoryScoringConflict = () => new AppError(
  'Category scoring classification cannot be changed because it has existing attempts',
  409,
  'CATEGORY_SCORING_ALREADY_USED'
)

export const guardCategoryScoringChange = async (client, { id, parentId, slug }) => {
  const before = await rootSlug(client, id)
  const after = parentId == null ? slug : await rootSlug(client, parentId)
  if (before !== after && await categoryHasAttempts(client, id)) {
    throw categoryScoringConflict()
  }
}
