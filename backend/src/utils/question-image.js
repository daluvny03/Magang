import fs from 'fs/promises';
import path from 'path';

export const getQuestionImagePath = (file) => {
  if (!file) {
    return null;
  }

  return `/uploads/questions/${file.filename}`;
};

export const getUploadedFile = (
  files,
  fieldName
) => {
  return files?.[fieldName]?.[0] || null;
};

export const cleanupUploadedFiles = async (
  files
) => {
  if (!files) {
    return;
  }

  const uploadedFiles =
    Object.values(files).flat();

  await Promise.allSettled(
    uploadedFiles.map((file) =>
      fs.unlink(file.path)
    )
  );
};

export const buildQuestionMedia = ({
  files,
  answerOptions
}) => {
  const questionFile =
    getUploadedFile(
      files,
      'questionImage'
    );

  const questionImage =
    getQuestionImagePath(questionFile);

  const optionsWithImages =
    answerOptions.map((option) => {
      const fieldName =
        `optionImage${option.key}`;

      const optionFile =
        getUploadedFile(
          files,
          fieldName
        );

      return {
        ...option,
        image:
          getQuestionImagePath(optionFile)
      };
    });

  return {
    questionImage,
    answerOptions: optionsWithImages
  };
};

export const deleteQuestionImage = async (
  imagePath
) => {
  if (!imagePath) {
    return;
  }

  const relativePath =
    imagePath.replace(/^\/+/, '');

  const fullPath =
    path.resolve(relativePath);

  try {
    await fs.unlink(fullPath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

const findOptionByKey = (
  answerOptions,
  key
) => {
  return answerOptions.find(
    (option) => option.key === key
  );
};

export const buildUpdatedQuestionMedia = ({
  files,
  answerOptions,
  existingQuestion,
  removeFlags
}) => {
  const newQuestionFile =
    getUploadedFile(
      files,
      'questionImage'
    );

  let questionImage =
    existingQuestion.questionImage ?? null;

  const oldImagesToDelete = [];

  // REPLACE question image
  if (newQuestionFile) {
    if (questionImage) {
      oldImagesToDelete.push(
        questionImage
      );
    }

    questionImage =
      getQuestionImagePath(
        newQuestionFile
      );
  }

  // DELETE question image
  else if (
    removeFlags.removeQuestionImage
  ) {
    if (questionImage) {
      oldImagesToDelete.push(
        questionImage
      );
    }

    questionImage = null;
  }

  const updatedOptions =
    answerOptions.map((option) => {
      const existingOption =
        findOptionByKey(
          existingQuestion.answerOptions,
          option.key
        );

      const oldImage =
        existingOption?.image ?? null;

      const fieldName =
        `optionImage${option.key}`;

      const newFile =
        getUploadedFile(
          files,
          fieldName
        );

      const removeField =
        `removeOptionImage${option.key}`;

      let image = oldImage;

      // REPLACE
      if (newFile) {
        if (oldImage) {
          oldImagesToDelete.push(
            oldImage
          );
        }

        image =
          getQuestionImagePath(
            newFile
          );
      }

      // DELETE
      else if (
        removeFlags[removeField]
      ) {
        if (oldImage) {
          oldImagesToDelete.push(
            oldImage
          );
        }

        image = null;
      }

      return {
        ...option,
        image
      };
    });

  return {
    questionImage,
    answerOptions: updatedOptions,
    oldImagesToDelete
  };
};