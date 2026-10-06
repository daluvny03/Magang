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

import {
  buildZipImageMap,
  validateRowImages
} from '../utils/zip-image-validator.js';

import {
  persistQuestionImages,
  cleanupPersistedImages
} from '../utils/zip-image-persistence.js';

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

      questionImageName:
        normalize(row.question_image) || null,

        answerOptions: [
        {
            key: 'A',
            text: normalize(row.option_a),
            imageName:
            normalize(row.option_a_image) ||
            null
        },
        {
            key: 'B',
            text: normalize(row.option_b),
            imageName:
            normalize(row.option_b_image) ||
            null
        },
        {
            key: 'C',
            text: normalize(row.option_c),
            imageName:
            normalize(row.option_c_image) ||
            null
        },
        {
            key: 'D',
            text: normalize(row.option_d),
            imageName:
            normalize(row.option_d_image) ||
            null
        },
        {
            key: 'E',
            text: normalize(row.option_e),
            imageName:
            normalize(row.option_e_image) ||
            null
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

export const previewExcelImport = async (buffer, zipEntries = []) => {
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

  const imageMap =
  buildZipImageMap(
    zipEntries
  );

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

  rows.forEach((row, index) => {
    const rowNumber =
        index + 2;

    const imageErrors =
        validateRowImages({
        row,
        rowNumber,
        imageMap
        });

    addRowErrors(
        rowStatusMap,
        imageErrors
    );
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
  async (
    buffer,
    zipEntries = []
  ) => {
    // ==============================
    // 1. PARSE EXCEL & ZIP IMAGES
    // ==============================

    const {
      sheetName,
      rows
    } = parseExcelBuffer(buffer);

    const imageMap =
      buildZipImageMap(
        zipEntries
      );

    // ==============================
    // 2. VALIDATE HEADERS
    // ==============================

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

    // ==============================
    // 3. BASIC ROW VALIDATION
    // ==============================

    rows.forEach((row, index) => {
      const rowNumber =
        index + 2;

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

    // ==============================
    // 4. IMAGE VALIDATION
    // ==============================

    rows.forEach((row, index) => {
      const rowNumber =
        index + 2;

      const imageErrors =
        validateRowImages({
          row,
          rowNumber,
          imageMap
        });

      addRowErrors(
        rowStatusMap,
        imageErrors
      );
    });

    // ==============================
    // 5. DUPLICATE DALAM EXCEL
    // ==============================

    const duplicateRows =
      detectDuplicateRows(rows);

    addRowErrors(
      rowStatusMap,
      duplicateRows
    );

    // ==============================
    // 6. TRANSFORM ROW
    // ==============================

    const transformedRows = [];

    for (
      let index = 0;
      index < rows.length;
      index++
    ) {
      const rowNumber =
        index + 2;

      const rowStatus =
        rowStatusMap.get(
          rowNumber
        );

      // Jangan transform row
      // yang sudah invalid
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

    // ==============================
    // 7. DUPLICATE DATABASE
    // ==============================

    const databaseDuplicates =
      await detectDatabaseDuplicates(
        transformedRows
      );

    addRowErrors(
      rowStatusMap,
      databaseDuplicates
    );

    // ==============================
    // 8. BUILD VALIDATION RESULT
    // ==============================

    const preview =
      rows.map(
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

            valid:
              rowStatus.valid,

            ...(rowStatus.errors
              .length > 0
              ? {
                  errors:
                    rowStatus.errors
                }
              : {}),

            ...(transformedRow
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
        (row) =>
          row.errors || []
      );

    // ==============================
    // 9. ALL-OR-NOTHING
    // ==============================

    if (invalidRows > 0) {
      throw new AppError(
        'Import contains invalid rows',
        422,
        'IMPORT_VALIDATION_FAILED',
        errors
      );
    }

    // Safety check
    if (
      transformedRows.length === 0
    ) {
      throw new AppError(
        'No valid questions found',
        422,
        'NO_VALID_QUESTIONS'
      );
    }

    // ==============================
    // 10. PERSIST IMAGES
    // ==============================

    const persistedImagePaths = [];
    const questionsToInsert = [];

    try {
      for (
        const item of
        transformedRows
      ) {
        const {
          question,
          savedPaths
        } =
          await persistQuestionImages({
            question:
              item.data,
            imageMap
          });

        persistedImagePaths.push(
          ...savedPaths
        );

        // questionImageName hanya
        // dibutuhkan saat membaca ZIP.
        // Jangan masukkan ke DB.
        const {
          questionImageName,
          ...questionData
        } = question;

        // imageName juga hanya
        // referensi file dalam ZIP.
        const answerOptions =
          questionData
            .answerOptions
            .map(
              ({
                imageName,
                ...option
              }) => option
            );

        questionsToInsert.push({
          ...questionData,
          answerOptions
        });
      }

      // ==============================
      // 11. DATABASE TRANSACTION
      // ==============================

      const insertedQuestions =
        await createQuestionsTransaction(
          questionsToInsert
        );

      // ==============================
      // 12. SUCCESS
      // ==============================

      return {
        sheetName,

        totalRows:
          rows.length,

        validRows:
          rows.length,

        invalidRows: 0,

        insertedRows:
          insertedQuestions.length,

        skippedRows: 0,

        errors: [],

        data:
          insertedQuestions
      };

    } catch (error) {
      // ==============================
      // 13. ROLLBACK FILES
      // ==============================

      await cleanupPersistedImages(
        persistedImagePaths
      );

      throw error;
    }
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