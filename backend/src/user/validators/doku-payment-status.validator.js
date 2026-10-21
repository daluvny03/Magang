import { verifyDokuPaymentIdentity, parseDokuTransactionDate } from './doku-payment-evidence.validator.js'
import { extractDokuTransactionId } from '../utils/doku-transaction-identifier.js'
export const verifyDokuPaymentStatus = (
  payment,
  response
) => {
  if (!payment || !response) {
    throw new Error('Payment verification data missing')
  }

  const transactionStatus = response.transaction?.status
  const orderStatus = response.order?.status
  const status = transactionStatus ?? orderStatus

  if (typeof status !== 'string') {
    throw new Error('Invalid DOKU transaction status')
  }

  verifyDokuPaymentIdentity(payment, response)

  if (orderStatus === 'ORDER_EXPIRED' && transactionStatus === 'SUCCESS') {
    throw new Error('Conflicting DOKU order and transaction status')
  }

  if (status !== 'SUCCESS') {
    return {
      status,
      isPaid: false,
      // Channel EXPIRED/FAILED tidak membuktikan seluruh Checkout berakhir.
      isOrderExpired: orderStatus === 'ORDER_EXPIRED',
      paidAt: null,
    }
  }

  const paidAt = parseDokuTransactionDate(response.transaction?.date)

  return {
    status,
    isPaid: true,
    isOrderExpired: false,
    paidAt,
    transactionId: extractDokuTransactionId(response),
  }
}
