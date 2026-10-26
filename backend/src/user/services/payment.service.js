import { randomBytes, randomUUID } from 'node:crypto';

import {
  claimCheckoutInitialization,
  createPayment,
  findPaymentByIdAndUserId,
  saveDokuCheckoutResult,
  claimPaymentStatusRefresh,
} from '../repositories/payment.repository.js'

import { createDokuCheckout } from '../clients/doku-checkout-client.js'
import { parseDokuExpiredDate } from '../utils/doku-date.js'
import { validateDokuConfig } from '../utils/doku-config.js'
import { reconcileDokuPayment } from './payment-recovery.service.js'
import { applyVerifiedPremiumPayment } from './subscription-lifecycle.service.js'


const generateInvoiceNumber = () => {
  // 28 karakter alfanumerik, dengan 96 bit randomness.
  return `CPNS${randomBytes(12).toString('hex')}`.toUpperCase();
};

const mapPayment = (row) => ({
  id: String(row.id),
  invoiceNumber: row.invoice_number,
  amount: Number(row.amount),
  currency: row.currency,
  status: row.status,
  duration: {
    value: Number(row.duration_value),
    unit: row.duration_unit
  },
  paymentUrl: row.status === 'pending' ? row.payment_url : null,
  expiredAt: row.expired_at,
  paidAt: row.paid_at,
  appliedAt: row.applied_at,
  createdAt: row.created_at
});

export const createPremiumCheckout = async (userId, replaceExpired = true) => {
  // Kegagalan konfigurasi lokal tidak boleh membuat transaksi reconciling.
  const checkoutConfig = validateDokuConfig({ checkout: true });
  // Identitas dibuat oleh backend, bukan frontend.
  const invoiceNumber = generateInvoiceNumber();
  const dokuRequestId = randomUUID();

  const created = await createPayment({
    userId,
    invoiceNumber,
    dokuRequestId,
    checkoutConfig
  });

  const payment = created.payment ?? created;

  if (payment.status !== 'initiating') {
    // A user-requested checkout can recover an existing uncertain request even
    // when the background scheduler is disabled. Recovery owns the SQL claim,
    // cooldown, inquiry-first policy and immutable invoice/request/body replay.
    if (['pending', 'reconciling'].includes(payment.status) &&
        !payment.paid_at && !payment.applied_at) {
      let checked = false
      try {
        const result = await reconcileDokuPayment(payment.id, {
          allowReplay: payment.status === 'reconciling' && !payment.payment_url,
        })
        checked = Boolean(result && result.status !== 'skipped')
      } catch (error) {
        console.error('User-requested checkout recovery unresolved:', {
          paymentId: payment.id,
          dokuRequestId: payment.doku_request_id,
          code: error.code ?? 'CHECKOUT_RECOVERY_FAILED',
          httpStatus: error.httpStatus,
          providerDiagnostic: error.providerDiagnostic,
        })
      }
      // Inquiry may have failed before replay successfully recovered the URL.
      // Always return the latest persisted state, never the stale pre-recovery row.
      const latest = await findPaymentByIdAndUserId(payment.id, userId)
      // Only a provider-verified order expiry releases the open-payment slot.
      // A second create still uses the repository's per-user lock/unique index.
      if (latest.status === 'expired' && checked && replaceExpired) {
        return createPremiumCheckout(userId, false)
      }
      const mapped = mapPayment(latest)
      if (!checked) mapped.paymentUrl = null // Never reopen a stale URL after inquiry failure.
      return { payment: mapped, isExisting: true }
    }
    return {
      payment: mapPayment(payment),
      isExisting: true
    };
  }

  const claimed = await claimCheckoutInitialization(payment.id);

  if (!claimed) {
    const current = await findPaymentByIdAndUserId(
      payment.id,
      userId
    );

    return {
      payment: mapPayment(current),
      isExisting: true
    };
  }
  let checkoutStage = 'create_checkout'

  try {
    const dokuResult = await createDokuCheckout({
      invoiceNumber: claimed.invoice_number,
      amount: claimed.amount,
      requestId: claimed.doku_request_id,
      snapshot: claimed.checkout_request_body,
    })

    // TAHAP 2: Parsing tanggal kedaluwarsa
    checkoutStage = 'parse_expiration'

    const expiredAt = parseDokuExpiredDate(
      dokuResult.expiredDate
    )

    // TAHAP 3: Simpan checkout URL ke database
    checkoutStage = 'save_checkout'

    const updated = await saveDokuCheckoutResult({
      paymentId: claimed.id,
      paymentUrl: dokuResult.paymentUrl,
      expiredAt,
    })

    if (!updated) {
      const error = new Error('Checkout URL was not persisted')
      error.code = 'CHECKOUT_SAVE_CONFLICT'
      throw error
    }

    // TAHAP 4: Kembalikan pembayaran ke frontend
    checkoutStage = 'map_payment'

    return {
      payment: mapPayment(updated),
      isExisting: false,
    }

  } catch (error) {
    console.error('DOKU checkout initialization failed:', {
      paymentId: claimed.id, stage: checkoutStage,
      code: error.code ?? 'DOKU_INIT_ERROR', httpStatus: error.httpStatus,
      providerDiagnostic: error.providerDiagnostic,
    })
    const current = await findPaymentByIdAndUserId(
      claimed.id,
      userId
    )

    return {
      payment: mapPayment(current),
      isExisting: false,
    }
  }

};

export const getUserPaymentById = async (
  paymentId,
  userId
) => {
  const payment = await findPaymentByIdAndUserId(
    paymentId,
    userId
  );

  if (!payment) {
    const error = new Error('Payment not found');
    error.statusCode = 404;
    throw error;
  }

  // Ownership is checked before any provider request or subscription mutation.
  if ((['initiating', 'pending', 'reconciling'].includes(payment.status) ||
      (payment.status === 'paid' && !payment.applied_at)) &&
      await claimPaymentStatusRefresh(payment.id)) {
    try {
      if (payment.status === 'paid') await applyVerifiedPremiumPayment(payment.id)
      else await reconcileDokuPayment(payment.id, { allowReplay: false })
    } catch (error) {
      console.error('Payment status refresh unresolved:', {
        paymentId: payment.id, code: error.code ?? 'PAYMENT_STATUS_REFRESH_FAILED',
        httpStatus: error.httpStatus,
      })
    }
    return mapPayment(await findPaymentByIdAndUserId(payment.id, userId))
  }
  return mapPayment(payment);
};
