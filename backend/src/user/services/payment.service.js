import { randomBytes, randomUUID } from 'node:crypto';

import {
  claimCheckoutInitialization,
  createPayment,
  findPaymentByIdAndUserId,
  saveDokuCheckoutResult,
} from '../repositories/payment.repository.js'

import { createDokuCheckout } from '../clients/doku-checkout-client.js'
import { parseDokuExpiredDate } from '../utils/doku-date.js'
import { validateDokuConfig } from '../utils/doku-config.js'
import { reconcileDokuPayment } from './payment-recovery.service.js'


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
  paymentUrl: row.payment_url,
  expiredAt: row.expired_at,
  paidAt: row.paid_at,
  appliedAt: row.applied_at,
  createdAt: row.created_at
});

export const createPremiumCheckout = async (userId) => {
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
    if (payment.status === 'reconciling' && !payment.payment_url &&
        !payment.paid_at && !payment.applied_at) {
      try {
        await reconcileDokuPayment(payment.id)
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
      return { payment: mapPayment(latest), isExisting: true }
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
    // TAHAP 1: Kirim request checkout ke DOKU
    console.info('DOKU INIT START:', {
      paymentId: claimed.id,
      stage: checkoutStage,
    })

    const dokuResult = await createDokuCheckout({
      invoiceNumber: claimed.invoice_number,
      amount: claimed.amount,
      requestId: claimed.doku_request_id,
      snapshot: claimed.checkout_request_body,
    })

    console.info('DOKU CHECKOUT CREATED:', {
      paymentId: claimed.id,
      hasPaymentUrl: Boolean(dokuResult.paymentUrl),
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

    console.info('DOKU CHECKOUT SAVED:', {
      paymentId: claimed.id,
      status: updated.status,
      hasPaymentUrl: Boolean(updated.payment_url),
    })

    // TAHAP 4: Kembalikan pembayaran ke frontend
    checkoutStage = 'map_payment'

    return {
      payment: mapPayment(updated),
      isExisting: false,
    }

  } catch (error) {
    console.error('DOKU INIT FAILED:', {
      paymentId: claimed.id,
      stage: checkoutStage,
      code: error.code ?? 'DOKU_INIT_ERROR',
      message: error.message,
      expectedOrigin: error.expectedOrigin,
      receivedOrigin: error.receivedOrigin,
      httpStatus: error.httpStatus,
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

  return mapPayment(payment);
};
