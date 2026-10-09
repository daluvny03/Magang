import api from '../../services/api'

export const getAttemptQuestions = async (attemptId) => {
    const response = await api.get(
        `/user/attempts/${attemptId}/questions`
    )

    return response.data
}

export const saveAttemptAnswer = async ({
    attemptId,
    questionId,
    selectedAnswer,
}) => {
    const response = await api.put(
        `/user/attempts/${attemptId}/answer`,
        {
            questionId,
            selectedAnswer,
        }
    )

    return response.data
}

export const saveQuestionProgress = async ({
    attemptId,
    questionId,
    durationSeconds,
}) => {
    const response = await api.put(
        `/user/attempts/${attemptId}/question-progress`,
        {
            questionId,
            durationSeconds,
        }
    )

    return response.data
}

export const updateDoubtfulStatus = async ({
    attemptId,
    questionId,
    isDoubtful,
}) => {
    const response = await api.put(
        `/user/attempts/${attemptId}/doubtful`,
        {
            questionId,
            isDoubtful,
        }
    )

    return response.data
}

export const finishAttempt = async ({
    attemptId,
}) => {
    const response = await api.post(
        `/user/attempts/${attemptId}/finish`
    )

    return response.data
}