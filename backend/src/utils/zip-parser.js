import AdmZip from 'adm-zip';
import { AppError } from './app-error.js';

const validateZipEntries = (entries) => {
  for (const entry of entries) {
    const name = entry.entryName;

    if (
      name.includes('..') ||
      name.startsWith('/') ||
      name.startsWith('\\')
    ) {
      throw new AppError(
        'ZIP contains an invalid file path',
        422,
        'INVALID_ZIP_STRUCTURE'
      );
    }
  }
};

export const parseQuestionZip = (
  zipPath
) => {
  const zip = new AdmZip(zipPath);

  const entries = zip.getEntries();

  validateZipEntries(entries);

  const excelEntry = entries.find(
    (entry) =>
      !entry.isDirectory &&
      entry.entryName === 'questions.xlsx'
  );

  if (!excelEntry) {
    throw new AppError(
      'questions.xlsx not found in ZIP file',
      422,
      'IMPORT_EXCEL_NOT_FOUND'
    );
  }

  const excelBuffer =
    excelEntry.getData();

  if (
    !excelBuffer ||
    !Buffer.isBuffer(excelBuffer)
  ) {
    throw new AppError(
      'Unable to read questions.xlsx',
      422,
      'INVALID_EXCEL_FILE'
    );
  }

  return {
    zip,
    entries,
    excelBuffer
  };
};