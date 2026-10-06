import {
  getQuestions,
  getQuestionById,
  createNewQuestion,
  updateExistingQuestion,
  removeQuestion
} from '../services/question.service.js';
import {
  buildQuestionMedia,
  buildUpdatedQuestionMedia,
  cleanupUploadedFiles,
  deleteQuestionImage
} from '../utils/question-image.js';

import {
  parseQuestionImport
} from '../services/question-import.service.js';
import { AppError } from '../utils/app-error.js';
import fs from 'fs/promises';

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

export const createQuestion = async (
  req,
  res,
  next
) => {
  try {
    const media = buildQuestionMedia({
      files: req.files,
      answerOptions:
        req.body.answerOptions
    });

    const payload = {
      ...req.body,

      questionImage:
        media.questionImage,

      answerOptions:
        media.answerOptions
    };

    const question =
      await createNewQuestion(payload);

    return res.status(201).json({
      success: true,
      message:
        'Question created successfully',
      data: question
    });
  } catch (error) {
    await cleanupUploadedFiles(
      req.files
    );

    next(error);
  }
};

export const updateQuestion = async (
  req,
  res,
  next
) => {
  try {
    const id = Number(req.params.id);

    const existingQuestion =
      await getQuestionById(id);

    const media =
      buildUpdatedQuestionMedia({
        files: req.files,

        answerOptions:
          req.body.answerOptions,

        existingQuestion,

        removeFlags: {
          removeQuestionImage:
            req.body.removeQuestionImage,

          removeOptionImageA:
            req.body.removeOptionImageA,

          removeOptionImageB:
            req.body.removeOptionImageB,

          removeOptionImageC:
            req.body.removeOptionImageC,

          removeOptionImageD:
            req.body.removeOptionImageD,

          removeOptionImageE:
            req.body.removeOptionImageE
        }
      });

    const {
      removeQuestionImage,
      removeOptionImageA,
      removeOptionImageB,
      removeOptionImageC,
      removeOptionImageD,
      removeOptionImageE,
      ...questionData
    } = req.body;

    const payload = {
      ...questionData,

      questionImage:
        media.questionImage,

      answerOptions:
        media.answerOptions
    };

    const question =
      await updateExistingQuestion({
        id,
        ...payload
      });

    // Database berhasil.
    // Baru sekarang file lama aman dihapus.
    await Promise.allSettled(
      media.oldImagesToDelete.map(
        deleteQuestionImage
      )
    );

    return res.status(200).json({
      success: true,
      message:
        'Question updated successfully',
      data: question
    });

  } catch (error) {

    // Kalau update gagal,
    // hapus FILE BARU yang baru saja diupload.
    await cleanupUploadedFiles(
      req.files
    );

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

export const previewQuestionImport = async (
  req,
  res,
  next
) => {
  try {
    if (!req.file) {
      throw new AppError(
        'ZIP file is required',
        422,
        'IMPORT_FILE_REQUIRED'
      );
    }

    const result =
      await parseQuestionImport(
        req.file.path
      );

    return res.status(200).json({
      success: true,
      message:
        'Question import file parsed successfully',

      data: {
        total:
          result.questions.length,

        questions:
          result.questions
      }
    });

  } catch (error) {
    next(error);

  } finally {
    if (req.file?.path) {
      await fs
        .unlink(req.file.path)
        .catch(() => {});
    }
  }
};