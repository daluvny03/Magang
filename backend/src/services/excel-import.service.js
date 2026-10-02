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
  console.log('Found root category:', rootCategory);
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

  console.log('Finding chapter:', chapter, 'under subcategory:', subCategory.id);

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

  const rowStatusMap =
    createRowStatusMap(rows);

  // 1. Basic row validation
  rows.forEach((row, index) => {
    const rowNumber = index + 2;

    const result =
      validateImportRow(
        row,
        rowNumber
      );

    if (!result.valid) {
      addRowErrors(
        rowStatusMap,
        result.errors
      );
    }
  });

  // 2. Duplicate dalam Excel
  const duplicateRows =
    detectDuplicateRows(rows);

  addRowErrors(
    rowStatusMap,
    duplicateRows
  );

  // 3. Transform row
  const transformedRows = [];

  for (
    let index = 0;
    index < rows.length;
    index++
  ) {
    const rowNumber = index + 2;

    const rowStatus =
      rowStatusMap.get(rowNumber);

    // Jangan transform row yang sudah invalid
    if (!rowStatus.valid) {
      continue;
    }

    const result =
      await transformRow(
        rows[index],
        rowNumber
      );

    if (!result.valid) {
      addRowErrors(
        rowStatusMap,
        result.errors
      );

      continue;
    }

    transformedRows.push(
      result
    );
  }

  // 4. Duplicate dengan database
  const databaseDuplicates =
    await detectDatabaseDuplicates(
      transformedRows
    );

  addRowErrors(
    rowStatusMap,
    databaseDuplicates
  );

  // 5. Build preview
  const preview = [];

  for (
    let index = 0;
    index < rows.length;
    index++
  ) {
    const rowNumber = index + 2;

    const rowStatus =
      rowStatusMap.get(rowNumber);

    const transformedRow =
      transformedRows.find(
        (item) =>
          item.rowNumber === rowNumber
      );

    preview.push({
      rowNumber,
      valid: rowStatus.valid,
      ...(rowStatus.errors.length > 0
        ? {
            errors: rowStatus.errors
          }
        : {}),
      ...(transformedRow
        ? {
            data: transformedRow.data
          }
        : {})
    });
  }

  const validRows =
    preview.filter(
      (row) => row.valid
    ).length;

  const invalidRows =
    preview.filter(
      (row) => !row.valid
    ).length;

  const errors = preview.flatMap(
    (row) => row.errors || []
  );

  return {
    sheetName,
    totalRows: rows.length,
    validRows,
    invalidRows,
    errors,
    preview
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

    const rowStatusMap =
      createRowStatusMap(rows);

    // 1. Basic validation
    rows.forEach((row, index) => {
      const rowNumber = index + 2;

      const result =
        validateImportRow(
          row,
          rowNumber
        );

      if (!result.valid) {
        addRowErrors(
          rowStatusMap,
          result.errors
        );
      }
    });

    // 2. Duplicate dalam Excel
    const duplicateRows =
      detectDuplicateRows(rows);

    addRowErrors(
      rowStatusMap,
      duplicateRows
    );

    // 3. Transform hanya row valid
    const transformedRows = [];

    for (
      let index = 0;
      index < rows.length;
      index++
    ) {
      const rowNumber = index + 2;

      const rowStatus =
        rowStatusMap.get(rowNumber);

      if (!rowStatus.valid) {
        continue;
      }

      const result =
        await transformRow(
          rows[index],
          rowNumber
        );

      if (!result.valid) {
        addRowErrors(
          rowStatusMap,
          result.errors
        );

        continue;
      }

      transformedRows.push(
        result
      );
    }

    // 4. Duplicate database
    const databaseDuplicates =
      await detectDatabaseDuplicates(
        transformedRows
      );

    addRowErrors(
      rowStatusMap,
      databaseDuplicates
    );

    // 5. Ambil hanya row yang benar-benar valid
    const validQuestions =
      transformedRows
        .filter((item) => {
          const rowStatus =
            rowStatusMap.get(
              item.rowNumber
            );

          return rowStatus.valid;
        })
        .map(
          (item) => item.data
        );

    // 6. Insert hanya kalau ada row valid
    let insertedQuestions = [];

    if (validQuestions.length > 0) {
      insertedQuestions =
        await createQuestionsTransaction(
          validQuestions
        );
    }

    // 7. Build error report
    const preview = rows.map(
      (row, index) => {
        const rowNumber =
          index + 2;

        const rowStatus =
          rowStatusMap.get(
            rowNumber
          );

        const transformedRow =
          transformedRows.find(
            (item) =>
              item.rowNumber ===
              rowNumber
          );

        return {
          rowNumber,
          valid: rowStatus.valid,
          ...(rowStatus.errors.length > 0
            ? {
                errors:
                  rowStatus.errors
              }
            : {}),
          ...(transformedRow &&
          rowStatus.valid
            ? {
                data:
                  transformedRow.data
              }
            : {})
        };
      }
    );

    const validRows =
      preview.filter(
        (row) => row.valid
      ).length;

    const invalidRows =
      preview.filter(
        (row) => !row.valid
      ).length;

    const errors =
      preview.flatMap(
        (row) => row.errors || []
      );

    return {
      sheetName,
      totalRows: rows.length,
      validRows,
      invalidRows,
      insertedRows:
        insertedQuestions.length,
      skippedRows:
        invalidRows,
      errors,
      data: insertedQuestions
    };
  };

  const createRowStatusMap = (rows) => {
  return rows.reduce((map, row, index) => {
    const rowNumber = index + 2;

    map.set(rowNumber, {
      rowNumber,
      valid: true,
      errors: []
    });

    return map;
  }, new Map());
};

const addRowErrors = (
  rowStatusMap,
  errors
) => {
  errors.forEach((error) => {
    const rowStatus =
      rowStatusMap.get(error.row);

    if (!rowStatus) {
      return;
    }

    rowStatus.valid = false;
    rowStatus.errors.push(error);
  });
};