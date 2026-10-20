
export const verifyDokuPaymentStatus = (
  payment,
  response
) => {
  if (!payment || !response) {
    throw new Error('Payment verification data missing')
  }

  const status = response.transaction?.status

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
    payment.currency !== 'IDR'
  ) {
    throw new Error('DOKU payment amount mismatch')
  }

  if (status !== 'SUCCESS') {
    return {
      status,
      isPaid: false,
      paidAt: null,
    }
  }

  const originalRequestId =
    response.transaction?.original_request_id

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
    paidAt: paidAt.toISOString(),
  }
}
