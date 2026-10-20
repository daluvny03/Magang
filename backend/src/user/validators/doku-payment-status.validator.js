
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

  if (
    response.order?.invoice_number !==
    payment.invoice_number
  ) {
    throw new Error('DOKU invoice mismatch')
  }

  const amount = Number(response.order?.amount)

  if (
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    amount !== Number(payment.amount) ||
    payment.currency !== 'IDR' ||
    (response.order?.currency != null && response.order.currency !== 'IDR')
  ) {
    throw new Error('DOKU payment amount mismatch')
  }

  const originalRequestId =
    response.transaction?.original_request_id

  if (
    originalRequestId != null &&
    ![payment.doku_request_id, payment.invoice_number].includes(originalRequestId)
  ) {
    throw new Error('DOKU transaction identity mismatch')
  }

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

  if (
    !originalRequestId ||
    ![
      payment.doku_request_id,
      payment.invoice_number,
    ].includes(originalRequestId)
  ) {
    throw new Error('DOKU transaction identity mismatch')
  }

  const transactionDate = response.transaction?.date

  if (
    typeof transactionDate !== 'string' ||
    !/(Z|[+-]\d{2}:\d{2})$/.test(transactionDate)
  ) {
    throw new Error('Invalid DOKU transaction date')
  }

  const paidAt = new Date(transactionDate)

  if (!Number.isFinite(paidAt.getTime())) {
    throw new Error('Invalid DOKU payment timestamp')
  }

  return {
    status,
    isPaid: true,
    isOrderExpired: false,
    paidAt: paidAt.toISOString(),
  }
}
