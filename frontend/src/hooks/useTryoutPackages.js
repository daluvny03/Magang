import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createTryoutPackage,
  getTryoutPackage,
  getTryoutPackages,
  updateTryoutPackage,
  updateTryoutPackageCategories,
  updateTryoutPackageQuestions,
  updateTryoutPackageSubscriptionTiers,
  publishTryoutPackage,
  unpublishTryoutPackage,
} from '../services/tryout-package.service'

export const useTryoutPackages = (params) => {
  return useQuery({
    queryKey: ['tryout-packages', params],
    queryFn: () => getTryoutPackages(params),
    placeholderData: keepPreviousData,
  })
}

export const useTryoutPackage = (id, enabled = true) => {
  return useQuery({
    queryKey: ['tryout-packages', id],
    queryFn: () => getTryoutPackage(id),
    enabled: Boolean(id) && enabled,
  })
}

export const useCreateTryoutPackage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTryoutPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tryout-packages'] })
    },
  })
}

export const useUpdateTryoutPackage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }) => updateTryoutPackage(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tryout-packages'] })
      queryClient.invalidateQueries({
        queryKey: ['tryout-packages', variables.id],
      })
    },
  })
}


const usePackageAction = (mutationFn) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (_, variables) => {
      const id = typeof variables === 'object' ? variables.id : variables
      queryClient.invalidateQueries({ queryKey: ['tryout-packages'] })
      queryClient.invalidateQueries({ queryKey: ['tryout-packages', id] })
    },
  })
}

export const useUpdateTryoutPackageCategories = () =>
  usePackageAction(({ id, categoryIds }) => updateTryoutPackageCategories(id, categoryIds))

export const useUpdateTryoutPackageQuestions = () =>
  usePackageAction(({ id, questions }) => updateTryoutPackageQuestions(id, questions))

export const useUpdateTryoutPackageSubscriptionTiers = () =>
  usePackageAction(({ id, subscriptionTierIds }) => updateTryoutPackageSubscriptionTiers(id, subscriptionTierIds))

export const usePublishTryoutPackage = () =>
  usePackageAction((id) => publishTryoutPackage(id))

export const useUnpublishTryoutPackage = () =>
  usePackageAction((id) => unpublishTryoutPackage(id))
