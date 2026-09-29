import {
  previewExcelImport
} from '../services/excel-import.service.js';

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