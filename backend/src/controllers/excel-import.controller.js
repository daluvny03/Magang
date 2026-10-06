import {
  previewExcelImport,
  importQuestionsFromExcel
} from '../services/excel-import.service.js';
import fs from 'fs/promises';

import {
  parseQuestionZip
} from '../utils/zip-parser.js';

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
        message: 'ZIP file is required',
        errors: [
          {
            field: 'file',
            message:
              'Please upload a ZIP file'
          }
        ]
      });
    }

    const {
      excelBuffer,
      entries
    } = parseQuestionZip(
      req.file.path
    );

    const result =
      await previewExcelImport(
        excelBuffer,
        entries
      );

    return res.status(200).json({
      success: true,
      message:
        'Import file processed successfully',
      data: result
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

export const importQuestions = async (
  req,
  res,
  next
) => {
  try {
    if (!req.file) {
      return res.status(422).json({
        success: false,
        message:
          'ZIP file is required',
        errors: [
          {
            field: 'file',
            message:
              'Please upload a ZIP file'
          }
        ]
      });
    }

    const {
      excelBuffer,
      entries
    } = parseQuestionZip(
      req.file.path
    );

    const result =
      await importQuestionsFromExcel(
        excelBuffer,
        entries
      );

    return res.status(201).json({
      success: true,
      message:
        'Questions imported successfully',
      data: result
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