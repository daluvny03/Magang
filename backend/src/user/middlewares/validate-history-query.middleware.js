
import {
  attemptHistoryQuerySchema,
} from '../validators/attempt-history.validator.js'

export const validateHistoryQuery = (
  req,
  res,
  next
) => {
  const { error } =
    attemptHistoryQuerySchema.validate(
      req.query,
      {
        abortEarly: false,
        convert: true,
      }
    )

  if (error) {
    return res.status(422).json({
      success: false,
      message: 'Invalid history query parameters',
      code: 'VALIDATION_ERROR',
      errors: error.details.map(
        (detail) => detail.message
      ),
    })
  }

  next()
}
