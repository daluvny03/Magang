
import { pool } from '../../config/database.js';
import { buildCheckoutSnapshot } from '../utils/doku-checkout-request.js';

const checkoutError = (message, statusCode, code) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

const assertSubscriptionCheckoutAllowed = async (
  userId,
  targetTier,
  client
) => {
  const { rows: activeSubscriptions } =
    await client.query(
      `
        SELECT
          us.subscription_tier_id,
          st.level
        FROM user_subscriptions us
        INNER JOIN subscription_tiers st
          ON st.id = us.subscription_tier_id
        WHERE us.user_id = $1
          AND us.status = 'active'
          AND st.slug <> 'free'
          AND us.started_at <=
            (clock_timestamp() AT TIME ZONE 'UTC')
          AND us.expired_at >
            (clock_timestamp() AT TIME ZONE 'UTC')
        ORDER BY us.id DESC
        FOR UPDATE OF us
      `,
      [userId]
    )

  if (activeSubscriptions.length > 1) {
    throw checkoutError(
      'Multiple active subscriptions require review',
      409,
      'MULTIPLE_ACTIVE_SUBSCRIPTIONS'
    )
  }

  const current = activeSubscriptions[0]

  // Tidak ada subscription aktif:
  // User bebas memilih tier berbayar yang tersedia.
  if (!current) {
    return 'new'
  }

  // Subscription sama: renewal.
  if (
    String(current.subscription_tier_id) ===
    String(targetTier.id)
  ) {
    return 'renewal'
  }

  // Upgrade harus menuju level yang lebih tinggi.
  if (Number(targetTier.level) <= Number(current.level)) {
    throw checkoutError(
      'Cannot switch or downgrade an active subscription',
      409,
      'SUBSCRIPTION_CHANGE_NOT_ALLOWED'
    )
  }

  // Target harus mewarisi subscription saat ini,
  // baik secara langsung maupun transitif.
  const { rows } = await client.query(
    `
      WITH RECURSIVE inherited_tiers(tier_id) AS (
        SELECT $1::bigint

        UNION

        SELECT sti.child_tier_id
        FROM subscription_tier_inheritances sti
        INNER JOIN inherited_tiers it
          ON it.tier_id = sti.parent_tier_id
      )
      SELECT EXISTS (
        SELECT 1
        FROM inherited_tiers
        WHERE tier_id = $2::bigint
      ) AS allowed
    `,
    [
      targetTier.id,
      current.subscription_tier_id,
    ]
  )

  if (!rows[0]?.allowed) {
    throw checkoutError(
      'Target subscription does not inherit the current tier',
      409,
      'SUBSCRIPTION_UPGRADE_NOT_ALLOWED'
    )
  }

  return 'upgrade'
}

export const findCheckoutTierById = async (
  subscriptionTierId,
  client = pool
) => {
  const { rows } = await client.query(
    `
      SELECT
        id,
        name,
        slug,
        price,
        duration_value,
        duration_unit,
        level
      FROM subscription_tiers
      WHERE id = $1
        AND is_active = true
      LIMIT 1
    `,
    [subscriptionTierId]
  )

  return rows[0] || null
}

export const findOpenPaymentByUserId = async (
  userId,
  client = pool
) => {
  const { rows } = await client.query(
    `
      SELECT *
      FROM payments
      WHERE user_id = $1
        AND status IN (
          'initiating',
          'pending',
          'reconciling'
        )
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
};

export const findPaymentByIdAndUserId = async (
  paymentId,
  userId
) => {
  const { rows } = await pool.query(
    `
      SELECT *
      FROM payments
      WHERE id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [paymentId, userId]
  );

  return rows[0] || null;
};

// Durable polling cooldown shared by all backend instances; no checkout replay.
export const claimPaymentStatusRefresh = async (paymentId) => {
  const { rowCount } = await pool.query(`
    UPDATE payments SET next_reconciliation_at = NOW() + INTERVAL '30 seconds'
    WHERE id = $1
      AND (status IN ('initiating', 'pending', 'reconciling')
           OR (status = 'paid' AND applied_at IS NULL AND application_review_status = 'none'))
      AND (next_reconciliation_at IS NULL OR next_reconciliation_at <= NOW())
  `, [paymentId])
  return rowCount === 1
}

