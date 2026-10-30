import { pool } from '../../config/database.js'
import {
  queueSubscriptionActivated
} from '../../repositories/subscription-email.repository.js'

import {
  findActivePaidSubscriptionsForUpdate,
  createSubscription,
  renewSubscription,
  closeSubscriptionForUpgrade,
} from '../repositories/subscription.repository.js'

import {
  findPaymentForUpdate,
  markPaymentApplied,
  markPaymentApplicationNeedsReview,
} from '../repositories/payment.repository.js'

import {
  addSubscriptionDuration
} from '../utils/subscription-duration.js'

const createError = (
  message,
  statusCode = 400,
  code = 'SUBSCRIPTION_LIFECYCLE_ERROR'
) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

const parseUtcTimestamp = (value) => {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(value)
  ) {
    throw createError(
      'Invalid subscription timestamp',
      500
    )
  }

  const date = new Date(`${value}Z`)

  if (!Number.isFinite(date.getTime())) {
    throw createError(
      'Invalid subscription timestamp',
      500
    )
  }

  return date
}

const recordPaymentApplicationConflict = async (
  client,
  paymentId,
  reason
) => {
  await client.query('BEGIN')

  try {
    // Baca user_id terlebih dahulu tanpa lock.
    const lookup = await client.query(
      `
        SELECT user_id
        FROM payments
        WHERE id = $1
      `,
      [paymentId]
    )

    if (!lookup.rowCount) {
      await client.query('ROLLBACK')
      return false
    }

    // Urutan lock harus sama dengan lifecycle utama:
    // user terlebih dahulu, kemudian payment.
    const userLock = await client.query(
      `
        SELECT id
        FROM users
        WHERE id = $1
        FOR UPDATE
      `,
      [lookup.rows[0].user_id]
    )

    if (!userLock.rowCount) {
      await client.query('ROLLBACK')
      return false
    }

    const payment = await findPaymentForUpdate(
      paymentId,
      client
    )

    // Kondisi payment dapat berubah selama menunggu lock.
    // Jangan menandai payment yang sudah diterapkan.
    if (
      !payment ||
      payment.status !== 'paid' ||
      !payment.paid_at ||
      payment.applied_at ||
      payment.application_review_status !== 'none'
    ) {
      await client.query('ROLLBACK')
      return false
    }

    const reviewed =
      await markPaymentApplicationNeedsReview(
        paymentId,
        reason,
        client
      )

    await client.query('COMMIT')

    return Boolean(reviewed)
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch {
      // Error asli tetap diteruskan ke caller.
    }

    throw error
  }
}

const assertUpgradeAllowed = async (
  currentSubscription,
  targetTier,
  client
) => {
  if (
    Number(targetTier.level) <=
    Number(currentSubscription.tier_level)
  ) {
    throw createError(
      'Paid subscription change is not an upgrade',
      409,
      'SUBSCRIPTION_ACTIVATION_CONFLICT'
    )
  }

  const { rows } = await client.query(
    `
      WITH RECURSIVE inherited_tiers(tier_id) AS (
        SELECT $1::bigint

        UNION

        SELECT sti.child_tier_id
        FROM subscription_tier_inheritances sti
        INNER JOIN inherited_tiers it
          ON sti.parent_tier_id = it.tier_id
      )
      SELECT EXISTS (
        SELECT 1
        FROM inherited_tiers
        WHERE tier_id = $2::bigint
      ) AS allowed
    `,
    [
      targetTier.id,
      currentSubscription.subscription_tier_id,
    ]
  )

  if (!rows[0]?.allowed) {
    throw createError(
      'Target tier does not inherit the active subscription',
      409,
      'SUBSCRIPTION_ACTIVATION_CONFLICT'
    )
  }
}

