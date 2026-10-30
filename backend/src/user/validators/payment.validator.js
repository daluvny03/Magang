
import Joi from 'joi'

export const checkoutEmailSchema = Joi.string()
  .trim()
  .email()
  .max(255)
  .required()

export const createCheckoutSchema = Joi.object({
  subscriptionTierId: Joi.alternatives()
    .try(
      Joi.string()
        .pattern(/^[1-9]\d*$/),
      Joi.number()
        .integer()
        .positive()
    )
    .required(),
}).unknown(false)

export const paymentIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[1-9]\d*$/)
    .required(),
})
