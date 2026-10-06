import { AppError } from '../utils/app-error.js';
export const parseQuestionForm = (
  req,
  res,
  next
) => {
  try {
    if (
      typeof req.body.answerOptions === 'string'
    ) {
      req.body.answerOptions = JSON.parse(
        req.body.answerOptions
      );
    }

    if (
      typeof req.body.explanation === 'string'
    ) {
      req.body.explanation = JSON.parse(
        req.body.explanation
      );
    }

    const removeFields = [
      'removeQuestionImage',
      'removeOptionImageA',
      'removeOptionImageB',
      'removeOptionImageC',
      'removeOptionImageD',
      'removeOptionImageE'
    ];

    removeFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.body[field] =
          req.body[field] === true ||
          req.body[field] === 'true';
      }
    });

    next();
  } catch {
    next(
      new AppError(
        'Invalid question form data',
        422,
        'INVALID_QUESTION_FORM_DATA'
      )
    );
  }
};