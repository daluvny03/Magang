import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getUser, getUsers } from '../services/user.service'

export const useUsers = (params) => useQuery({
  queryKey: ['users', params],
  queryFn: () => getUsers(params),
  placeholderData: keepPreviousData,
})

export const useUser = (id, enabled = true) => useQuery({
  queryKey: ['users', id],
  queryFn: () => getUser(id),
  enabled: Boolean(id) && enabled,
})
