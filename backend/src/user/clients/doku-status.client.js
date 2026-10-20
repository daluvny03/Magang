import { randomUUID } from 'node:crypto'
import axios from 'axios'

import { createDokuHeaders } from '../utils/doku-headers.js'
import { validateDokuConfig } from '../utils/doku-config.js'

export const checkDokuPaymentStatus = async ({
  invoiceNumber,
}) => {
  const doku = validateDokuConfig()

  if (
    typeof invoiceNumber !== 'string' ||
    !/^[A-Za-z0-9_-]{1,64}$/.test(invoiceNumber)
  ) {
    throw new Error('Invalid invoice number')
  }

  const requestTarget =
    `/orders/v1/status/${encodeURIComponent(invoiceNumber)}`

  const requestId = randomUUID()

  const headers = createDokuHeaders({
    clientId: doku.clientId,
    secretKey: doku.secretKey,
    requestId,
    requestTarget,
    // Tidak ada rawBody untuk GET.
  })

  try {
    const response = await axios.get(
      `${doku.baseUrl.replace(/\/$/, '')}${requestTarget}`,
      {
        headers,
        timeout: 15000,
        maxRedirects: 0,
      }
    )

    const result = response.data

    if (
      result?.order?.invoice_number !== invoiceNumber ||
      (
        typeof result?.transaction?.status !== 'string' &&
        !['ORDER_GENERATED', 'ORDER_EXPIRED'].includes(result?.order?.status)
      )
    ) {
      throw new Error('Invalid DOKU status response')
    }

    return result
  } catch (error) {
    const statusError = new Error(
      'Unable to retrieve DOKU payment status'
    )

    statusError.code = 'DOKU_STATUS_CHECK_FAILED'
    statusError.httpStatus = error.response?.status

    throw statusError
  }
}
