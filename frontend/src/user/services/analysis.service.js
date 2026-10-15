import api from '../../services/api'

export const getAttemptAnalysis = async (
  attemptId
) => {
  const response = await api.get(
    `/user/attempts/${attemptId}/analysis`
  )

  return response.data.data
}