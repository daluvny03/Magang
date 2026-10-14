
import api from '../../services/api'

export const getAttemptHistory = async ({
  page = 1,
  limit = 10,
} = {}) => {
  const response = await api.get(
    '/user/attempts/history',
    {
      params: {
        page,
        limit,
      },
    }
  )

  return response.data.data
}
