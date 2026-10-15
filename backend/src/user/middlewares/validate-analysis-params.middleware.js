
import {
  attemptAnalysisParamsSchema,
} from '../validators/attempt-analysis.validator.js'

export const validateAnalysisParams = (
  req,
  res,
  next
) => {
  const { error } =
    attemptAnalysisParamsSchema.validate(
      req.params,
      {
        abortEarly: false,
      }
    )

  if (error) {
    return res.status(422).json({
      success: false,
      message: 'Invalid attempt ID',
      code: 'VALIDATION_ERROR',
      errors: error.details.map(
        (detail) => detail.message
      ),
    })
  }

  next()
}
