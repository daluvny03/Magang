
import { AppError } from '../utils/app-error.js'

const PASSING_MODES = [
  'none',
  'total',
  'category',
]

const ALLOWED_CATEGORIES = [
  'twk',
  'tiu',
  'tkp',
]

const isValidScore = (value) => {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0
  )
}

export const validatePassingRules = ({
  passingMode = 'none',
  passingScore,
  passingGrades,
}) => {
  if (!PASSING_MODES.includes(passingMode)) {
    throw new AppError(
      'Invalid passing mode',
      400,
      'INVALID_PASSING_MODE'
    )
  }

  if (passingMode === 'none') {
    return {
      passingMode: 'none',
      passingScore: null,
      passingGrades: null,
    }
  }

  if (passingMode === 'total') {
    if (!isValidScore(passingScore)) {
      throw new AppError(
        'Valid passing score is required',
        400,
        'INVALID_PASSING_SCORE'
      )
    }

    return {
      passingMode: 'total',
      passingScore,
      passingGrades: null,
    }
  }

  if (
    !passingGrades ||
    typeof passingGrades !== 'object' ||
    Array.isArray(passingGrades)
  ) {
    throw new AppError(
      'Passing grades must be an object',
      400,
      'INVALID_PASSING_GRADES'
    )
  }

  const entries = Object.entries(passingGrades)

  if (entries.length === 0) {
    throw new AppError(
      'At least one passing grade is required',
      400,
      'EMPTY_PASSING_GRADES'
    )
  }

  for (const [slug, score] of entries) {
    if (!ALLOWED_CATEGORIES.includes(slug)) {
      throw new AppError(
        `Unsupported category: ${slug}`,
        400,
        'INVALID_PASSING_CATEGORY'
      )
    }

    if (!isValidScore(score)) {
      throw new AppError(
        `Invalid passing grade for ${slug}`,
        400,
        'INVALID_CATEGORY_PASSING_SCORE'
      )
    }
  }

  return {
    passingMode: 'category',
    passingScore: null,
    passingGrades,
  }
}


export const validatePassingScoreLimits = ({
  passingMode,
  passingScore,
  passingGrades,
  scoreLimits,
}) => {
  if (passingMode === 'none') {
    return
  }

  if (!Array.isArray(scoreLimits) || scoreLimits.length === 0) {
    throw new AppError(
      'Question score limits are unavailable',
      422,
      'QUESTION_SCORE_LIMITS_UNAVAILABLE'
    )
  }

  const allowedSlugs = new Set([
    'twk',
    'tiu',
    'tkp',
  ])

  for (const category of scoreLimits) {
    if (!allowedSlugs.has(category.slug)) {
      throw new AppError(
        `Unsupported root category: ${category.slug}`,
        422,
        'UNSUPPORTED_ROOT_CATEGORY'
      )
    }

    if (
      category.invalidScoreCount > 0 ||
      !Number.isFinite(category.maximumScore) ||
      category.maximumScore < 0
    ) {
      throw new AppError(
        `Invalid question scores in ${category.slug}`,
        422,
        'INVALID_QUESTION_SCORE'
      )
    }
  }

  const maximumTotalScore = scoreLimits.reduce(
    (total, category) =>
      total + category.maximumScore,
    0
  )

  if (passingMode === 'total') {
    if (passingScore > maximumTotalScore) {
      throw new AppError(
        `Passing score cannot exceed maximum score (${maximumTotalScore})`,
        422,
        'PASSING_SCORE_EXCEEDS_MAXIMUM'
      )
    }

    return
  }

  if (passingMode === 'category') {
    const categorySlugs = new Set(
      scoreLimits.map((category) => category.slug)
    )

    const configuredSlugs = Object.keys(
      passingGrades
    )

    for (const slug of configuredSlugs) {
      if (!categorySlugs.has(slug)) {
        throw new AppError(
          `Passing grade for ${slug} has no questions in this package`,
          422,
          'PASSING_CATEGORY_NOT_IN_PACKAGE'
        )
      }
    }

    for (const category of scoreLimits) {
      if (
        !Object.prototype.hasOwnProperty.call(
          passingGrades,
          category.slug
        )
      ) {
        throw new AppError(
          `Missing passing grade for ${category.slug}`,
          422,
          'MISSING_CATEGORY_PASSING_GRADE'
        )
      }

      if (
        passingGrades[category.slug] >
        category.maximumScore
      ) {
        throw new AppError(
          `Passing grade for ${category.slug} exceeds maximum score (${category.maximumScore})`,
          422,
          'CATEGORY_PASSING_GRADE_EXCEEDS_MAXIMUM'
        )
      }
    }
  }
}
