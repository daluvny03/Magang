import {
  previewExcelImport,
  importQuestionsFromExcel
} from '../services/excel-import.service.js';

import { AppError } from '../utils/app-error.js';

export const previewQuestionImport = async (
  req,
  res,
  next
) => {
  try {
    if (!req.file) {
      return res.status(422).json({
        success: false,
        message: 'Excel file is required',
        errors: [
          {
            field: 'file',
            message: 'Please upload an Excel file'
          }
        ]
      });
    }

    const result =
      await previewExcelImport(
        req.file.buffer
      );

    return res.status(200).json({
      success: true,
      message: 'Excel file processed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const importQuestions = async (
  req,
  res,
  next
) => {
  try {
    if (!req.file) {
      return res.status(422).json({
        success: false,
        message: 'Excel file is required',
        errors: [
          {
            field: 'file',
            message:
              'Please upload an Excel file'
          }
        ]
      });
    }

    const result =
      await importQuestionsFromExcel(
        req.file.buffer
      );

    return res.status(201).json({
      success: true,
      message:
        'Questions imported successfully',
      data: result
    });
  } catch (error) {
    if (
      error.code ===
      'DUPLICATE_QUESTIONS'
    ) {
      return next(
        new AppError(
          'Duplicate questions detected',
          409,
          'DUPLICATE_QUESTIONS',
          error.duplicates || []
        )
      );
    }

    next(error);
  }
};