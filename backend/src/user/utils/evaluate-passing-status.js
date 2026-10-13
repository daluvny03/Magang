
export const evaluatePassingStatus = ({
  examSnapshot,
  totalScore,
  categoryScores,
}) => {
  if (!examSnapshot) {
    return {
      version: 1,
      maximumScore: null,
      passingStatus: 'not_evaluated',
      categoryScores: [],
    }
  }

  const {
    maximumScore,
    passingMode,
    passingScore,
    passingGrades,
    categoryLimits,
  } = examSnapshot

  const toValidNumber = (value, field) => {
    if (value === null || value === undefined) {
      throw new Error(`Missing ${field}`)
    }

    const number = Number(value)

    if (!Number.isFinite(number) || number < 0) {
      throw new Error(`Invalid ${field}`)
    }

    return number
  }

  if (!Array.isArray(categoryLimits)) {
    throw new Error('Invalid exam category limits')
  }

  const actualCategories = categoryLimits.map(
    (category) => {
      const categoryResult = categoryScores.find(
        (item) => item.slug === category.slug
      )

      if (!categoryResult) {
        throw new Error(
          `Missing result for category ${category.slug}`
        )
      }

      const score = toValidNumber(
        categoryResult.score,
        `score for ${category.slug}`
      )

      const categoryMaximum = toValidNumber(
        category.maximumScore,
        `maximum score for ${category.slug}`
      )

      const grade = passingMode === 'category'
        ? toValidNumber(
            passingGrades?.[category.slug],
            `passing grade for ${category.slug}`
          )
        : null

      if (score > categoryMaximum) {
        throw new Error(
          `Score exceeds maximum for ${category.slug}`
        )
      }

      return {
        slug: category.slug,
        score,
        maximumScore: categoryMaximum,
        passingGrade: grade,
        passed: grade === null
          ? null
          : score >= grade,
      }
    }
  )

  const numericMaximumScore = toValidNumber(
    maximumScore,
    'maximumScore'
  )

  const numericTotalScore = toValidNumber(
    totalScore,
    'totalScore'
  )

  const categoryTotal = actualCategories.reduce(
    (sum, category) => sum + category.score,
    0
  )

  if (
    Math.abs(categoryTotal - numericTotalScore) > 0.000001
  ) {
    throw new Error(
      'Category scores do not match total score'
    )
  }

  if (numericTotalScore > numericMaximumScore) {
    throw new Error('Total score exceeds maximum')
  }

  let passingStatus = 'not_evaluated'

  if (passingMode === 'total') {
    const threshold = toValidNumber(
      passingScore,
      'passingScore'
    )

    passingStatus = numericTotalScore >= threshold
      ? 'passed'
      : 'failed'
  } else if (passingMode === 'category') {
    passingStatus = actualCategories.every(
      (category) => category.passed === true
    )
      ? 'passed'
      : 'failed'
  } else if (passingMode !== 'none') {
    throw new Error('Invalid passing mode')
  }

  return {
    version: 1,
    maximumScore: numericMaximumScore,
    passingStatus,
    categoryScores: actualCategories,
  }
}
