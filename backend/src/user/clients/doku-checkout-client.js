
import axios from 'axios'

import { createDokuHeaders } from '../utils/doku-headers.js'
import {
  validateDokuConfig,
  validateDokuPaymentUrl,
} from '../utils/doku-config.js'
import {
  serializeCheckoutBody,
  validateCheckoutSnapshot,
} from '../utils/doku-checkout-request.js'

const CHECKOUT_TARGET = '/checkout/v1/payment'

export const createDokuCheckout = async ({
  invoiceNumber,
  amount,
  requestId,
  snapshot,
}) => {
  // Retry memakai konfigurasi payload tersimpan, bukan due date/channel terbaru.
  const doku = validateDokuConfig()

  const numericAmount = Number(amount)

  if (
    !Number.isSafeInteger(numericAmount) ||
    numericAmount <= 0 ||
    numericAmount > 999999999999
  ) {
    throw new Error('Invalid DOKU checkout parameters')
  }

  if (
    typeof invoiceNumber !== 'string' ||
    !/^[A-Za-z0-9_-]{1,64}$/.test(invoiceNumber) ||
    typeof requestId !== 'string' ||
    !requestId ||
    requestId.length > 128
  ) {
    throw new Error('Missing DOKU payment identifiers')
  }

  const requestBody = validateCheckoutSnapshot(
    snapshot,
    { invoice_number: invoiceNumber, amount },
    doku
  )
  const rawBody = serializeCheckoutBody(requestBody)

  const headers = createDokuHeaders({
    clientId: doku.clientId,
    secretKey: doku.secretKey,
    requestId,
    requestTarget: CHECKOUT_TARGET,
    rawBody,
  })

  try {
    const response = await axios.post(
      `${doku.baseUrl.replace(/\/$/, '')}${CHECKOUT_TARGET}`,
      rawBody,
      {
        headers,
        timeout: 15000,
        maxRedirects: 0,
        validateStatus: (status) =>
          (status >= 200 && status < 300) || status === 409,
      }
    )

    const result = response.data?.response

    // 409 hanya dapat digunakan jika body replay memenuhi validasi yang sama.
    if (
      result?.order?.invoice_number !== invoiceNumber ||
      Number(result?.order?.amount) !== numericAmount ||
      (result?.order?.currency != null && result.order.currency !== 'IDR') ||
      typeof result?.payment?.url !== 'string'
    ) {
      throw new Error('Invalid DOKU checkout response')
    }

    const paymentUrl = validateDokuPaymentUrl(
      result.payment.url,
      doku.checkoutOrigin
    )

    return {
      invoiceNumber,
      paymentUrl,
      expiredDate: result.payment.expired_date ?? null,
      tokenId: result.payment.token_id ?? null,
    }
  } catch (error) {
    if (error.response) {
      const status = error.response.status

      const providerError = new Error(
        'DOKU checkout request was rejected'
      )
      providerError.code = 'DOKU_CHECKOUT_HTTP_ERROR'
      providerError.httpStatus = status
      throw providerError
    }

    if (error.code || error.request) {
      const uncertainError = new Error(
        'DOKU checkout outcome is uncertain'
      )
      uncertainError.code = 'DOKU_CHECKOUT_UNCERTAIN'
      throw uncertainError
    }

    throw error
  }
}
