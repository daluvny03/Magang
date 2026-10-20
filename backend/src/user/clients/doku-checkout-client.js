
import axios from 'axios'

import { env } from '../../config/env.js'
import { createDokuHeaders } from '../utils/doku-headers.js'

const CHECKOUT_TARGET = '/checkout/v1/payment'

export const createDokuCheckout = async ({
  invoiceNumber,
  amount,
  requestId,
}) => {
  const { doku } = env

  if (
    !doku?.clientId ||
    !doku?.secretKey ||
    !doku?.baseUrl
  ) {
    throw new Error('DOKU configuration is incomplete')
  }

  const numericAmount = Number(amount)
  const dueMinutes = Number(doku.checkoutDueMinutes)

  if (
    !Number.isSafeInteger(numericAmount) ||
    numericAmount <= 0 ||
    !Number.isInteger(dueMinutes) ||
    dueMinutes <= 0
  ) {
    throw new Error('Invalid DOKU checkout parameters')
  }

  if (
    typeof invoiceNumber !== 'string' ||
    !invoiceNumber ||
    typeof requestId !== 'string' ||
    !requestId
  ) {
    throw new Error('Missing DOKU payment identifiers')
  }

  const requestBody = {
    order: {
      invoice_number: invoiceNumber,
      amount: numericAmount,
    },
    payment: {
      payment_due_date: dueMinutes,
    },
  }

  const rawBody = JSON.stringify(requestBody)

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
          status >= 200 && status < 300,
      }
    )

    const result = response.data?.response

    if (
      result?.order?.invoice_number !== invoiceNumber ||
      Number(result?.order?.amount) !== numericAmount ||
      typeof result?.payment?.url !== 'string'
    ) {
      throw new Error('Invalid DOKU checkout response')
    }

    const paymentUrl = new URL(result.payment.url)

    if (paymentUrl.protocol !== 'https:') {
      throw new Error('Invalid DOKU payment URL')
    }

    return {
      invoiceNumber,
      paymentUrl: paymentUrl.toString(),
      expiredDate: result.payment.expired_date ?? null,
      tokenId: result.payment.token_id ?? null,
    }
  } catch (error) {
    if (error.response) {
      const status = error.response.status

      if (status === 409) {
        const conflict = new Error(
          'DOKU checkout requires reconciliation'
        )
        conflict.code = 'DOKU_CHECKOUT_CONFLICT'
        throw conflict
      }

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