export const applyVerifiedSubscriptionPayment = async (
  paymentId,
  db = pool
) => {
  const client = await db.connect()
  let discardConnection = false

  try {
    await client.query('BEGIN')

    // 1. Ambil identitas user dari payment.
    const lookup = await client.query(
      `
        SELECT user_id
        FROM payments
        WHERE id = $1
      `,
      [paymentId]
    )

    if (lookup.rowCount === 0) {
      throw createError('Payment not found', 404)
    }

    const userId = lookup.rows[0].user_id

    // 2. Konsisten dengan urutan lock checkout:
    // user terlebih dahulu, lalu payment.
    const userResult = await client.query(
      `
        SELECT id, email
        FROM users
        WHERE id = $1
        FOR UPDATE
      `,
      [userId]
    )

    if (userResult.rowCount === 0) {
      throw createError('User not found', 404)
    }

    const payment = await findPaymentForUpdate(
      paymentId,
      client
    )

    if (!payment || String(payment.user_id) !== String(userId)) {
      throw createError('Payment not found', 404)
    }

    // 3. Hanya pembayaran terverifikasi.
    if (payment.status !== 'paid' || !payment.paid_at) {
      throw createError(
        'Payment is not verified as paid',
        409,
        'PAYMENT_NOT_VERIFIED'
      )
    }

    // 4. Idempotency: jangan aktivasi ulang.
    if (payment.applied_at) {
      await client.query('COMMIT')

      return {
        alreadyApplied: true,
        action: 'already_applied',
        paymentId: String(payment.id),
      }
    }
    if (payment.application_review_status !== 'none') {
      throw createError(
        'Payment application requires operator review',
        409,
        'PAYMENT_APPLICATION_REVIEW_REQUIRED'
      )
    }
    // 5. Gunakan snapshot harga/durasi payment.
    const durationValue = Number(payment.duration_value)
    const durationUnit = payment.duration_unit

    if (
      !Number.isSafeInteger(durationValue) ||
      durationValue <= 0 ||
      !['day', 'month', 'year'].includes(durationUnit) ||
      payment.currency !== 'IDR'
    ) {
      throw createError(
        'Invalid subscription payment configuration',
        409,
        'INVALID_SUBSCRIPTION_PAYMENT'
      )
    }

    // 6. Identitas tier berasal dari payment.
    // Jangan mengharuskan is_active = true:
    // tier mungkin dinonaktifkan setelah user membayar.
    const tierResult = await client.query(
      `
        SELECT id, name, slug, level
        FROM subscription_tiers
        WHERE id = $1
      `,
      [payment.subscription_tier_id]
    )

    const targetTier = tierResult.rows[0]

    if (!targetTier || targetTier.slug === 'free') {
      throw createError(
        'Payment references an invalid subscription tier',
        409,
        'INVALID_PAYMENT_TIER'
      )
    }

    // 7. Evaluasi waktu setelah lock diperoleh.
    const { rows: clockRows } = await client.query(
      'SELECT clock_timestamp() AS activated_at'
    )

    const activatedAt = new Date(
      clockRows[0].activated_at
    )

    if (!Number.isFinite(activatedAt.getTime())) {
      throw createError(
        'Invalid activation timestamp',
        500
      )
    }

    const activatedAtIso = activatedAt.toISOString()

    // 8. Kunci semua subscription berbayar aktif.
    const activeSubscriptions =
      await findActivePaidSubscriptionsForUpdate(
        userId,
        activatedAtIso,
        client
      )

    if (activeSubscriptions.length > 1) {
      throw createError(
        'Multiple active paid subscriptions require review',
        409,
        'SUBSCRIPTION_ACTIVATION_CONFLICT'
      )
    }

    const current = activeSubscriptions[0] || null

    let subscription
    let action
    let expiration

    // 9A. Pembelian baru.
    if (!current) {
      expiration = addSubscriptionDuration(
        activatedAt,
        durationValue,
        durationUnit
      )

      subscription = await createSubscription(
        {
          userId,
          tierId: targetTier.id,
          startedAt: activatedAtIso,
          expiredAt: expiration.toISOString(),
        },
        client
      )

      action = 'activated'

    // 9B. Renewal tier yang sama.
    } else if (
      String(current.subscription_tier_id) ===
      String(targetTier.id)
    ) {
      const previousExpiration = parseUtcTimestamp(
        current.expired_at_utc
      )

      expiration = addSubscriptionDuration(
        previousExpiration,
        durationValue,
        durationUnit
      )

      subscription = await renewSubscription(
        current.id,
        expiration.toISOString(),
        client
      )

      action = 'renewed'

    // 9C. Upgrade ke tier yang mewarisi tier aktif.
    } else {
      await assertUpgradeAllowed(
        current,
        targetTier,
        client
      )

      expiration = addSubscriptionDuration(
        activatedAt,
        durationValue,
        durationUnit
      )

      const closed = await closeSubscriptionForUpgrade(
        current.id,
        activatedAtIso,
        client
      )

      if (!closed) {
        throw createError(
          'Failed to close previous subscription',
          409,
          'SUBSCRIPTION_UPGRADE_CONFLICT'
        )
      }

      subscription = await createSubscription(
        {
          userId,
          tierId: targetTier.id,
          startedAt: activatedAtIso,
          expiredAt: expiration.toISOString(),
        },
        client
      )

      action = 'upgraded'
    }

    if (!subscription) {
      throw createError(
        'Failed to apply subscription',
        500
      )
    }

    // 10. Mark applied hanya setelah aktivasi berhasil.
    const appliedPayment = await markPaymentApplied(
      paymentId,
      activatedAtIso,
      client
    )

    if (!appliedPayment) {
      throw createError(
        'Failed to mark payment as applied',
        500
      )
    }

    // 11. Email outbox ikut dalam transaksi yang sama.
    await queueSubscriptionActivated(client, {
      user: userResult.rows[0],
      paymentId: payment.id,
      snapshot: {
        subscriptionId: String(subscription.id),
        tierName: targetTier.name,
        action,
        activatedAt: activatedAtIso,
        expiredAt: expiration.toISOString(),
      },
    })

    await client.query('COMMIT')

    return {
      alreadyApplied: false,
      action,
      paymentId: String(payment.id),
      subscriptionId: String(subscription.id),
    }
  } catch (error) {
    let rolledBack = false
    try {
      await client.query('ROLLBACK')
      rolledBack = true
    } catch (rollbackError) {
      discardConnection = true
      console.error('Subscription activation rollback failed:', {
        paymentId,
        code: rollbackError.code,
      })
    }

    const isBusinessConflict = [
      'SUBSCRIPTION_ACTIVATION_CONFLICT',
      'SUBSCRIPTION_UPGRADE_CONFLICT',
    ].includes(error.code)

    // Gunakan koneksi yang sama setelah rollback; helper mengunci user lalu
    // payment dan memeriksa ulang status sebelum mencatat review.
    if (rolledBack && isBusinessConflict) {
      try {
        const recorded = await recordPaymentApplicationConflict(
          client,
          paymentId,
          error.code
        )
        if (!recorded) {
          console.warn(
            'Payment review was not recorded; payment state may have changed:',
            { paymentId, reason: error.code }
          )
        }
      } catch (reviewError) {
        discardConnection = true
        console.error('Failed to record payment application conflict:', {
          paymentId,
          code: reviewError.code,
        })
      }
    }

    // Pertahankan error bisnis asli. Webhook hanya ACK bila review tersimpan.
    throw error
  } finally {
    client.release(discardConnection)
  }
}
