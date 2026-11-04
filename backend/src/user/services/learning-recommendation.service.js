
import {
  buildAttemptTimeAnalysis,
} from './attempt-time-analysis.service.js'
import {
  findLatestCompletedRecommendationAttempt,
  findLatestAttemptRecommendationQuestions,
} from '../repositories/learning-recommendation.repository.js'

const SUPPORTED_CATEGORIES = new Set(['twk', 'tiu', 'tkp'])
const MAX_PRIORITIES = 3

const toNumber = (value) => {
  const number = Number(value ?? 0)

  return Number.isFinite(number) ? number : 0
}

const toCount = (value) => {
  return Math.max(0, Math.floor(toNumber(value)))
}

const roundPercentage = (value) => {
  return Math.round(value * 1000) / 10
}

const buildCategoryRecommendation = (row) => {
  const rootCategorySlug = String(
    row.rootCategorySlug ?? ''
  ).toLowerCase()

  if (!SUPPORTED_CATEGORIES.has(rootCategorySlug)) {
    return null
  }

  const answeredCount = toCount(row.answeredCount)

  // Jawaban kosong tidak digunakan untuk menentukan kelemahan.
  if (answeredCount === 0) return null

  const categoryName = String(
    row.categoryName ?? 'Kategori tidak diketahui'
  )

  const base = {
    categoryId: row.categoryId ?? null,
    categoryName,
    categoryPath: row.categoryPath ?? categoryName,
    rootCategorySlug,
    answeredCount,
  }

  if (rootCategorySlug === 'tkp') {
    const earnedScore = toNumber(row.earnedScore)
    const maximumScore = toNumber(row.maximumScore)

    if (maximumScore <= 0 || earnedScore > maximumScore) {
      return null
    }

    const lostScore = maximumScore - earnedScore

    if (lostScore <= 0) return null

    const weaknessRate = lostScore / maximumScore

    return {
      ...base,
      measurement: 'score_loss',
      earnedScore,
      maximumScore,
      lostScore,
      affectedCount: toCount(row.belowMaxScoreCount),
      weaknessRate,
      weaknessPercentage: roundPercentage(weaknessRate),
      reason:
        `Kehilangan ${lostScore} dari ${maximumScore} poin maksimal.`,
    }
  }

  const wrongCount = Math.min(
    toCount(row.wrongCount),
    answeredCount
  )

  if (wrongCount === 0) return null

  const weaknessRate = wrongCount / answeredCount

  return {
    ...base,
    measurement: 'wrong_answers',
    wrongCount,
    affectedCount: wrongCount,
    weaknessRate,
    weaknessPercentage: roundPercentage(weaknessRate),
    reason:
      `${wrongCount} dari ${answeredCount} soal yang dijawab salah.`,
  }
}

const createRecommendationDataError = (message) => {
  const error = new Error(message)
  error.statusCode = 409
  error.code = 'ANALYSIS_DATA_INCONSISTENT'

  return error
}

const getValidRecommendationScore = (value, label) => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    throw createRecommendationDataError(
      `Invalid score for ${label}`
    )
  }

  const score = Number(value)

  if (!Number.isFinite(score) || score < 0) {
    throw createRecommendationDataError(
      `Invalid score for ${label}`
    )
  }

  return score
}

const getQuestionMaximumScore = (question) => {
  if (question.category_slug !== 'tkp') {
    return getValidRecommendationScore(
      question.question_score,
      `question ${question.question_id}`
    )
  }

  const options = question.answer_options

  if (!Array.isArray(options) || options.length !== 5) {
    throw createRecommendationDataError(
      'Invalid TKP answer options'
    )
  }

  const scores = options.map((option) =>
    getValidRecommendationScore(
      option.score,
      `TKP option ${option.key}`
    )
  )

  return Math.max(...scores)
}

