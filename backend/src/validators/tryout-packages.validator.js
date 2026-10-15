import Joi from 'joi';
import { AppError } from '../utils/app-error.js';

export const validatePackageSchedule = (payload, existing = {}) => {
  const startAt = payload.startAt === undefined
    ? existing.start_at
    : payload.startAt;
  const endAt = payload.endAt === undefined
    ? existing.end_at
    : payload.endAt;

  for (const [field, value] of Object.entries({ startAt, endAt })) {
    if (value != null && !Number.isFinite(new Date(value).getTime())) {
      throw new AppError('Invalid package schedule', 422, 'INVALID_PACKAGE_SCHEDULE', [
        { field, message: 'Schedule must contain a valid date' }
      ]);
    }
  }

  if (startAt != null && endAt != null && new Date(endAt) <= new Date(startAt)) {
    throw new AppError('Invalid package schedule', 422, 'INVALID_PACKAGE_SCHEDULE', [
      { field: 'endAt', message: 'End date must be after start date' }
    ]);
  }
};

const questionSchema = Joi.object({
  questionId: Joi.number()
    .integer()
    .positive()
    .required(),

  questionOrder: Joi.number()
    .integer()
    .positive()
    .required()
});

const baseFields = {
  name: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required(),

  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(200)
    .required(),

  description: Joi.string()
    .trim()
    .max(10000)
    .allow('', null),

  durationMinutes: Joi.number()
    .integer()
    .min(1)
    .required(),

  passingScore: Joi.number()
    .min(0)
    .precision(2)
    .allow(null),

  passingMode: Joi.string()
    .valid('none', 'total', 'category')
    .default('none'),

  passingGrades: Joi.object({
    twk: Joi.number()
      .min(0)
      .precision(2),

    tiu: Joi.number()
      .min(0)
      .precision(2),

    tkp: Joi.number()
      .min(0)
      .precision(2),
  })
    .min(1)
    .allow(null),

  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .required(),

  isFree: Joi.boolean()
    .default(false),

  startAt: Joi.date()
    .iso()
    .allow(null),

  endAt: Joi.date()
    .iso()
    .allow(null),

  categoryIds: Joi.array()
    .items(
      Joi.number()
        .integer()
        .positive()
    )
    .unique()
    .min(1)
    .required(),

  questions: Joi.array()
    .items(questionSchema)
    .min(1)
    .unique((a, b) => a.questionId === b.questionId)
    .required(),

  subscriptionTierIds: Joi.array()
    .items(
      Joi.number()
        .integer()
        .positive()
    )
    .unique()
    .min(1)
    .required()
};

export const createPackageSchema =
  Joi.object({
    ...baseFields
  }).custom((value, helpers) => {
    if (
      value.startAt &&
      value.endAt &&
      new Date(value.endAt) <=
        new Date(value.startAt)
    ) {
      return helpers.error(
        'any.invalid'
      );
    }

    return value;
  });

export const updatePackageSchema = Joi.object({
  ...baseFields,
})
  .fork(
    Object.keys(baseFields),
    (schema) => schema.optional()
  )
  .min(1)
  .custom((value, helpers) => {
    if (
      value.startAt &&
      value.endAt &&
      new Date(value.endAt) <=
        new Date(value.startAt)
    ) {
      return helpers.error('any.invalid')
    }

    return value
  })

export const packageQuerySchema =
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
      .max(200)
      .allow('')
      .default(''),

    status: Joi.string()
      .valid(
        'draft',
        'published',
        'archived'
      )
      .allow('')
      .default(''),

    isFree: Joi.boolean()
      .allow(null)
  });

  export const updatePackageCategoriesSchema =
  Joi.object({
    categoryIds: Joi.array()
      .items(
        Joi.number()
          .integer()
          .positive()
          .required()
      )
      .unique()
      .min(1)
      .required()
  });

  export const updatePackageQuestionsSchema =
  Joi.object({
    questions: Joi.array()
      .items(
        Joi.object({
          questionId: Joi.number()
            .integer()
            .positive()
            .required(),

          questionOrder: Joi.number()
            .integer()
            .positive()
            .required()
        })
      )
      .min(1)
      .required()
      .custom((questions, helpers) => {
        const questionIds = questions.map(
          (question) =>
            question.questionId
        );

        const questionOrders = questions.map(
          (question) =>
            question.questionOrder
        );

        if (
          new Set(questionIds).size !==
          questionIds.length
        ) {
          return helpers.message(
            'questions contains duplicate questionId'
          );
        }

        if (
          new Set(questionOrders).size !==
          questionOrders.length
        ) {
          return helpers.message(
            'questions contains duplicate questionOrder'
          );
        }

        return questions;
      })
  });

  export const updatePackageSubscriptionTiersSchema =
  Joi.object({
    subscriptionTierIds: Joi.array()
      .items(
        Joi.number()
          .integer()
          .positive()
          .required()
      )
      .unique()
      .min(1)
      .required()
  });
