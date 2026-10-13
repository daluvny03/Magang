
export const getPackageQuestionScoreLimits = async (
  client,
  questions
) => {
  const questionIds = questions.map(
    (question) => question.questionId
  )

  const { rows } = await client.query(
    `
      WITH RECURSIVE category_hierarchy AS (
        SELECT
          id,
          parent_id,
          slug,
          id AS root_id,
          slug AS root_slug

        FROM categories
        WHERE parent_id IS NULL

        UNION ALL

        SELECT
          c.id,
          c.parent_id,
          c.slug,
          ch.root_id,
          ch.root_slug

        FROM categories c

        INNER JOIN category_hierarchy ch
          ON c.parent_id = ch.id
      ),

      question_limits AS (
        SELECT
          q.id AS question_id,
          ch.root_slug,

          CASE
            WHEN ch.root_slug = 'tkp'
            THEN (
              SELECT MAX(
                (option_item ->> 'score')::numeric
              )
              FROM jsonb_array_elements(
                q.answer_options
              ) AS option_item
            )

            ELSE q.score
          END AS maximum_score

        FROM questions q

        INNER JOIN category_hierarchy ch
          ON ch.id = q.category_id

        WHERE q.id = ANY($1::bigint[])
      )

      SELECT
        root_slug AS slug,
        COUNT(*)::integer AS total_questions,
        SUM(maximum_score) AS maximum_score,
        COUNT(*) FILTER (
          WHERE maximum_score IS NULL
        )::integer AS invalid_score_count

      FROM question_limits

      GROUP BY root_slug
      ORDER BY root_slug
    `,
    [questionIds]
  )

  return rows.map((row) => ({
    slug: row.slug,
    totalQuestions: Number(row.total_questions),
    maximumScore:
      row.maximum_score === null
        ? null
        : Number(row.maximum_score),
    invalidScoreCount: Number(
      row.invalid_score_count
    ),
  }))
}
