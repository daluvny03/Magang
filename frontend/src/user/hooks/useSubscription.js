
import { useQuery } from '@tanstack/react-query'

import {
  getActiveSubscription,
  getSubscriptionCatalog,
} from '../services/subscription.service'

export const useSubscription = () => {
  return useQuery({
    queryKey: ['user-subscription'],
    queryFn: getActiveSubscription,
  })
}

export const useSubscriptionCatalog = () => {
  return useQuery({
    queryKey: ['user-subscription-catalog'],
    queryFn: getSubscriptionCatalog,
  })
}
