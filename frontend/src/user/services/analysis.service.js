
import api from '../../services/api'

export const getAttemptAnalysis = async (
  attemptId,
  { signal } = {}
) => {
  const response = await api.get(
    `/user/attempts/${attemptId}/analysis`,
    { signal }
  )

  return response.data.data
}

export const getAttemptAnalysisSummary = async (
  attemptId,
  { signal } = {}
) => {
  const response = await api.get(
    `/user/attempts/${attemptId}/analysis/summary`,
    { signal }
  )

  return response.data.data
}
