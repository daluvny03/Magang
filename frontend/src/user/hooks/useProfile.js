import { useQuery } from '@tanstack/react-query'

import { getUserProfile } from '../services/profile.service'

export const useProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
  })
}