export const hasPackageAttempts = async (
  client,
  packageId
) => {
  const result = await client.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM tryout_attempts
        WHERE tryout_package_id = $1
      ) AS has_attempts
    `,
    [packageId]
  )

  return result.rows[0].has_attempts
}