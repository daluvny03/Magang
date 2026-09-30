import api from './api'

export const getQuestions = async (params = {}) => {
  const response = await api.get('/questions', {
    params,
  })
  return response.data
}

export const getQuestion = async (id) => {
  const response = await api.get(`/questions/${id}`)

  return response.data
}

export const createQuestion = async (payload) => {
  const response = await api.post('/questions', payload)

  return response.data
}

export const updateQuestion = async (id, payload) => {
  const response = await api.put(`/questions/${id}`, payload)

  return response.data
}

export const deleteQuestion = async (id) => {
  const response = await api.delete(`/questions/${id}`)

  return response.data
}