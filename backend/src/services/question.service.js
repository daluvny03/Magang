import {
  findQuestions,
  findQuestionById,
  createQuestion,
  updateQuestion,
  deactivateQuestion
} from '../repositories/question.repository.js';

import { findCategoryById } from '../repositories/category.repository.js';
import { AppError } from '../utils/app-error.js';

const validateQuestionOptions = ({
  answerOptions,
  correctAnswer
}) => {
  const keys = answerOptions.map((option) => option.key);

  const uniqueKeys = new Set(keys);

  if (uniqueKeys.size !== 5) {
    throw new AppError(
      'Answer option keys must be unique',
      422,
      'INVALID_ANSWER_OPTIONS'
    );
  }

  const requiredKeys = ['A', 'B', 'C', 'D', 'E'];

  const hasAllKeys = requiredKeys.every((key) =>
    uniqueKeys.has(key)
  );

  if (!hasAllKeys) {
    throw new AppError(
      'Answer options must contain A, B, C, D, and E',
      422,
      'INVALID_ANSWER_OPTIONS'
    );
  }

  if (!uniqueKeys.has(correctAnswer)) {
    throw new AppError(
      'Correct answer must exist in answer options',
      422,
      'INVALID_CORRECT_ANSWER'
    );
  }
};

const validateCategory = async (categoryId) => {
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw new AppError(
      'Category not found',
      404,
      'CATEGORY_NOT_FOUND'
    );
  }

  return category;
};

export const getQuestions = async ({
  page,
  limit,
  search,
  categoryId,
  difficulty,
  isActive
}) => {
  const result = await findQuestions({
    page,
    limit,
    search,
    categoryId,
    difficulty,
    isActive
  });

  return {
    data: result.rows,
    meta: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit)
    }
  };
};

export const getQuestionById = async (id) => {
  const question = await findQuestionById(id);

  if (!question) {
    throw new AppError(
      'Question not found',
      404,
      'QUESTION_NOT_FOUND'
    );
  }

  return question;
};

export const createNewQuestion = async (data) => {
  const {
    categoryId,
    answerOptions,
    correctAnswer
  } = data;

  await validateCategory(categoryId);

  validateQuestionOptions({
    answerOptions,
    correctAnswer
  });

  return createQuestion(data);
};

export const updateExistingQuestion = async ({
  id,
  ...data
}) => {
  const existingQuestion = await findQuestionById(id);

  if (!existingQuestion) {
    throw new AppError(
      'Question not found',
      404,
      'QUESTION_NOT_FOUND'
    );
  }

  await validateCategory(data.categoryId);

  validateQuestionOptions({
    answerOptions: data.answerOptions,
    correctAnswer: data.correctAnswer
  });

  return updateQuestion({
    id,
    ...data
  });
};

export const removeQuestion = async (id) => {
  const existingQuestion = await findQuestionById(id);

  if (!existingQuestion) {
    throw new AppError(
      'Question not found',
      404,
      'QUESTION_NOT_FOUND'
    );
  }

  const result = await deactivateQuestion(id);

  if (!result) {
    throw new AppError(
      'Question could not be deleted',
      500,
      'QUESTION_DELETE_FAILED'
    );
  }
};