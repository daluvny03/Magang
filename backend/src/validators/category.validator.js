import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  parentId: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .default(null)
});

export const updateCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  parentId: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .default(null)
});

export const categoryQuerySchema = Joi.object({
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
    .default('')
});