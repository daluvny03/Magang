import AdmZip from 'adm-zip';
import XLSX from 'xlsx';

import { AppError } from '../utils/app-error.js';

// Helper functions (tetap di luar fungsi utama)
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

const normalizeImageName = (value) => {
  const normalized = String(value ?? '').trim();
  return normalized || null;
};

const normalizeQuestionRow = (row, index) => {
  return {
    row: index + 2,

    categoryId: Number(row.category_id),

    questionText: String(row.question ?? '').trim(),

    questionImageName: normalizeImageName(row.question_image),

    answerOptions: [
      {
        key: 'A',
        text: String(row.option_a ?? '').trim(),
        imageName: normalizeImageName(row.option_a_image)
      },
      {
        key: 'B',
        text: String(row.option_b ?? '').trim(),
        imageName: normalizeImageName(row.option_b_image)
      },
      {
        key: 'C',
        text: String(row.option_c ?? '').trim(),
        imageName: normalizeImageName(row.option_c_image)
      },
      {
        key: 'D',
        text: String(row.option_d ?? '').trim(),
        imageName: normalizeImageName(row.option_d_image)
      },
      {
        key: 'E',
        text: String(row.option_e ?? '').trim(),
        imageName: normalizeImageName(row.option_e_image)
      }
    ],

    correctAnswer: String(row.correct_answer ?? '')
      .trim()
      .toUpperCase(),

    explanation: {
      summary: String(row.summary ?? '').trim(),
      detail: String(row.detail ?? '').trim(),
      tips: String(row.tips ?? '').trim()
    },

    score: Number(row.score),

    difficulty: Number(row.difficulty),

    isActive: true
  };
};

// Fungsi Utama Export
export const parseQuestionImport = async (zipPath) => {
  const zip = new AdmZip(zipPath);

  const entries = zip.getEntries();

  // Validasi keamanan struktur ZIP
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

  const excelBuffer = excelEntry.getData();

  const workbook = XLSX.read(excelBuffer, {
    type: 'buffer'
  });

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new AppError(
      'Excel file does not contain a worksheet',
      422,
      'IMPORT_SHEET_NOT_FOUND'
    );
  }

  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    defval: ''
  });

  if (!rows.length) {
    throw new AppError(
      'Excel file does not contain questions',
      422,
      'IMPORT_EMPTY'
    );
  }

  // Normalisasi data baris pertanyaan
  const questions = rows.map(normalizeQuestionRow);

  return {
    zip,
    entries,
    questions
  };
};