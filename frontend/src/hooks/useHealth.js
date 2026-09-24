import { useQuery } from '@tanstack/react-query'
import { getHealthStatus } from '../services/health.service'

export const useHealth = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealthStatus,
  })
}