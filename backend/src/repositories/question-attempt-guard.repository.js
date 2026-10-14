
export const hasQuestionAttempts = async (
  client,
  questionId
) => {
  const result = await client.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM tryout_package_questions tpq
        INNER JOIN tryout_attempts ta
          ON ta.tryout_package_id =
             tpq.tryout_package_id
        WHERE tpq.question_id = $1
      ) AS has_attempts
    `,
    [questionId]
  )

  return result.rows[0].has_attempts
}
