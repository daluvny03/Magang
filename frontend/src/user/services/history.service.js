
import api from '../../services/api'

export const getAttemptHistory = async ({
  page = 1,
  limit = 10,
  signal,
} = {}) => {
  const response = await api.get(
    '/user/attempts/history',
    {
      signal,
      params: {
        page,
        limit,
      },
    }
  )

  return response.data.data
}