export const createPayment = async ({
  userId,
  subscriptionTierId,
  invoiceNumber,
  dokuRequestId,
  checkoutConfig,
}) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Serialisasi checkout untuk user yang sama.
    const userResult = await client.query(
      `
        SELECT id, email
        FROM users
        WHERE id = $1
          AND is_active = true
        FOR UPDATE
      `,
      [userId]
    );

    if (userResult.rowCount === 0) {
      const error = new Error(
        'User not found or inactive'
      );
      error.statusCode = 403;
      throw error;
    }

    // Gunakan checkout existing jika masih terbuka.
    const existingPayment =
      await findOpenPaymentByUserId(
        userId,
        client
      );
    
    if (existingPayment) {
      if (
        String(existingPayment.subscription_tier_id) !==
        String(subscriptionTierId)
      ) {
        throw checkoutError(
          'You already have an open checkout for another subscription',
          409,
          'OTHER_SUBSCRIPTION_CHECKOUT_OPEN'
        )
      }

      await client.query('COMMIT')

      return {
        payment: existingPayment,
        isExisting: true,
      }
    }
    
    const tier = await findCheckoutTierById(
      subscriptionTierId,
      client
    )

    if (!tier) {
      throw checkoutError(
        'Subscription tier is unavailable',
        404,
        'SUBSCRIPTION_TIER_UNAVAILABLE'
      )
    }

    if (tier.slug === 'free') {
      throw checkoutError(
        'Free subscription cannot be purchased',
        400,
        'FREE_SUBSCRIPTION_CHECKOUT_NOT_ALLOWED'
      )
    }

    await assertSubscriptionCheckoutAllowed(
      userId,
      tier,
      client
    )

    const price = Number(tier.price);
    const durationValue = Number(tier.duration_value);
    const durationUnit = tier.duration_unit;

    const allowedDurationUnits = [
      'day',
      'month',
      'year'
    ];

    if (
      !Number.isSafeInteger(price) ||
      price <= 0 ||
      price > 999999999999 ||
      !Number.isSafeInteger(durationValue) ||
      durationValue <= 0 ||
      !allowedDurationUnits.includes(durationUnit)
    ) {
      const error = new Error(
        'Invalid subscription tier configuration'
      );
      error.statusCode = 500;
      throw error;
    }

    const { rows } = await client.query(
      `
        INSERT INTO payments (
          user_id,
          subscription_tier_id,
          invoice_number,
          doku_request_id,
          amount,
          currency,
          duration_value,
          duration_unit,
          status,
          checkout_request_body
        )
        VALUES (
          $1, $2, $3, $4, $5,
          'IDR', $6, $7, 'initiating', $8::jsonb
        )
        RETURNING *
      `,
      [
        userId,
        tier.id,
        invoiceNumber,
        dokuRequestId,
        tier.price,
        tier.duration_value,
        tier.duration_unit,
        JSON.stringify(buildCheckoutSnapshot({
          invoiceNumber,
          amount: tier.price,
          customerEmail: userResult.rows[0].email,
          config: checkoutConfig
        }))
      ]
    );

    await client.query('COMMIT');

    return {
      payment: rows[0],
      isExisting: false
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};


export const findPaymentForUpdate = async (
  paymentId,
  client
) => {
  const { rows } = await client.query(
    `
      SELECT *
      FROM payments
      WHERE id = $1
      FOR UPDATE
    `,
    [paymentId]
  );

  return rows[0] || null;
};

