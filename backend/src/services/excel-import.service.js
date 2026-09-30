import {
  parseExcelBuffer
} from '../utils/excel-parser.js';

import {
  validateHeaders,
  validateImportRow,
  detectDuplicateRows
} from '../validators/excel-import.validator.js';

import {
  findCategoryById,
  findCategoryByNameAndParent
} from '../repositories/category.repository.js';

import {
  createQuestionsTransaction,
  findDuplicateQuestions
} from '../repositories/question.repository.js';

import { AppError } from '../utils/app-error.js';

const normalize = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return '';
  }

  return String(value).trim();
};

const findCategoryHierarchy = async ({
  category,
  subcategory,
  chapter
}) => {
  const rootCategory =
    await findCategoryByNameAndParent({
      name: category,
      parentId: null
    });

  if (!rootCategory) {
    return null;
  }

  if (!subcategory) {
    return rootCategory;
  }

  const subCategory =
    await findCategoryByNameAndParent({
      name: subcategory,
      parentId: rootCategory.id
    });

  if (!subCategory) {
    return null;
  }

  if (!chapter) {
    return subCategory;
  }

  return findCategoryByNameAndParent({
    name: chapter,
    parentId: subCategory.id
  });
};

const transformRow = async (row, rowNumber) => {
  const category = normalize(row.category);
  const subcategory = normalize(row.subcategory);
  const chapter = normalize(row.chapter);

  const resolvedCategory =
    await findCategoryHierarchy({
      category,
      subcategory,
      chapter
    });

  if (!resolvedCategory) {
    return {
      rowNumber,
      valid: false,
      errors: [
        {
          row: rowNumber,
          field: 'category',
          message: `Category hierarchy not found for row ${rowNumber}`
        }
      ]
    };
  }

  return {
    rowNumber,
    valid: true,
    data: {
      categoryId: resolvedCategory.id,

      questionText: normalize(row.question),

      answerOptions: [
        {
          key: 'A',
          text: normalize(row.option_a)
        },
        {
          key: 'B',
          text: normalize(row.option_b)
        },
        {
          key: 'C',
          text: normalize(row.option_c)
        },
        {
          key: 'D',
          text: normalize(row.option_d)
        },
        {
          key: 'E',
          text: normalize(row.option_e)
        }
      ],

      correctAnswer: normalize(
        row.correct_answer
      ).toUpperCase(),

      explanation: {
        summary: normalize(
          row.explanation_summary
        ),
        detail: normalize(
          row.explanation_detail
        ),
        tips: normalize(
          row.explanation_tips
        )
      },

      score: Number(row.score),

      difficulty: Number(row.difficulty),

      isActive: true
    }
  };
};

export const previewExcelImport = async (buffer) => {
  const { sheetName, rows } =
    parseExcelBuffer(buffer);

  const headerResult =
    validateHeaders(rows);

  if (!headerResult.valid) {
    throw new AppError(
      'Invalid Excel headers',
      422,
      'INVALID_EXCEL_HEADERS',
      headerResult.errors
    );
  }

  const duplicateRows =
    detectDuplicateRows(rows);

  const validationErrors = [];

  rows.forEach((row, index) => {
    const result = validateImportRow(
      row,
      index + 2
    );

    if (!result.valid) {
      validationErrors.push(
        ...result.errors
      );
    }
  });

  const transformedRows = [];

  const databaseDuplicates =
  await detectDatabaseDuplicates(
    transformedRows
  );

  for (
    let index = 0;
    index < rows.length;
    index++
  ) {
    const result = await transformRow(
      rows[index],
      index + 2
    );

    if (!result.valid) {
      validationErrors.push(
        ...result.errors
      );
      continue;
    }

    transformedRows.push(result);
  }

  const errors = [
    ...validationErrors,
    ...duplicateRows,
    ...databaseDuplicates
    ];

  return {
    sheetName,
    totalRows: rows.length,
    validRows:
      transformedRows.length,
    invalidRows:
      rows.length - transformedRows.length,
    errors,
    preview: transformedRows
  };
};

const detectDatabaseDuplicates = async (
  transformedRows
) => {
  const questions = transformedRows.map(
    (item) => item.data
  );

  const existingQuestions =
    await findDuplicateQuestions(
      questions
    );

  return existingQuestions.map(
    (existingQuestion) => ({
      row: transformedRows.find(
        (item) =>
          item.data.categoryId ===
            existingQuestion.category_id &&
          item.data.questionText
            .trim()
            .toLowerCase() ===
            existingQuestion.question_text
              .trim()
              .toLowerCase()
      )?.rowNumber,
      field: 'question',
      message:
        'Question already exists in the database',
      existingQuestionId:
        existingQuestion.id
    })
  );
};

export const importQuestionsFromExcel =
  async (buffer) => {
    const {
      sheetName,
      rows
    } = parseExcelBuffer(buffer);

    const headerResult =
      validateHeaders(rows);

    if (!headerResult.valid) {
      throw new AppError(
        'Invalid Excel headers',
        422,
        'INVALID_EXCEL_HEADERS',
        headerResult.errors
      );
    }

    const validationErrors = [];

    rows.forEach((row, index) => {
      const result =
        validateImportRow(
          row,
          index + 2
        );

      if (!result.valid) {
        validationErrors.push(
          ...result.errors
        );
      }
    });

    const duplicateRows =
      detectDuplicateRows(rows);

    validationErrors.push(
      ...duplicateRows
    );

    if (validationErrors.length > 0) {
      throw new AppError(
        'Excel validation failed',
        422,
        'EXCEL_VALIDATION_FAILED',
        validationErrors
      );
    }

    const transformedRows = [];

    for (
      let index = 0;
      index < rows.length;
      index++
    ) {
      const result =
        await transformRow(
          rows[index],
          index + 2
        );

      if (!result.valid) {
        validationErrors.push(
          ...result.errors
        );

        continue;
      }

      transformedRows.push(
        result
      );
    }

    if (validationErrors.length > 0) {
      throw new AppError(
        'Excel validation failed',
        422,
        'EXCEL_VALIDATION_FAILED',
        validationErrors
      );
    }

    const databaseDuplicates =
      await detectDatabaseDuplicates(
        transformedRows
      );

    if (
      databaseDuplicates.length > 0
    ) {
      throw new AppError(
        'Duplicate questions detected',
        409,
        'DUPLICATE_QUESTIONS',
        databaseDuplicates
      );
    }

    const questions =
      transformedRows.map(
        (item) => item.data
      );

    const insertedQuestions =
      await createQuestionsTransaction(
        questions
      );

    return {
      sheetName,
      totalRows: rows.length,
      insertedRows:
        insertedQuestions.length,
      data: insertedQuestions
    };
  };