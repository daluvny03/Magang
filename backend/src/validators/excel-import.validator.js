export const REQUIRED_HEADERS = [
  'category',
  'question',
  'option_a',
  'option_b',
  'option_c',
  'option_d',
  'option_e',
  'correct_answer',
  'explanation_summary',
  'score',
  'difficulty'
];

export const OPTIONAL_HEADERS = [
  'subcategory',
  'chapter',
  'explanation_detail',
  'explanation_tips'
];

export const ALL_HEADERS = [
  ...REQUIRED_HEADERS,
  ...OPTIONAL_HEADERS
];

export const normalizeHeader = (header) => {
  return String(header)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
};

export const validateHeaders = (rows) => {
  if (!rows.length) {
    return {
      valid: false,
      errors: [
        {
          field: 'file',
          message: 'Excel file does not contain any data'
        }
      ]
    };
  }

  const headers = Object.keys(rows[0]).map(normalizeHeader);

  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headers.includes(header)
  );

  const unknownHeaders = headers.filter(
    (header) => !ALL_HEADERS.includes(header)
  );

  const errors = [];

  if (missingHeaders.length > 0) {
    errors.push({
      field: 'headers',
      message: `Missing required headers: ${missingHeaders.join(', ')}`
    });
  }

  if (unknownHeaders.length > 0) {
    errors.push({
      field: 'headers',
      message: `Unknown headers: ${unknownHeaders.join(', ')}`
    });
  }

  return {
    valid: errors.length === 0,
    headers,
    errors
  };
};

export const validateImportRow = (row, rowNumber) => {
  const errors = [];

  const getValue = (key) => {
    const value = row[key];

    if (value === undefined || value === null) {
      return '';
    }

    return String(value).trim();
  };

  const question = getValue('question');
  const optionA = getValue('option_a');
  const optionB = getValue('option_b');
  const optionC = getValue('option_c');
  const optionD = getValue('option_d');
  const optionE = getValue('option_e');
  const correctAnswer = getValue('correct_answer')
    .toUpperCase();

  const scoreValue = getValue('score');
  const difficultyValue = getValue('difficulty');

  if (!question) {
    errors.push({
      row: rowNumber,
      field: 'question',
      message: 'Question is required'
    });
  }

  const options = {
    A: optionA,
    B: optionB,
    C: optionC,
    D: optionD,
    E: optionE
  };

  for (const [key, value] of Object.entries(options)) {
    if (!value) {
      errors.push({
        row: rowNumber,
        field: `option_${key.toLowerCase()}`,
        message: `Option ${key} is required`
      });
    }
  }

  if (!['A', 'B', 'C', 'D', 'E'].includes(correctAnswer)) {
    errors.push({
      row: rowNumber,
      field: 'correct_answer',
      message: 'Correct answer must be A, B, C, D, or E'
    });
  }

  const score = Number(scoreValue);

  if (
    !Number.isInteger(score) ||
    score < 0
  ) {
    errors.push({
      row: rowNumber,
      field: 'score',
      message: 'Score must be a non-negative integer'
    });
  }

  const difficulty = Number(difficultyValue);

  if (
    !Number.isInteger(difficulty) ||
    difficulty < 1 ||
    difficulty > 3
  ) {
    errors.push({
      row: rowNumber,
      field: 'difficulty',
      message: 'Difficulty must be an integer between 1 and 3'
    });
  }

  const category = getValue('category');

  if (!category) {
    errors.push({
      row: rowNumber,
      field: 'category',
      message: 'Category is required'
    });
  }

  const explanationSummary =
    getValue('explanation_summary');

  if (!explanationSummary) {
    errors.push({
      row: rowNumber,
      field: 'explanation_summary',
      message: 'Explanation summary is required'
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const detectDuplicateRows = (rows) => {
  const seen = new Map();
  const duplicates = [];

  rows.forEach((row, index) => {
    const category = String(
      row.category || ''
    )
      .trim()
      .toLowerCase();

    const question = String(
      row.question || ''
    )
      .trim()
      .toLowerCase();

    if (!category || !question) {
      return;
    }

    const key = `${category}::${question}`;

    if (seen.has(key)) {
      duplicates.push({
        row: index + 2,
        duplicateOf: seen.get(key),
        field: 'question',
        message:
          'Duplicate question detected in Excel'
      });

      return;
    }

    seen.set(
      key,
      index + 2
    );
  });

  return duplicates;
};