// Dipanggil dalam transaksi yang sama dengan markPaymentPaid, setelah row lock
// dan validasi bukti SUCCESS. Identifier existing tidak pernah ditimpa.
export const saveDokuTransactionId = async (paymentId, transactionId, client) => {
  if (transactionId == null) return
  const { rowCount } = await client.query(
    `
      UPDATE payments
      SET doku_transaction_id = COALESCE(doku_transaction_id, $2),
          updated_at = NOW()
      WHERE id = $1
        AND (doku_transaction_id IS NULL OR doku_transaction_id = $2)
    `,
    [paymentId, transactionId]
  )
  if (rowCount !== 1) {
    const error = new Error('DOKU transaction identifier conflict')
    error.code = 'DOKU_TRANSACTION_ID_CONFLICT'
    throw error
  }
}

// Hanya dipanggil setelah bukti pembayaran diverifikasi, dengan row lock.
// applied_at tetap menjadi tanggung jawab transaksi subscription lifecycle.
// SUCCESS terverifikasi yang terlambat tetap dihormati setelah operator menutup
// payment sebagai cancelled; catatan recovery_resolution tetap dipertahankan.
export const markPaymentPaid = async (
  paymentId,
  paidAt,
  client
) => {
  const { rows } = await client.query(
    `
      UPDATE payments
      SET
        status = 'paid',
        paid_at = $2,
        reconciliation_attempt_count = 0,
        next_reconciliation_at = NULL,
        updated_at = NOW()
      WHERE id = $1
        AND status IN ('initiating', 'pending', 'reconciling', 'expired', 'cancelled')
        AND paid_at IS NULL
        AND applied_at IS NULL
      RETURNING *
    `,
    [paymentId, paidAt]
  );

  return rows[0] || null;
};

export const markPaymentApplied = async (
  paymentId,
  appliedAt,
  client
) => {
  const { rows } = await client.query(
    `
      UPDATE payments
      SET
        applied_at = $2,
        updated_at = NOW()
      WHERE id = $1
        AND status = 'paid'
        AND paid_at IS NOT NULL
        AND applied_at IS NULL
        AND application_review_status = 'none'
      RETURNING *
    `,
    [paymentId, appliedAt]
  );

  return rows[0] || null;
};

export const claimCheckoutInitialization = async (paymentId) => {
  const { rows } = await pool.query(
    `
      UPDATE payments
      SET status = 'reconciling',
          updated_at = NOW()
      WHERE id = $1
        AND status = 'initiating'
        AND checkout_request_body IS NOT NULL
      RETURNING *
    `,
    [paymentId]
  )

  return rows[0] ?? null
}

export const claimCheckoutRecovery = async (paymentId, db = pool) => {
  const { rows } = await db.query(
    `
      UPDATE payments
      SET status = 'reconciling', updated_at = NOW()
      WHERE id = $1
        AND status IN ('initiating', 'reconciling')
        AND checkout_request_body IS NOT NULL
        AND payment_url IS NULL
        AND paid_at IS NULL AND applied_at IS NULL
        AND updated_at <= NOW() - INTERVAL '60 seconds'
        AND (next_reconciliation_at IS NULL OR next_reconciliation_at <= NOW())
      RETURNING *
    `,
    [paymentId]
  )
  return rows[0] ?? null
}

// Hanya order-level expiry terverifikasi, bukan kegagalan suatu channel.
export const markPaymentOrderExpired = async (paymentId, client) => {
  const { rows } = await client.query(
    `
      UPDATE payments SET status = 'expired', updated_at = NOW()
      WHERE id = $1
        AND status IN ('initiating', 'pending', 'reconciling')
        AND paid_at IS NULL AND applied_at IS NULL
      RETURNING *
    `,
    [paymentId]
  )
  return rows[0] ?? null
}

export const saveDokuCheckoutResult = async ({
  paymentId,
  paymentUrl,
  expiredAt,
}, db = pool) => {
  const { rows } = await db.query(
    `
      UPDATE payments
      SET payment_url = $2,
          expired_at = $3,
          status = 'pending',
          updated_at = NOW()
      WHERE id = $1
        AND status = 'reconciling'
        AND payment_url IS NULL
        AND paid_at IS NULL
      RETURNING *
    `,
    [paymentId, paymentUrl, expiredAt]
  )

  return rows[0] ?? null
}

