
import {
  findAttemptForAnalysis,
  findAttemptAnalysisQuestions,
  findAttemptAnalysisProgress,
} from '../repositories/attempt-analysis.repository.js'

import {
  buildAttemptTimeAnalysis,
} from './attempt-time-analysis.service.js'

const createAnalysisError = (message, statusCode, code) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

const roundPercentage = (value) =>
  Math.round(value * 100) / 100

const percentage = (numerator, denominator) => {
  if (denominator <= 0) return null

  return roundPercentage(
    (numerator / denominator) * 100
  )
}

const validScore = (value, label) => {
  if (value === null || value === undefined) {
    throw createAnalysisError(
      `Missing score: ${label}`,
      409,
      'ANALYSIS_DATA_INCONSISTENT'
    )
  }

  const score = Number(value)

  if (!Number.isFinite(score) || score < 0) {
    throw createAnalysisError(
      `Invalid score: ${label}`,
      409,
      'ANALYSIS_DATA_INCONSISTENT'
    )
  }

  return score
}

const getQuestionMaximumScore = (question) => {
  if (question.category_slug !== 'tkp') {
    return validScore(
      question.question_score,
      `question ${question.question_id}`
    )
  }

  const options = question.answer_options

  if (!Array.isArray(options) || options.length !== 5) {
    throw createAnalysisError(
      'Invalid TKP answer options',
      409,
      'ANALYSIS_DATA_INCONSISTENT'
    )
  }

  const scores = options.map((option) =>
    validScore(
      option.score,
      `TKP option ${option.key}`
    )
  )

  return Math.max(...scores)
}

const normalizeOptions = (question) => {
  const options = question.answer_options ?? []

  return options.map((option) => ({
    key: option.key,
    text: option.text ?? '',
    image: option.option_image ?? null,
    ...(question.category_slug === 'tkp'
      ? { score: Number(option.score) }
      : {}),
  }))
}

