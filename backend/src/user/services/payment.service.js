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

  try {
    const dokuResult = await createDokuCheckout({
      invoiceNumber: claimed.invoice_number,
      amount: claimed.amount,
      requestId: claimed.doku_request_id,
      snapshot: claimed.checkout_request_body
    });

    const expiredAt = parseDokuExpiredDate(
      dokuResult.expiredDate
    );

    const updated = await saveDokuCheckoutResult({
      paymentId: claimed.id,
      paymentUrl: dokuResult.paymentUrl,
      expiredAt
    });

    const latest = updated ??
      await findPaymentByIdAndUserId(claimed.id, userId);

    return {
      payment: mapPayment(latest),
      isExisting: false
    };
  } catch (error) {
    // Pertahankan status reconciling sampai hasil diperiksa secara terpercaya.
    console.error('DOKU checkout initialization failed:', {
      paymentId: claimed.id,
      code: error.code ?? 'DOKU_INIT_ERROR',
      httpStatus: error.httpStatus
    });

    const current = await findPaymentByIdAndUserId(
      claimed.id,
      userId
    );

    return {
      payment: mapPayment(current),
      isExisting: false
    };
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
