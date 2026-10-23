
import { randomUUID } from 'node:crypto'
import axios from 'axios'

import { createDokuHeaders } from '../utils/doku-headers.js'
import { validateDokuConfig } from '../utils/doku-config.js'
import { buildDokuErrorDiagnostic } from '../utils/doku-error-diagnostic.js'

export const checkDokuPaymentStatus = async ({
  invoiceNumber,
  lookupRequestId = null,
}) => {
  const doku = validateDokuConfig()

  if (
    typeof invoiceNumber !== 'string' ||
    !/^[A-Za-z0-9_-]{1,64}$/.test(invoiceNumber)
  ) {
    throw new Error('Invalid invoice number')
  }

  if (
    lookupRequestId !== null &&
    (
      typeof lookupRequestId !== 'string' ||
      !/^[A-Za-z0-9_-]{1,128}$/.test(lookupRequestId)
    )
  ) {
    throw new Error('Invalid lookup Request ID')
  }

  const identifier = lookupRequestId ?? invoiceNumber

  const requestTarget =
    `/orders/v1/status/${encodeURIComponent(identifier)}`

  // ID unik untuk panggilan GET saat ini.
  // Bukan ID transaksi checkout yang sedang dicari.
  const inquiryRequestId = randomUUID()

  const headers = createDokuHeaders({
    clientId: doku.clientId,
    secretKey: doku.secretKey,
    requestId: inquiryRequestId,
    requestTarget,
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
        !['ORDER_GENERATED', 'ORDER_EXPIRED']
          .includes(result?.order?.status)
      )
    ) {
      const error = new Error('Invalid DOKU status response')
      error.code = 'DOKU_INVALID_STATUS_RESPONSE'
      throw error
    }

    return result
  } catch (error) {
    const statusError = new Error(
      'Unable to retrieve DOKU payment status'
    )

    statusError.code = 'DOKU_STATUS_CHECK_FAILED'
    statusError.httpStatus = error.response?.status
    statusError.lookupType =
      lookupRequestId ? 'request_id' : 'invoice'

    statusError.providerDiagnostic = error.response
      ? buildDokuErrorDiagnostic(
          error.response.data,
          [
            doku.secretKey,
            doku.clientId,
            headers.Signature,
          ]
        )
      : undefined

    throw statusError
  }
}

