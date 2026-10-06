import path from 'path';

const allowedExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp'
];

const normalizeFileName = (value) => {
  return String(value ?? '')
    .trim()
    .replace(/\\/g, '/');
};

export const buildZipImageMap = (
  entries
) => {
  const imageMap = new Map();

  entries.forEach((entry) => {
    if (entry.isDirectory) {
      return;
    }

    const entryName =
      normalizeFileName(
        entry.entryName
      );

    if (!entryName.startsWith('images/')) {
      return;
    }

    const fileName =
      entryName.substring(
        'images/'.length
      );

    if (!fileName) {
      return;
    }

    imageMap.set(
      fileName.toLowerCase(),
      entry
    );
  });

  return imageMap;
};

export const validateImageReference = ({
  fileName,
  imageMap,
  row,
  field
}) => {
  if (!fileName) {
    return null;
  }

  const normalized =
    normalizeFileName(fileName);

  // filename dari Excel tidak boleh path
  if (
    normalized.includes('/') ||
    normalized.includes('..')
  ) {
    return {
      row,
      field,
      message:
        `Invalid image filename: ${fileName}`
    };
  }

  const extension =
    path.extname(
      normalized
    ).toLowerCase();

  if (
    !allowedExtensions.includes(
      extension
    )
  ) {
    return {
      row,
      field,
      message:
        `Unsupported image format: ${fileName}`
    };
  }

  if (
    !imageMap.has(
      normalized.toLowerCase()
    )
  ) {
    return {
      row,
      field,
      message:
        `Image not found in ZIP: ${fileName}`
    };
  }

  return null;
};

export const validateRowImages = ({
  row,
  rowNumber,
  imageMap
}) => {
  const errors = [];

  const references = [
    {
      field: 'question_image',
      fileName: row.question_image
    },
    {
      field: 'option_a_image',
      fileName: row.option_a_image
    },
    {
      field: 'option_b_image',
      fileName: row.option_b_image
    },
    {
      field: 'option_c_image',
      fileName: row.option_c_image
    },
    {
      field: 'option_d_image',
      fileName: row.option_d_image
    },
    {
      field: 'option_e_image',
      fileName: row.option_e_image
    }
  ];

  references.forEach(
    ({ field, fileName }) => {
      const error =
        validateImageReference({
          fileName:
            String(
              fileName ?? ''
            ).trim(),

          imageMap,
          row: rowNumber,
          field
        });

      if (error) {
        errors.push(error);
      }
    }
  );

  return errors;
};