const buildCategoryStats = (questions) => {
  const categoryMap = new Map()

  for (const question of questions) {
    const categoryId = String(question.category_id)
    const categorySlug = String(
      question.category_slug
    ).toLowerCase()

    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        categoryId: question.category_id,
        categoryName: question.category_name,
        categoryPath: question.category_path,
        rootCategorySlug: categorySlug,

        answeredCount: 0,
        wrongCount: 0,

        earnedScore: 0,
        maximumScore: 0,
        belowMaxScoreCount: 0,
      })
    }

    const stats = categoryMap.get(categoryId)

    const isAnswered =
      question.selected_answer !== null &&
      question.selected_answer !== undefined

    // Soal kosong tidak dihitung sebagai kelemahan.
    if (!isAnswered) continue

    stats.answeredCount += 1

    const earnedScore = getValidRecommendationScore(
      question.earned_score,
      `earned score question ${question.question_id}`
    )

    const maximumScore = getQuestionMaximumScore(question)

    if (categorySlug === 'tkp') {
      stats.earnedScore += earnedScore
      stats.maximumScore += maximumScore

      if (earnedScore < maximumScore) {
        stats.belowMaxScoreCount += 1
      }
    } else if (question.is_correct === false) {
      stats.wrongCount += 1
    }
  }

  return Array.from(categoryMap.values())
}

export const buildLearningRecommendations = ({
  categoryStats = [],
} = {}) => {
  const priorities = categoryStats
    .map(buildCategoryRecommendation)
    .filter(Boolean)
    .sort((a, b) => {
      if (b.weaknessRate !== a.weaknessRate) {
        return b.weaknessRate - a.weaknessRate
      }

      if (b.affectedCount !== a.affectedCount) {
        return b.affectedCount - a.affectedCount
      }

      if (b.answeredCount !== a.answeredCount) {
        return b.answeredCount - a.answeredCount
      }

      return a.categoryName.localeCompare(b.categoryName)
    })
    .slice(0, MAX_PRIORITIES)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      isMainPriority: index === 0,
    }))

  return {
    hasRecommendation: priorities.length > 0,
    state: priorities.length > 0
      ? 'recommendations_available'
      : 'no_weak_category',
    mainPriority: priorities[0] ?? null,
    priorities,
  }
}

const TIME_PATTERN_CONFIG = {
  SLOW_WRONG: {
    title: 'Terlalu Lama dan Jawaban Salah',
    weight: 5,
  },
  FAST_WRONG: {
    title: 'Terlalu Cepat dan Jawaban Salah',
    weight: 5,
  },
  SLOW_TKP_LOW_SCORE: {
    title: 'Waktu Lama dengan Skor TKP Rendah',
    weight: 5,
  },
  SLOW_UNANSWERED: {
    title: 'Waktu Lama pada Soal Tidak Terjawab',
    weight: 4,
  },
  SLOW_TKP: {
    title: 'Efisiensi Pengerjaan TKP',
    weight: 3,
  },
  SLOW_CORRECT: {
    title: 'Efisiensi Pengerjaan Soal',
    weight: 2,
  },
}

