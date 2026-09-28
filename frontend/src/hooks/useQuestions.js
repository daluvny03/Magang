import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createQuestion,
  deleteQuestion,
  getQuestion,
  getQuestions,
  updateQuestion,
} from '../services/question.service'

export const useQuestions = (params) => {
  return useQuery({
    queryKey: ['questions', params],
    queryFn: () => getQuestions(params),
    placeholderData: keepPreviousData,
  })
}

export const useQuestion = (id, enabled = true) => {
  return useQuery({
    queryKey: ['questions', id],
    queryFn: () => getQuestion(id),
    enabled: Boolean(id) && enabled,
  })
}

export const useCreateQuestion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['questions'],
      })
    },
  })
}

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }) => updateQuestion(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['questions'],
      })

      queryClient.invalidateQueries({
        queryKey: ['questions', variables.id],
      })
    },
  })
}

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['questions'],
      })
    },
  })
}