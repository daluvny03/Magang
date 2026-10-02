import Joi from 'joi';

export const userQuerySchema =
  Joi.object({
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

    role: Joi.string()
      .valid('admin', 'user')
      .optional()
  });