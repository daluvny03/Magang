
import {
  findCompletedAttemptsByUser,
  countCompletedAttemptsByUser,
} from '../repositories/attempt-history.repository.js'

export const getAttemptHistoryForUser = async ({
  userId,
  page = 1,
  limit = 10,
}) => {
  const currentPage = Number(page)
  const pageSize = Number(limit)

  const offset = (currentPage - 1) * pageSize

  const [items, totalItems] = await Promise.all([
    findCompletedAttemptsByUser({
      userId,
      limit: pageSize,
      offset,
    }),
    countCompletedAttemptsByUser(userId),
  ])

  const totalPages = Math.ceil(
    totalItems / pageSize
  )

  return {
    items,
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
