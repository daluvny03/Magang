
import api from '../../services/api'

export const getLearningRecommendations = async ({ signal } = {}) => {
    const response = await api.get(
        '/user/attempts/recommendations',
        { signal }
    )

    return response.data?.data ?? response.data
}
