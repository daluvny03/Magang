
import api from './api'

const BASE_URL = '/subscriptions'

export const getAdminSubscriptionTiers = async () => {
  const response = await api.get(BASE_URL)
  return response.data
}

export const getAdminSubscriptionTierById = async (id) => {
  const response = await api.get(`${BASE_URL}/${id}`)
  return response.data
}

export const createAdminSubscriptionTier = async (payload) => {
  const response = await api.post(BASE_URL, payload)
  return response.data
}

export const updateAdminSubscriptionTier = async (
  id,
  payload
) => {
  const response = await api.patch(
    `${BASE_URL}/${id}`,
    payload
  )

  return response.data
}

export const updateAdminSubscriptionTierStatus = async (
  id,
  isActive
) => {
  const response = await api.patch(
    `${BASE_URL}/${id}/status`,
    { isActive }
  )

  return response.data
}
