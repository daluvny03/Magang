import api from './api'

const buildQuestionFormData = (
    payload,
) => {
    const formData = new FormData()

    // --------------------------------
    // Basic question data
    // --------------------------------

    formData.append(
        'categoryId',
        String(payload.categoryId),
    )

    formData.append(
        'questionText',
        payload.questionText,
    )

    formData.append(
        'correctAnswer',
        payload.correctAnswer,
    )

    formData.append(
        'score',
        String(payload.score),
    )

    formData.append(
        'difficulty',
        String(payload.difficulty),
    )

    formData.append(
        'isActive',
        String(payload.isActive),
    )

    // --------------------------------
    // Explanation
    // --------------------------------

    formData.append(
        'explanation',
        JSON.stringify(
            payload.explanation,
        ),
    )

    // --------------------------------
    // Answer options
    // --------------------------------

    const answerOptions =
        payload.answerOptions.map(
            (option) => ({
                key: option.key,
                text: option.text || '',
                image:
                    option.image || null,
            }),
        )

    formData.append(
        'answerOptions',
        JSON.stringify(answerOptions),
    )

    // --------------------------------
    // Question image
    // --------------------------------

    if (payload.questionImageFile) {
        formData.append(
            'questionImage',
            payload.questionImageFile,
        )
    }

    // --------------------------------
    // Option images
    // --------------------------------

    payload.answerOptions.forEach(
        (option) => {
            if (!option.imageFile) {
                return
            }

            formData.append(
                `optionImage${option.key}`,
                option.imageFile,
            )
        },
    )

    // --------------------------------
    // Remove image commands
    // --------------------------------

    formData.append(
        'removeQuestionImage',
        String(
            Boolean(
                payload.removeQuestionImage,
            ),
        ),
    )

    payload.answerOptions.forEach(
        (option) => {
            formData.append(
                `removeOptionImage${option.key}`,
                String(
                    Boolean(
                        option.removeImage,
                    ),
                ),
            )
        },
    )

    return formData
}

export const getQuestions = async (
    params = {},
) => {
    const response = await api.get(
        '/questions',
        {
            params,
        },
    )

    return response.data
}

export const getQuestion = async (
    id,
) => {
    const response = await api.get(
        `/questions/${id}`,
    )

    return response.data
}

export const createQuestion = async (
    payload,
) => {
    const formData =
        buildQuestionFormData(payload)

    const response = await api.post(
        '/questions',
        formData,
    )

    return response.data
}

export const updateQuestion = async (
    id,
    payload,
) => {
    const formData =
        buildQuestionFormData(payload)

    const response = await api.put(
        `/questions/${id}`,
        formData,
    )

    return response.data
}

export const deleteQuestion = async (
    id,
) => {
    const response = await api.delete(
        `/questions/${id}`,
    )

    return response.data
}