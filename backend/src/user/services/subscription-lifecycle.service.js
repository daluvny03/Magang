
import { pool } from '../../config/database.js';

import {
  findCurrentPremiumSubscriptionForUpdate,
  createPremiumSubscription,
  renewPremiumSubscription
} from '../repositories/subscription.repository.js';

import {
  findPaymentForUpdate,
  markPaymentApplied
} from '../repositories/payment.repository.js';

import {
  addCalendarYears
} from '../utils/subscription-duration.js';

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parseUtcTimestamp = (value) => {
  if (typeof value !== 'string') {
    throw createError(
      'Invalid subscription timestamp',
      500
    );
  }

  const normalized = value.replace(
    /(\.\d{3})\d+/,
    '$1'
  );

  const date = new Date(`${normalized}Z`);

  if (Number.isNaN(date.getTime())) {
    throw createError(
      'Invalid subscription timestamp',
      500
    );
  }

  return date;
};

export const applyVerifiedPremiumPayment = async (
  paymentId
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Mengambil user_id dari payment tanpa lock.
    // Nilainya kemudian diverifikasi ulang setelah lock.
    const paymentLookup = await client.query(
      `
        SELECT user_id
        FROM payments
        WHERE id = $1
      `,
      [paymentId]
    );

    if (paymentLookup.rowCount === 0) {
      throw createError('Payment not found', 404);
    }

    const userId = paymentLookup.rows[0].user_id;

    // Lock user terlebih dahulu agar urutan lock konsisten.
    const userLock = await client.query(
      `
        SELECT id
        FROM users
        WHERE id = $1
        FOR UPDATE
      `,
      [userId]
    );

    if (userLock.rowCount === 0) {
      throw createError('User not found', 404);
    }

    const payment = await findPaymentForUpdate(
      paymentId,
      client
    );

    if (!payment || payment.user_id !== userId) {
      throw createError('Payment not found', 404);
    }

    if (payment.status !== 'paid' || !payment.paid_at) {
      throw createError(
        'Payment is not verified as paid',
        409
      );
    }

    if (payment.applied_at) {
      await client.query('COMMIT');

      return {
        alreadyApplied: true,
        action: 'already_applied',
        paymentId: String(payment.id)
      };
    }

    if (
      Number(payment.duration_value) !== 1 ||
      payment.duration_unit !== 'year' ||
      payment.currency !== 'IDR'
    ) {
      throw createError(
        'Invalid Premium payment configuration',
        409
      );
    }

    const tierResult = await client.query(
      `
        SELECT id
        FROM subscription_tiers
        WHERE id = $1
          AND slug = 'premium'
      `,
      [payment.subscription_tier_id]
    );

    if (tierResult.rowCount === 0) {
      throw createError(
        'Payment does not reference Premium',
        409
      );
    }

    // Evaluasi setelah user/payment lock diperoleh. CURRENT_TIMESTAMP
    // masih menunjuk awal transaksi, termasuk waktu menunggu lock.
    const timeResult = await client.query(`
      SELECT clock_timestamp() AS activated_at
    `);

    const activatedAt = new Date(
      timeResult.rows[0].activated_at
    );

    const currentSubscription =
      await findCurrentPremiumSubscriptionForUpdate(
        userId,
        activatedAt.toISOString(),
        client
      );

    let subscription;
    let action;

    if (currentSubscription) {
      const previousExpiration = parseUtcTimestamp(
        currentSubscription.expired_at_utc
      );

      const newExpiration = addCalendarYears(
        previousExpiration,
        1
      );

      subscription = await renewPremiumSubscription(
        currentSubscription.id,
        newExpiration.toISOString(),
        client
      );

      action = 'renewed';
    } else {
      const expiredAt = addCalendarYears(
        activatedAt,
        1
      );

      subscription = await createPremiumSubscription(
        {
          userId,
          tierId: payment.subscription_tier_id,
          startedAt: activatedAt.toISOString(),
          expiredAt: expiredAt.toISOString()
        },
        client
      );

      action = 'activated';
    }

    if (!subscription) {
      throw createError(
        'Failed to apply Premium subscription',
        500
      );
    }

    const appliedPayment = await markPaymentApplied(
      paymentId,
      activatedAt.toISOString(),
      client
    );

    if (!appliedPayment) {
      throw createError(
        'Failed to mark payment as applied',
        500
      );
    }

    await client.query('COMMIT');

    return {
      alreadyApplied: false,
      action,
      paymentId: String(payment.id),
      subscriptionId: String(subscription.id)
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
