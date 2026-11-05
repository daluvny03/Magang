import Joi from 'joi';

export const userQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),

  search: Joi.string()
    .trim()
    .max(100)
    .allow('')
    .default(''),

  tierId: Joi.number()
    .integer()
    .min(1)
    .optional(),

  role: Joi.string()
    .valid('admin', 'user')
    .optional(),

  startDate: Joi.date()
    .iso()
    .optional(),

  endDate: Joi.date()
    .iso()
    .optional()
})
.custom((value, helpers) => {
  if (
    value.startDate &&
    value.endDate &&
    value.endDate < value.startDate
  ) {
    return helpers.error('date.range');
  }

  return value;
}, 'Date range validation')
.messages({
  'date.range':
    'endDate harus sama dengan atau setelah startDate'
});