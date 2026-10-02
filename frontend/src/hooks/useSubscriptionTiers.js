import { useQuery } from '@tanstack/react-query'
import { getSubscriptionTiers } from '../services/subscription-tier.service'

export const useSubscriptionTiers = (params = {}) => {
  return useQuery({
    queryKey: ['subscription-tiers', params],
    queryFn: () => getSubscriptionTiers(params),
  })
}
