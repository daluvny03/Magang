import api from './api'

const normalizePackageDetail = (response) => {
  if (!response?.data) return response

  return {
    ...response,
    data: {
      ...response.data,
      categories: (response.data.categories || []).map((category) => ({
        ...category,
        parentId: category.parentId ?? category.parent_id ?? null,
      })),
      questions: (response.data.questions || []).map((question) => ({
        ...question,
        categoryId: question.categoryId ?? question.category_id ?? null,
        questionText: question.questionText ?? question.question_text ?? '',
        isActive: question.isActive ?? question.is_active ?? false,
      })),
    },
  }
}

export const getTryoutPackages = async (params = {}) => {
  const response = await api.get('/tryout-packages', { params })
  return response.data
}

export const getTryoutPackage = async (id) => {
  const response = await api.get(`/tryout-packages/${id}`)
  return normalizePackageDetail(response.data)
}

export const createTryoutPackage = async (payload) => {
  const response = await api.post('/tryout-packages', payload)
  return response.data
}

export const updateTryoutPackage = async (id, payload) => {
  const response = await api.put(`/tryout-packages/${id}`, payload)
  return response.data
}

export const updateTryoutPackageCategories = async (id, categoryIds) => {
  const response = await api.put(`/tryout-packages/${id}/categories`, { categoryIds })
  return response.data
}

export const updateTryoutPackageQuestions = async (id, questions) => {
  const response = await api.put(`/tryout-packages/${id}/questions`, { questions })
  return response.data
}

export const updateTryoutPackageSubscriptionTiers = async (id, subscriptionTierIds) => {
  const response = await api.put(`/tryout-packages/${id}/subscription-tiers`, { subscriptionTierIds })
  return response.data
}

export const publishTryoutPackage = async (id) => {
  const response = await api.patch(`/tryout-packages/${id}/publish`)
  return response.data
}

export const unpublishTryoutPackage = async (id) => {
  const response = await api.patch(`/tryout-packages/${id}/unpublish`)
  return response.data
}
