import { useQuery } from '@tanstack/react-query'

import {
  getUserSubscription
} from '../services/subscription.service'

export const useSubscription = () => {
  return useQuery({
    queryKey: ['user-subscription'],
    queryFn: getUserSubscription,
  })
}