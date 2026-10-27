
import api from '../../services/api'

export const getAttemptStatistics = async (
  { signal } = {}
) => {
  const response = await api.get(
    '/user/attempts/statistics',
    { signal }
  )

  return response.data.data
}
