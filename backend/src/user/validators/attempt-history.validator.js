
import Joi from 'joi'

export const attemptHistoryQuerySchema =
  Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .default(10),
  }).unknown(false)
