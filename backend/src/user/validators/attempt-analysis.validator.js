
import Joi from 'joi'

export const attemptAnalysisParamsSchema = Joi.object({
  attemptId: Joi.string()
    .pattern(/^[1-9]\d*$/)
    .custom((value, helpers) => {
      try {
        const id = BigInt(value)

        if (id > 9223372036854775807n) {
          return helpers.error('any.invalid')
        }

        return value
      } catch {
        return helpers.error('any.invalid')
      }
    })
    .required(),
})
