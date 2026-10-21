import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../stores/authStore'

import { getUserProfile } from '../services/profile.service'

export const useProfile = () => {
  const userId = useAuthStore((state) => state.user?.id)
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: getUserProfile,
    enabled: Boolean(userId),
  })
}
