import { AppError } from '../utils/app-error.js';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return next(
        new AppError(
          'Validation failed',
          422,
          'VALIDATION_ERROR',
          errors
        )
      );
    }

    req.body = value;

    next();
  };
};