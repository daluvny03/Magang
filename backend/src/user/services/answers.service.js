import {
  findQuestionForAttempt,
  upsertTryoutAnswer,
} from '../repositories/answers.repository.js'

const normalizeAnswerOptions = (options) => {
  if (!Array.isArray(options)) {
    return []
  }

  return options.map((option) => ({
    key: String(option.key || '')
      .trim()
      .toUpperCase(),
    text: option.text,
    score:
      option.score !== undefined
        ? Number(option.score)
        : null,
  }))
}

const calculateAnswerScore = ({
  rootCategorySlug,
  correctAnswer,
  questionScore,
  answerOptions,
  selectedAnswer,
}) => {
  const normalizedCorrectAnswer =
    String(correctAnswer)
      .trim()
      .toUpperCase()

  const isCorrect =
    selectedAnswer === normalizedCorrectAnswer

  if (rootCategorySlug === 'tkp') {
    const selectedOption =
      answerOptions.find(
        (option) =>
          option.key === selectedAnswer
      )

    if (
      !selectedOption ||
      selectedOption.score === null ||
      !Number.isFinite(selectedOption.score) ||
      selectedOption.score < 0
    ) {
      const error = new Error(
        'TKP answer option score is invalid'
      )

      error.statusCode = 500
      error.code =
        'INVALID_TKP_OPTION_SCORE'

      throw error
    }

    return {
      isCorrect,
      score: selectedOption.score,
    }
  }

  if (
    rootCategorySlug === 'twk' ||
    rootCategorySlug === 'tiu'
  ) {
    const score = Number(questionScore)

    if (
      !Number.isFinite(score) ||
      score < 0
    ) {
      const error = new Error(
        'Question score is invalid'
      )

      error.statusCode = 500
      error.code =
        'INVALID_QUESTION_SCORE'

      throw error
    }

    return {
      isCorrect,
      score: isCorrect ? score : 0,
    }
  }

  const error = new Error(
    'Unsupported question category'
  )

  error.statusCode = 422
  error.code =
    'UNSUPPORTED_QUESTION_CATEGORY'

  throw error
}

export const saveAttemptAnswerForUser = async ({
  userId,
  attemptId,
  questionId,
  selectedAnswer,
}) => {
  const question =
    await findQuestionForAttempt({
      userId,
      attemptId,
      questionId,
    })

  if (!question) {
    const error = new Error(
      'Attempt or question not found'
    )

    error.statusCode = 404
    error.code =
      'ATTEMPT_QUESTION_NOT_FOUND'

    throw error
  }

  if (question.attempt_status === 'completed') {
    const error = new Error(
      'Attempt has already been completed'
    )

    error.statusCode = 409
    error.code = 'ATTEMPT_COMPLETED'

    throw error
  }

  const isExpired =
    question.attempt_status === 'expired' ||
    new Date(
      question.expires_at
    ).getTime() <= Date.now()

  if (isExpired) {
    const error = new Error(
      'Attempt has expired'
    )

    error.statusCode = 409
    error.code = 'ATTEMPT_EXPIRED'

    throw error
  }

  if (
    question.attempt_status !==
    'in_progress'
  ) {
    const error = new Error(
      'Attempt is not in progress'
    )

    error.statusCode = 409
    error.code =
      'ATTEMPT_NOT_IN_PROGRESS'

    throw error
  }

  const normalizedSelectedAnswer =
    String(selectedAnswer || '')
      .trim()
      .toUpperCase()

  const answerOptions =
    normalizeAnswerOptions(
      question.answer_options
    )

  const selectedOption =
    answerOptions.find(
      (option) =>
        option.key ===
        normalizedSelectedAnswer
    )

  if (!selectedOption) {
    const error = new Error(
      'Selected answer is invalid'
    )

    error.statusCode = 422
    error.code =
      'INVALID_SELECTED_ANSWER'

    throw error
  }

  const {
    isCorrect,
    score,
  } = calculateAnswerScore({
    rootCategorySlug:
      question.root_category_slug,
    correctAnswer:
      question.correct_answer,
    questionScore:
      question.question_score,
    answerOptions,
    selectedAnswer:
      normalizedSelectedAnswer,
  })

  return upsertTryoutAnswer({
    attemptId,
    questionId,
    selectedAnswer:
      normalizedSelectedAnswer,
    isCorrect,
    score,
  })
}