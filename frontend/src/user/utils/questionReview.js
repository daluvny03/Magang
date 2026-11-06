export const sortByOrder = (questions) =>
  Array.isArray(questions)
    ? [...questions].sort(
        (a, b) => Number(a.questionOrder) - Number(b.questionOrder)
      )
    : []

export const isTkp = (question) => question?.categorySlug === 'tkp'

export const getQuestionStatus = (question) => {
  if (question.selectedAnswer == null) return 'unanswered'
  if (isTkp(question)) return 'tkp'

  return question.isCorrect === true ? 'correct' : 'wrong'
}

const normalizeKey = (value) => String(value ?? '').toUpperCase()

export const isSelectedOption = (question, option) =>
  normalizeKey(question.selectedAnswer) === normalizeKey(option.key)

export const isCorrectOption = (question, option) =>
  !isTkp(question) &&
  normalizeKey(question.correctAnswer) === normalizeKey(option.key)

const EXPLANATION_FIELDS = [
  { key: 'summary', label: 'Ringkasan' },
  { key: 'detail', label: 'Penjelasan Detail' },
  { key: 'tips', label: 'Tips' },
]

// Pembahasan bisa berupa string biasa atau objek { summary, detail, tips }
export const getExplanationSections = (explanation) => {
  if (!explanation) return []

  const data =
    typeof explanation === 'string' ? { summary: explanation } : explanation

  return EXPLANATION_FIELDS.filter(
    ({ key }) =>
      typeof data[key] === 'string' && data[key].trim().length > 0
  ).map(({ key, label }) => ({ key, label, content: data[key] }))
}