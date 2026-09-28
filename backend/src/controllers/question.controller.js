import {
  getQuestions,
  getQuestionById,
  createNewQuestion,
  updateExistingQuestion,
  removeQuestion
} from '../services/question.service.js';

export const getAllQuestions = async (req, res, next) => {
  try {
    const result = await getQuestions(req.query);

    return res.status(200).json({
      success: true,
      message: 'Questions retrieved successfully',
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionDetail = async (req, res, next) => {
  try {
    const question = await getQuestionById(
      Number(req.params.id)
    );

    return res.status(200).json({
      success: true,
      message: 'Question retrieved successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const question = await createNewQuestion(req.body);

    return res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const question = await updateExistingQuestion({
      id: Number(req.params.id),
      ...req.body
    });

    return res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    await removeQuestion(Number(req.params.id));

    return res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};