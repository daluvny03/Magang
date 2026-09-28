import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../services/category.service'

export const useCategories = (params) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => getCategories(params),
    keepPreviousData: true,
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCategory,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      })
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }) =>
      updateCategory(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      })
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCategory,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      })
    },
  })
}