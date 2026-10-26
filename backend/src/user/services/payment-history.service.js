
import {
  countPaymentHistoryByUserId,
  findPaymentHistoryByUserId,
} from '../repositories/payment.repository.js'

export const getPaymentHistoryForUser = async ({
  userId,
  page = 1,
  limit = 10,
}) => {
  const currentPage = Number(page)
  const pageSize = Number(limit)

  if (
    !Number.isSafeInteger(currentPage) ||
    currentPage < 1 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 50
  ) {
    const error = new Error(
      'Invalid payment history pagination'
    )
    error.statusCode = 400
    throw error
  }

  const offset = (currentPage - 1) * pageSize

  if (!Number.isSafeInteger(offset)) {
    const error = new Error(
      'Invalid payment history pagination'
    )
    error.statusCode = 400
    throw error
  }

  const [items, totalItems] = await Promise.all([
    findPaymentHistoryByUserId({
      userId,
      limit: pageSize,
      offset,
    }),
    countPaymentHistoryByUserId(userId),
  ])

  const totalPages = Math.ceil(
    totalItems / pageSize
  )

  return {
    items: items.map((item) => ({
      id: String(item.id),
      invoiceNumber: item.invoiceNumber,
      tierName: item.tierName ?? 'Paket Subscription',
      amount: Number(item.amount),
      currency: item.currency,
      status: item.status,
      duration: {
        value: Number(item.durationValue),
        unit: item.durationUnit,
      },
      paidAt: item.paidAt,
      appliedAt: item.appliedAt,
      expiredAt: item.expiredAt,
      createdAt: item.createdAt,
    })),

    pagination: {
      page: currentPage,
      limit: pageSize,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  }
}
