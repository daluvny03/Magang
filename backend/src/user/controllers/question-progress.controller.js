import {
    trackQuestionProgress,
} from '../services/question-progress.service.js'

export const saveQuestionProgress = async (
    req,
    res,
    next
) => {
    try {
        const progress =
            await trackQuestionProgress({
                attemptId:
                    req.params.attemptId,

                userId:
                    req.user.id,

                questionId:
                    req.body.questionId,

                durationSeconds:
                    req.body.durationSeconds,
            })

        return res.status(200).json({
            success: true,
            message:
                'Question progress saved successfully',
            data: {
                progress,
            },
        })
    } catch (error) {
        next(error)
    }
}