export const buildTimeRecommendations = ({
  questions = [],
} = {}) => {
  const timeAnalysis = buildAttemptTimeAnalysis(questions)

  const categoryLookup = new Map(
    timeAnalysis.categories.map((category) => [
      category.slug,
      category,
    ])
  )

  const groupedPatterns = new Map()

  for (const item of timeAnalysis.questionInsights) {
    const config = TIME_PATTERN_CONFIG[item.insight.code]

    if (!config) continue

    const question = questions.find(
      (row) => String(row.questionId) === String(item.questionId)
    )

    if (!question) continue

    const key = `${question.categorySlug}:${item.insight.code}`

    if (!groupedPatterns.has(key)) {
      groupedPatterns.set(key, {
        categorySlug: question.categorySlug,
        code: item.insight.code,
        title: config.title,
        message: item.insight.message,
        affectedQuestionCount: 0,
        totalTimeRatio: 0,
        validTimeSamples:
          categoryLookup.get(question.categorySlug)?.validTimeCount ?? 0,
        averageTimeSeconds:
          categoryLookup.get(question.categorySlug)?.averageTimeSeconds ?? null,
        weight: config.weight,
      })
    }

    const pattern = groupedPatterns.get(key)

    pattern.affectedQuestionCount += 1

    if (item.timeRatio !== null) {
      pattern.totalTimeRatio += item.timeRatio
    }
  }

  const recommendations = Array.from(
    groupedPatterns.values()
  )
    .map((item) => ({
      categorySlug: item.categorySlug,
      categoryName: item.categorySlug.toUpperCase(),
      code: item.code,
      title: item.title,
      message: item.message,
      affectedQuestionCount: item.affectedQuestionCount,
      validTimeSamples: item.validTimeSamples,
      averageTimeSeconds: item.averageTimeSeconds,
      averageTimeRatio:
        roundPercentage(
          item.totalTimeRatio / item.affectedQuestionCount
        ) / 100,
      priorityScore:
        item.affectedQuestionCount * item.weight,
    }))
    .sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore
      }

      return b.affectedQuestionCount - a.affectedQuestionCount
    })
    .slice(0, MAX_PRIORITIES)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      isMainPriority: index === 0,
      priorityScore: undefined,
    }))

  const hasSufficientData = timeAnalysis.categories.some(
    (category) => category.hasSufficientData
  )

  return {
    hasRecommendation: recommendations.length > 0,
    state: !hasSufficientData
      ? 'insufficient_time_data'
      : recommendations.length > 0
        ? 'recommendations_available'
        : 'no_actionable_pattern',
    mainPriority: recommendations[0] ?? null,
    recommendations,
    evidence: {
      rules: timeAnalysis.rules,
      summary: timeAnalysis.summary,
      categories: timeAnalysis.categories,
    },
  }
}

export const buildLearningRecommendationEngine = ({
  categoryStats = [],
  questions = [],
} = {}) => {
  return {
    learning: buildLearningRecommendations({
      categoryStats,
    }),
    time: buildTimeRecommendations({
      questions,
    }),
  }
}

export const getLatestLearningRecommendations = async ({
  userId,
}) => {
  // 1. Cari attempt completed terbaru.
  const attempt =
    await findLatestCompletedRecommendationAttempt({
      userId,
    })

  if (!attempt) {
    return {
      state: 'no_completed_attempt',
      latestAttempt: null,
      learning: buildLearningRecommendations(),
      time: buildTimeRecommendations(),
    }
  }

  // 2. Ambil seluruh data soal dan waktu.
  const rows = await findLatestAttemptRecommendationQuestions({
    attemptId: attempt.attempt_id,
    tryoutPackageId: attempt.tryout_package_id,
  })

  // 3. Agregasi kelemahan kategori.
  const categoryStats = buildCategoryStats(rows)

  // 4. Normalisasi data untuk analisis waktu.
  const questions = rows.map((question) => {
    const isAnswered =
      question.selected_answer !== null &&
      question.selected_answer !== undefined

    return {
      questionId: String(question.question_id),

      categorySlug: String(
        question.category_slug
      ).toLowerCase(),

      selectedAnswer: question.selected_answer,

      recordedTimeSeconds: Number(
        question.recorded_time_seconds ?? 0
      ),

      isCorrect:
        question.is_correct === true
          ? true
          : question.is_correct === false
            ? false
            : null,

      earnedScore: isAnswered
        ? getValidRecommendationScore(
            question.earned_score,
            `earned score question ${question.question_id}`
          )
        : 0,

      maximumScore: getQuestionMaximumScore(question),
    }
  })

  // 5. Jalankan kedua recommendation engine.
  const recommendations =
    buildLearningRecommendationEngine({
      categoryStats,
      questions,
    })

  const hasRecommendation =
    recommendations.learning.hasRecommendation ||
    recommendations.time.hasRecommendation

  return {
    state: hasRecommendation
      ? 'recommendations_available'
      : 'no_actionable_recommendation',

    latestAttempt: {
      attemptId: attempt.attempt_id,
      tryoutPackageId: attempt.tryout_package_id,
      tryoutName: attempt.tryout_name,
      completedAt: attempt.completed_at,
      totalScore: attempt.total_score,
    },

    ...recommendations,
  }
}