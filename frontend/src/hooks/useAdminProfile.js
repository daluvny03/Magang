import { useQuery } from '@tanstack/react-query'

import { useAuthStore } from '../stores/authStore'
import { getAdminProfile } from '../services/admin-profile.service'

export const useAdminProfile = () => {
  const userId = useAuthStore((state) => state.user?.id)

  return useQuery({
    queryKey: ['admin-profile', userId],
    queryFn: ({ signal }) => getAdminProfile({ signal }),
    enabled: Boolean(userId),
  })
}
