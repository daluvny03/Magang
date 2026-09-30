import api from './api'

export const getCategories = async (params = {}) => {
  const response = await api.get('/categories', {
    params,
  })
  console.log('getCategories response:', response.data)
  return response.data
}

export const getCategory = async (id) => {
  const response = await api.get(`/categories/${id}`)

  return response.data
}

export const createCategory = async (payload) => {
  const response = await api.post('/categories', payload)

  return response.data
}

export const updateCategory = async (id, payload) => {
  const response = await api.put(`/categories/${id}`, payload)

  return response.data
}

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`)

  return response.data
}

export const getCategoryTree = async (params = {}) => {
  const response = await api.get('/categories/tree', {
    params,
  })

  return response.data
}