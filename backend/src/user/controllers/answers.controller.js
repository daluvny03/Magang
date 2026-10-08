import {
  saveAttemptAnswerForUser,
} from '../services/answers.service.js'

export const saveAttemptAnswer = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id
    const { attemptId } = req.params

    const {
      questionId,
      selectedAnswer,
    } = req.body

    if (!questionId) {
      const error = new Error(
        'Question ID is required'
      )

      error.statusCode = 422
      error.code =
        'QUESTION_ID_REQUIRED'

      throw error
    }

    if (
      selectedAnswer === undefined ||
      selectedAnswer === null ||
      String(selectedAnswer).trim() === ''
    ) {
      const error = new Error(
        'Selected answer is required'
      )

      error.statusCode = 422
      error.code =
        'SELECTED_ANSWER_REQUIRED'

      throw error
    }

    const answer =
      await saveAttemptAnswerForUser({
        userId,
        attemptId,
        questionId,
        selectedAnswer,
      })

    return res.status(200).json({
      success: true,
      message:
        'Answer saved successfully',
      data: {
        answer,
      },
    })
  } catch (error) {
    next(error)
  }
}