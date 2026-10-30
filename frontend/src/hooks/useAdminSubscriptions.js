import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  getAdminSubscriptionTiers,
  getAdminSubscriptionTierById,
  createAdminSubscriptionTier,
  updateAdminSubscriptionTier,
  updateAdminSubscriptionTierStatus,
} from '../services/admin-subscription.service'

const SUBSCRIPTION_QUERY_KEY = [
  'admin-subscriptions',
]
const invalidateSubscriptionQueries = async (queryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: ['admin-subscriptions'],
    }),
    queryClient.invalidateQueries({
      queryKey: ['subscription-catalog'],
    }),
  ])
}

export const useAdminSubscriptionTiers = () => {
  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEY,
    queryFn: getAdminSubscriptionTiers,
  })
}

export const useAdminSubscriptionTier = (id) => {
  return useQuery({
    queryKey: ['admin-subscription-tier', String(id)],
    queryFn: () => getAdminSubscriptionTierById(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export const useCreateAdminSubscriptionTier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAdminSubscriptionTier,

    onSuccess: async () => {
      await invalidateSubscriptionQueries(queryClient)
    },
  })
}

export const useUpdateAdminSubscriptionTier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }) =>
      updateAdminSubscriptionTier(id, payload),

    onSuccess: async () => {
      await invalidateSubscriptionQueries(queryClient)
    },
  })
}

export const useUpdateAdminSubscriptionTierStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }) =>
      updateAdminSubscriptionTierStatus(id, isActive),

    onSuccess: async () => {
      await invalidateSubscriptionQueries(queryClient)
    },
  })
}
