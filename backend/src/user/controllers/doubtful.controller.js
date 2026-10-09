import {
    updateDoubtfulStatus,
} from '../services/doubtful.service.js'

export const updateDoubtful = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await updateDoubtfulStatus({
                attemptId:
                    req.params.attemptId,

                userId:
                    req.user.id,

                questionId:
                    req.body.questionId,

                isDoubtful:
                    req.body.isDoubtful,
            })

        return res.status(200).json({
            success: true,
            message:
                'Doubtful status updated successfully',
            data: {
                questionId:
                    result.question_id,

                isDoubtful:
                    result.is_doubtful,
            },
        })
    } catch (error) {
        next(error)
    }
}