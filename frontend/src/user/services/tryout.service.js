import api from '../../services/api'

export const getUserTryouts = async () => {
  const response = await api.get('/user/tryouts')

  return response.data
}

export const getUserTryoutById = async (tryoutId) => {
  const response = await api.get(
    `/user/tryouts/${tryoutId}`
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