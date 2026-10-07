import { pool } from '../../config/database.js'

const mapAttempt = (row) => {
  if (!row) return null

  return {
    id: row.id,
    userId: row.user_id,
    tryoutPackageId: row.tryout_package_id,
    attemptNumber: row.attempt_number,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    expiresAt: row.expires_at,
    totalScore: row.total_score,
    correctAnswers: row.correct_answers,
    wrongAnswers: row.wrong_answers,
    unanswered: row.unanswered,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const startTryoutAttempt = async ({
  userId,
  tryoutPackageId,
  durationMinutes,
}) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    /*
     * Lock berdasarkan kombinasi user + tryout.
     *
     * PostgreSQL transaction-level advisory lock digunakan
     * agar dua request start yang datang bersamaan tidak
     * membuat dua active attempt.
     */
    await client.query(
      `
        SELECT pg_advisory_xact_lock(
          hashtext($1),
          $2::integer
        )
      `,
      [
        String(userId),
        Number(tryoutPackageId),
      ]
    )

    /*
     * Cari attempt yang masih aktif.
     */
    const activeAttemptResult =
      await client.query(
        `
          SELECT
            id,
            user_id,
            tryout_package_id,
            attempt_number,
            status,
            started_at,
            completed_at,
            expires_at,
            total_score,
            correct_answers,
            wrong_answers,
            unanswered,
            created_at,
            updated_at

          FROM tryout_attempts

          WHERE user_id = $1
            AND tryout_package_id = $2
            AND status = 'in_progress'
            AND expires_at > CURRENT_TIMESTAMP

          ORDER BY attempt_number DESC

          LIMIT 1
        `,
        [
          userId,
          tryoutPackageId,
        ]
      )

    if (activeAttemptResult.rows[0]) {
      await client.query('COMMIT')

      return {
        attempt: mapAttempt(
          activeAttemptResult.rows[0]
        ),
        resumed: true,
      }
    }

    /*
     * Attempt in_progress yang waktunya sudah habis
     * ditandai expired sebelum membuat attempt baru.
     */
    await client.query(
      `
        UPDATE tryout_attempts

        SET
          status = 'expired',
          updated_at = CURRENT_TIMESTAMP

        WHERE user_id = $1
          AND tryout_package_id = $2
          AND status = 'in_progress'
          AND expires_at <= CURRENT_TIMESTAMP
      `,
      [
        userId,
        tryoutPackageId,
      ]
    )

    /*
     * Tentukan nomor attempt berikutnya.
     */
    const attemptNumberResult =
      await client.query(
        `
          SELECT
            COALESCE(
              MAX(attempt_number),
              0
            ) + 1 AS next_attempt_number

          FROM tryout_attempts

          WHERE user_id = $1
            AND tryout_package_id = $2
        `,
        [
          userId,
          tryoutPackageId,
        ]
      )

    const attemptNumber = Number(
      attemptNumberResult.rows[0]
        .next_attempt_number
    )

    /*
     * Buat attempt baru.
     *
     * expires_at dihitung oleh PostgreSQL,
     * bukan frontend.
     */
    const insertResult =
      await client.query(
        `
          INSERT INTO tryout_attempts (
            user_id,
            tryout_package_id,
            attempt_number,
            status,
            started_at,
            expires_at
          )

          VALUES (
            $1,
            $2,
            $3,
            'in_progress',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
              + ($4 * INTERVAL '1 minute')
          )

          RETURNING
            id,
            user_id,
            tryout_package_id,
            attempt_number,
            status,
            started_at,
            completed_at,
            expires_at,
            total_score,
            correct_answers,
            wrong_answers,
            unanswered,
            created_at,
            updated_at
        `,
        [
          userId,
          tryoutPackageId,
          attemptNumber,
          durationMinutes,
        ]
      )

    await client.query('COMMIT')

    return {
      attempt: mapAttempt(
        insertResult.rows[0]
      ),
      resumed: false,
    }
  } catch (error) {
    await client.query('ROLLBACK')

    throw error
  } finally {
    client.release()
  }
}

export const findActiveTryoutAttempt = async ({
  userId,
  tryoutPackageId,
}) => {
  const { rows } = await pool.query(
    `
      SELECT
        id,
        user_id,
        tryout_package_id,
        attempt_number,
        status,
        started_at,
        completed_at,
        expires_at,
        total_score,
        correct_answers,
        wrong_answers,
        unanswered,
        created_at,
        updated_at

      FROM tryout_attempts

      WHERE user_id = $1
        AND tryout_package_id = $2
        AND status = 'in_progress'
        AND expires_at > CURRENT_TIMESTAMP

      ORDER BY attempt_number DESC

      LIMIT 1
    `,
    [
      userId,
      tryoutPackageId,
    ]
  )

  return mapAttempt(rows[0])
}

export const expireElapsedTryoutAttempts = async ({
  userId,
  tryoutPackageId,
}) => {
  await pool.query(
    `
      UPDATE tryout_attempts

      SET
        status = 'expired',
        updated_at = CURRENT_TIMESTAMP

      WHERE user_id = $1
        AND tryout_package_id = $2
        AND status = 'in_progress'
        AND expires_at <= CURRENT_TIMESTAMP
    `,
    [
      userId,
      tryoutPackageId,
    ]
  )
}