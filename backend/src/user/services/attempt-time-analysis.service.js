
const TIME_RULES = Object.freeze({
  minSamples: 3,
  fastRatio: 0.75,
  slowRatio: 1.5,
})

const CATEGORY_ORDER = ['twk', 'tiu', 'tkp']

const round = (value) =>
  Math.round((value + Number.EPSILON) * 100) / 100

const getValidTime = (value) => {
  if (value === null || value === undefined) {
    return null
  }

  const seconds = Number(value)

  if (!Number.isFinite(seconds) || seconds <= 0) {
    return null
  }

  return seconds
}

const createInsight = ({
  question,
  status,
  ratio,
}) => {
  if (status === 'insufficient_data') {
    return {
      code: 'INSUFFICIENT_TIME_DATA',
      message:
        'Data waktu belum cukup untuk memberikan analisis.',
    }
  }

  const isTKP = question.categorySlug === 'tkp'

  if (status === 'relatively_slow') {
    if (isTKP) {
      const maximum = Number(question.maximumScore)
      const earned = Number(question.earnedScore)

      if (
        Number.isFinite(maximum) &&
        maximum > 0 &&
        Number.isFinite(earned) &&
        earned / maximum < 0.8
      ) {
        return {
          code: 'SLOW_TKP_LOW_SCORE',
          message:
            'Waktu pengerjaan relatif tinggi, sementara skor belum maksimal. Tinjau kembali pertimbangan setiap opsi jawaban.',
        }
      }

      return {
        code: 'SLOW_TKP',
        message:
          'Waktu pengerjaan relatif tinggi dibandingkan soal TKP lain. Evaluasi efisiensi dalam menentukan pilihan.',
      }
    }

    return question.isCorrect === true
      ? {
          code: 'SLOW_CORRECT',
          message:
            'Jawaban sudah tepat, tetapi waktu pengerjaan relatif tinggi. Coba tingkatkan efisiensi penyelesaian soal.',
        }
      : question.isCorrect === false
        ? {
            code: 'SLOW_WRONG',
            message:
              'Waktu pengerjaan relatif tinggi dan jawaban belum tepat. Pelajari kembali konsep serta strategi penyelesaiannya.',
          }
        : {
            code: 'SLOW_UNANSWERED',
            message:
              'Waktu pengerjaan relatif tinggi, tetapi soal belum dijawab. Perhatikan strategi alokasi waktu ujian.',
          }
  }

  if (status === 'relatively_fast') {
    if (!isTKP && question.isCorrect === false) {
      return {
        code: 'FAST_WRONG',
        message:
          'Waktu pengerjaan relatif singkat dan jawaban belum tepat. Periksa kembali ketelitian dalam memahami soal.',
      }
    }

    return {
      code: 'RELATIVELY_FAST',
      message:
        'Waktu pengerjaan relatif singkat dibandingkan soal lain dalam kategori yang sama.',
    }
  }

  return {
    code: 'NORMAL_TIME',
    message:
      'Waktu pengerjaan berada dalam kisaran perbandingan kategori.',
  }
}

export const buildAttemptTimeAnalysis = (
  questions = []
) => {
  const questionList = Array.isArray(questions)
    ? questions
    : []

  const categoryStats = new Map()

  // 1. Kelompokkan waktu berdasarkan kategori.
  for (const slug of CATEGORY_ORDER) {
    categoryStats.set(slug, {
      slug,
      totalQuestions: 0,
      validTimeSamples: [],
    })
  }

  for (const question of questionList) {
    const category = categoryStats.get(
      question.categorySlug
    )

    if (!category) continue

    category.totalQuestions += 1

    const seconds = getValidTime(
      question.recordedTimeSeconds
    )

    if (seconds !== null) {
      category.validTimeSamples.push(seconds)
    }
  }

  // 2. Hitung statistik setiap kategori.
  const categories = CATEGORY_ORDER
    .map((slug) => {
      const category = categoryStats.get(slug)

      if (category.totalQuestions === 0) {
        return null
      }

      const times = category.validTimeSamples
      const recordedSeconds = times.reduce(
        (sum, seconds) => sum + seconds,
        0
      )

      const validTimeCount = times.length
      const sufficientData =
        validTimeCount >= TIME_RULES.minSamples

      const averageSeconds = sufficientData
        ? recordedSeconds / validTimeCount
        : null

      return {
        slug,
        totalQuestions: category.totalQuestions,
        validTimeCount,
        missingTimeCount:
          category.totalQuestions - validTimeCount,
        recordedTimeSeconds: recordedSeconds,
        averageTimeSeconds:
          averageSeconds === null
            ? null
            : round(averageSeconds),
        hasSufficientData: sufficientData,
      }
    })
    .filter(Boolean)

  const categoryLookup = new Map(
    categories.map((category) => [
      category.slug,
      category,
    ])
  )

  // 3. Hasilkan insight untuk setiap soal.
  const questionInsights = questionList.map(
    (question) => {
      const category = categoryLookup.get(
        question.categorySlug
      )

      const seconds = getValidTime(
        question.recordedTimeSeconds
      )

      const average =
        category?.hasSufficientData
          ? category.recordedTimeSeconds /
            category.validTimeCount
          : null

      let status = 'insufficient_data'
      let ratio = null

      if (
        seconds !== null &&
        average !== null &&
        average > 0
      ) {
        ratio = seconds / average

        if (ratio < TIME_RULES.fastRatio) {
          status = 'relatively_fast'
        } else if (ratio >= TIME_RULES.slowRatio) {
          status = 'relatively_slow'
        } else {
          status = 'normal'
        }
      }

      const insight = createInsight({
        question,
        status,
        ratio,
      })

      return {
        questionId: String(question.questionId),
        recordedTimeSeconds:
          question.recordedTimeSeconds ?? 0,
        categoryAverageSeconds:
          average === null ? null : round(average),
        timeRatio: ratio === null ? null : round(ratio),
        status,
        insight,
      }
    }
  )

  const slowQuestionCount =
    questionInsights.filter(
      (item) => item.status === 'relatively_slow'
    ).length

  return {
    rules: {
      minSamples: TIME_RULES.minSamples,
      fastRatio: TIME_RULES.fastRatio,
      slowRatio: TIME_RULES.slowRatio,
    },
    summary: {
      totalQuestions: questionList.length,
      questionsWithValidTime:
        categories.reduce(
          (sum, category) =>
            sum + category.validTimeCount,
          0
        ),
      slowQuestionCount,
    },
    categories,
    questionInsights,
  }
}
