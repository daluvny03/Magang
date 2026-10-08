import {
  getAttemptQuestionsForUser,
} from '../services/attempt-questions.service.js'

export const getAttemptQuestions = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id
    const { attemptId } = req.params

    const result =
      await getAttemptQuestionsForUser(
        userId,
        attemptId
      )

    return res.status(200).json({
      success: true,
      message:
        'Attempt questions retrieved successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}