export const findPaymentsForReconciliation = async (
  limit = 20,
  db = pool
) => {
  const { rows } = await db.query(
    `
      SELECT *
      FROM payments
      WHERE status IN ('initiating', 'pending', 'reconciling')
        AND updated_at <= NOW() - INTERVAL '60 seconds'
        AND (
          next_reconciliation_at IS NULL
          OR next_reconciliation_at <= NOW()
        )
      ORDER BY
        COALESCE(next_reconciliation_at, updated_at),
        id
      LIMIT $1
    `,
    [limit]
  )

  return rows
}

export const findUnappliedPaidPayments = async (
  limit = 20,
  db = pool
) => {
  const { rows } = await db.query(
    `
      SELECT *
      FROM payments
      WHERE status = 'paid'
        AND paid_at IS NOT NULL
        AND applied_at IS NULL
        AND application_review_status = 'none'
        AND (
          next_reconciliation_at IS NULL
          OR next_reconciliation_at <= NOW()
        )
      ORDER BY paid_at ASC, id ASC
      LIMIT $1
    `,
    [limit]
  )

  return rows
}

export const scheduleNextPaymentReconciliation = async (
  paymentId,
  db = pool
) => {
  const { rows } = await db.query(
    `
      UPDATE payments
      SET
        reconciliation_attempt_count =
          LEAST(reconciliation_attempt_count + 1, 8),
        next_reconciliation_at = NOW()
          + (
            LEAST(
              3600,
              60 * POWER(
                2,
                LEAST(reconciliation_attempt_count, 6)
              )
            ) * INTERVAL '1 second'
          )
      WHERE id = $1
        AND (
            status IN ('initiating', 'pending', 'reconciling')
            OR (status = 'paid' AND applied_at IS NULL AND application_review_status = 'none')
        )
      RETURNING reconciliation_attempt_count
    `,
    [paymentId]
  )
  if (Number(rows[0]?.reconciliation_attempt_count) === 8) {
    console.error('Payment recovery requires operator review; slow retries continue:', {
      paymentId,
      code: 'PAYMENT_RECOVERY_ESCALATED',
    })
  }
}

export const findPaymentHistoryByUserId = async ({
  userId,
  limit,
  offset,
}) => {
  const { rows } = await pool.query(
    `
      SELECT
        p.id::text AS "id",
        p.invoice_number AS "invoiceNumber",
        st.name AS "tierName",
        p.amount AS "amount",
        p.currency AS "currency",
        p.status AS "status",
        p.duration_value AS "durationValue",
        p.duration_unit AS "durationUnit",
        p.paid_at AS "paidAt",
        p.applied_at AS "appliedAt",
        p.expired_at AS "expiredAt",
        p.created_at AS "createdAt"

      FROM payments p

      LEFT JOIN subscription_tiers st
        ON st.id = p.subscription_tier_id

      WHERE p.user_id = $1

      ORDER BY
        p.created_at DESC,
        p.id DESC

      LIMIT $2
      OFFSET $3
    `,
    [userId, limit, offset]
  )

  return rows
}

export const countPaymentHistoryByUserId = async (
  userId
) => {
  const { rows } = await pool.query(
    `
      SELECT
        COUNT(*)::integer AS total

      FROM payments

      WHERE user_id = $1
    `,
    [userId]
  )

  return rows[0]?.total ?? 0
}

export const markPaymentApplicationNeedsReview = async (
  paymentId,
  reason,
  client
) => {
  const { rows } = await client.query(
    `
      UPDATE payments
      SET
        application_review_status = 'needs_review',
        application_review_reason = $2,
        application_review_at = clock_timestamp(),
        next_reconciliation_at = NULL,
        updated_at = NOW()
      WHERE id = $1
        AND status = 'paid'
        AND paid_at IS NOT NULL
        AND applied_at IS NULL
        AND application_review_status = 'none'
      RETURNING
        id,
        application_review_status,
        application_review_reason
    `,
    [paymentId, reason]
  )

  return rows[0] ?? null
}
