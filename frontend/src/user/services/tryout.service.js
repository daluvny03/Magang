import api from '../../services/api'

export const getUserTryouts = async ({ signal } = {}) => {
  const response = await api.get('/user/tryouts', { signal })

  return response.data
}

export const getUserTryoutById = async (tryoutId, { signal } = {}) => {
  const response = await api.get(
    `/user/tryouts/${tryoutId}`,
    { signal }
  )

  return response.data
}

export const startUserTryout = async (
  tryoutId
) => {
  const response = await api.post(
    `/user/tryouts/${tryoutId}/start`
  )

  return response.data
}
