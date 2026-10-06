import Joi from 'joi';

const answerOptionSchema = Joi.object({
  key: Joi.string()
    .valid('A', 'B', 'C', 'D', 'E')
    .required(),

  text: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .default(''),

  image: Joi.string()
    .allow(null, '')
    .default(null)
});

const explanationSchema = Joi.object({
  summary: Joi.string()
    .trim()
    .min(1)
    .max(2000)
    .required(),

  detail: Joi.string()
    .trim()
    .max(5000)
    .allow('', null),

  tips: Joi.string()
    .trim()
    .max(2000)
    .allow('', null),

  options: Joi.object({
    A: Joi.string().allow('', null),
    B: Joi.string().allow('', null),
    C: Joi.string().allow('', null),
    D: Joi.string().allow('', null),
    E: Joi.string().allow('', null)
  }).optional()
}).required();

export const createQuestionSchema = Joi.object({
  categoryId: Joi.number()
    .integer()
    .positive()
    .required(),

  questionText: Joi.string()
    .trim()
    .min(5)
    .max(10000)
    .required(),

  answerOptions: Joi.array()
    .items(answerOptionSchema)
    .length(5)
    .required(),

  correctAnswer: Joi.string()
    .valid('A', 'B', 'C', 'D', 'E')
    .required(),

  explanation: explanationSchema,

  score: Joi.number()
    .integer()
    .min(0)
    .required(),

  difficulty: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required(),

  isActive: Joi.boolean()
    .default(true)
});

export const updateQuestionSchema = Joi.object({
  categoryId: Joi.number()
    .integer()
    .positive()
    .required(),

  questionText: Joi.string()
    .trim()
    .min(5)
    .max(10000)
    .required(),

  answerOptions: Joi.array()
    .items(answerOptionSchema)
    .length(5)
    .required(),

  correctAnswer: Joi.string()
    .valid('A', 'B', 'C', 'D', 'E')
    .required(),

  explanation: explanationSchema,

  score: Joi.number()
    .integer()
    .min(0)
    .required(),

  difficulty: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required(),

  isActive: Joi.boolean()
    .required(),

  removeQuestionImage: Joi.boolean()
  .default(false),

removeOptionImageA: Joi.boolean()
  .default(false),

removeOptionImageB: Joi.boolean()
  .default(false),

removeOptionImageC: Joi.boolean()
  .default(false),

removeOptionImageD: Joi.boolean()
  .default(false),

removeOptionImageE: Joi.boolean()
  .default(false)
});

export const questionQuerySchema = Joi.object({
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
    .max(200)
    .allow('')
    .default(''),

  categoryId: Joi.number()
    .integer()
    .positive(),

  difficulty: Joi.number()
    .integer()
    .min(1)
    .max(5),

  isActive: Joi.boolean()
});