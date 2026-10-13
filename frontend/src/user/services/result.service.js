
import api from '../../services/api'

export const getAttemptResult = async (attemptId) => {
    const response = await api.get(
        `/user/attempts/${attemptId}/result`
    )

    return response.data
}
