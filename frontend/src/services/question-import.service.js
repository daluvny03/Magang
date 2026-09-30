import api from './api'

export const previewQuestionImport = async (file) => {
  const formData = new FormData()

  formData.append('file', file)

  const response = await api.post(
    '/questions/import/preview',
    formData,
  )

  return response.data
}

export const importQuestions = async (file) => {
  const formData = new FormData()

  formData.append('file', file)

  const response = await api.post(
    '/questions/import',
    formData,
  )

  return response.data
}