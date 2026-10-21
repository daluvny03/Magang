
import api from '../../services/api'

export const getAttemptResult = async (attemptId, { signal } = {}) => {
    const response = await api.get(
        `/user/attempts/${attemptId}/result`,
        { signal }
    )

    return response.data
}