export const getAttemptAnalysisForUser = async ({
  userId,
  attemptId,
}) => {
  // 1. Authorization dan status attempt
  const attempt = await findAttemptForAnalysis({
    userId,
    attemptId,
  })

  if (!attempt) {
    throw createAnalysisError(
      'Attempt not found',
      404,
      'ATTEMPT_NOT_FOUND'
    )
  }

  if (attempt.status !== 'completed') {
    throw createAnalysisError(
      'Analysis is available only for completed attempts',
      409,
      'ATTEMPT_NOT_COMPLETED'
    )
  }

  // 2. Ambil detail soal dan progress
  const [questionRows, progressRows] = await Promise.all([
    findAttemptAnalysisQuestions({
      attemptId,
      tryoutPackageId: attempt.tryout_package_id,
    }),
    findAttemptAnalysisProgress({
      attemptId,
    }),
  ])

  const progressMap = new Map(
    progressRows.map((row) => [
      String(row.question_id),
      Math.max(
        0,
        Number(row.recorded_time_seconds ?? 0)
      ),
    ])
  )

  // 3. Siapkan kategori dari soal aktual
  const categoryMap = new Map()

  const questions = questionRows.map((question) => {
    const slug = question.category_slug

    if (!['twk', 'tiu', 'tkp'].includes(slug)) {
      throw createAnalysisError(
        'Invalid question category',
        409,
        'ANALYSIS_DATA_INCONSISTENT'
      )
    }

    const answered =
      question.selected_answer !== null &&
      question.selected_answer !== undefined

    const earnedScore = answered
      ? validScore(
          question.earned_score,
          `earned score for ${question.question_id}`
        )
      : 0

    const maximumScore =
      getQuestionMaximumScore(question)

    if (earnedScore > maximumScore) {
      throw createAnalysisError(
        'Earned score exceeds question maximum',
        409,
        'ANALYSIS_DATA_INCONSISTENT'
      )
    }

    if (!categoryMap.has(slug)) {
      categoryMap.set(slug, {
        slug,
        name: slug.toUpperCase(),
        totalQuestions: 0,
        answered: 0,
        unanswered: 0,
        totalScore: 0,
        maximumScore: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
      })
    }

    const category = categoryMap.get(slug)

    category.totalQuestions += 1
    category.maximumScore += maximumScore
    category.totalScore += earnedScore

    if (answered) {
      category.answered += 1

      if (slug !== 'tkp') {
        if (question.is_correct === true) {
          category.correctAnswers += 1
        } else if (question.is_correct === false) {
          category.wrongAnswers += 1
        } else {
          throw createAnalysisError(
            'Missing correctness data',
            409,
            'ANALYSIS_DATA_INCONSISTENT'
          )
        }
      }
    } else {
      category.unanswered += 1
    }

    return {
      questionId: String(question.question_id),
      questionOrder: Number(question.question_order),
      categorySlug: slug,
      questionText: question.question_text,
      questionImage: question.question_image ?? null,
      answerOptions: normalizeOptions(question),
      correctAnswer:
        slug === 'tkp'
          ? null
          : question.correct_answer,
      selectedAnswer: question.selected_answer,
      earnedScore,
      maximumScore,
      isCorrect:
        slug === 'tkp'
          ? null
          : answered
            ? question.is_correct
            : null,
      recordedTimeSeconds:
        progressMap.get(String(question.question_id)) ?? 0,
      explanation: question.explanation ?? null,
    }
  })

  // 4. Bentuk ringkasan tiap kategori
  const categories = Array.from(
    categoryMap.values()
  ).map((category) => {
    const isTKP = category.slug === 'tkp'

    return {
      slug: category.slug,
      name: category.name,
      totalQuestions: category.totalQuestions,
      answered: category.answered,
      unanswered: category.unanswered,
      totalScore: category.totalScore,
      maximumScore: category.maximumScore,
      scorePercentage: percentage(
        category.totalScore,
        category.maximumScore
      ),
      completionPercentage: percentage(
        category.answered,
        category.totalQuestions
      ),
      correctAnswers:
        isTKP ? null : category.correctAnswers,
      wrongAnswers:
        isTKP ? null : category.wrongAnswers,
      accuracyPercentage:
        isTKP
          ? null
          : percentage(
              category.correctAnswers,
              category.answered
            ),
    }
  })

  // 5. Validasi terhadap snapshot final
  const resultSnapshot = attempt.result_snapshot
  const examSnapshot = attempt.exam_snapshot

  const actualTotalScore = categories.reduce(
    (sum, category) => sum + category.totalScore,
    0
  )

  const storedTotalScore = Number(
    attempt.total_score ?? 0
  )

  if (
    Math.abs(actualTotalScore - storedTotalScore) > 0.000001
  ) {
    throw createAnalysisError(
      'Analysis score does not match final attempt score',
      409,
      'ANALYSIS_DATA_INCONSISTENT'
    )
  }

  const calculatedMaximumScore = categories.reduce(
    (sum, category) => sum + category.maximumScore,
    0
  )

  if (
    resultSnapshot?.maximumScore != null &&
    Math.abs(
      calculatedMaximumScore -
      Number(resultSnapshot.maximumScore)
    ) > 0.000001
  ) {
    throw createAnalysisError(
      'Analysis maximum score does not match snapshot',
      409,
      'ANALYSIS_DATA_INCONSISTENT'
    )
  }

  // 6. Ringkasan keseluruhan
  const totalQuestions = questions.length

  const answered = categories.reduce(
    (sum, category) => sum + category.answered,
    0
  )

  const recordedTimeSeconds = questions.reduce(
    (sum, question) =>
      sum + question.recordedTimeSeconds,
    0
  )

    if (Array.isArray(examSnapshot?.categoryLimits)) {
    const expectedLimits = examSnapshot.categoryLimits

    if (expectedLimits.length !== categories.length) {
        throw createAnalysisError(
        'Analysis category count differs from exam snapshot',
        409,
        'ANALYSIS_DATA_INCONSISTENT'
        )
    }

    for (const limit of expectedLimits) {
        const actual = categories.find(
        (category) => category.slug === limit.slug
        )

        if (
        !actual ||
        actual.totalQuestions !==
            Number(limit.totalQuestions) ||
        Math.abs(
            actual.maximumScore -
            Number(limit.maximumScore)
        ) > 0.000001
        ) {
        throw createAnalysisError(
            'Analysis categories differ from exam snapshot',
            409,
            'ANALYSIS_DATA_INCONSISTENT'
        )
        }
    }
    }

    const timeAnalysis = buildAttemptTimeAnalysis(
    questions
    )

    const timeInsightMap = new Map(
    timeAnalysis.questionInsights.map((item) => [
        String(item.questionId),
        item,
    ])
    )

    const questionsWithInsight = questions.map(
    (question) => ({
        ...question,
        timeInsight:
        timeInsightMap.get(String(question.questionId))
        ?? null,
    })
    )

  return {
    attempt: {
      id: String(attempt.id),
      tryoutId: String(attempt.tryout_package_id),
      tryoutName: attempt.tryout_name,
      status: attempt.status,
    },
    summary: {
      totalScore: storedTotalScore,
      maximumScore:
        resultSnapshot?.maximumScore == null
          ? null
          : Number(resultSnapshot.maximumScore),
      scorePercentage:
        resultSnapshot?.maximumScore == null
          ? null
          : percentage(
              storedTotalScore,
              Number(resultSnapshot.maximumScore)
            ),
      passingStatus:
        resultSnapshot?.passingStatus ??
        'not_evaluated',
      totalQuestions,
      answered,
      unanswered: totalQuestions - answered,
      completionPercentage: percentage(
        answered,
        totalQuestions
      ),
      durationSeconds:
        Number(attempt.duration_seconds ?? 0),
      recordedTimeSeconds,
    },
    categories,
    questions: questionsWithInsight,
        timeAnalysis: {
            rules: timeAnalysis.rules,
            summary: timeAnalysis.summary,
            categories: timeAnalysis.categories,
        },
  }
}
