import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const QUESTION_UPLOAD_DIR =
  path.resolve(
    'uploads/questions'
  );

const getExtension = (fileName) => {
  return path
    .extname(fileName)
    .toLowerCase();
};

export const persistZipImage = async ({
  imageMap,
  fileName
}) => {
  if (!fileName) {
    return null;
  }

  const entry = imageMap.get(
    fileName.toLowerCase()
  );

  if (!entry) {
    throw new Error(
      `Image not found in ZIP: ${fileName}`
    );
  }

  const extension =
    getExtension(fileName);

  const generatedName =
    `${randomUUID()}${extension}`;

  const destination =
    path.join(
      QUESTION_UPLOAD_DIR,
      generatedName
    );

  const imageBuffer =
    entry.getData();

  await fs.mkdir(
    QUESTION_UPLOAD_DIR,
    {
      recursive: true
    }
  );

  await fs.writeFile(
    destination,
    imageBuffer
  );

  return `/uploads/questions/${generatedName}`;
};

export const persistQuestionImages =
  async ({
    question,
    imageMap
  }) => {
    const savedPaths = [];

    try {
      const questionImage =
        await persistZipImage({
          imageMap,
          fileName:
            question.questionImageName
        });

      if (questionImage) {
        savedPaths.push(
          questionImage
        );
      }

      const answerOptions = [];

      for (
        const option of
        question.answerOptions
      ) {
        const image =
          await persistZipImage({
            imageMap,
            fileName:
              option.imageName
          });

        if (image) {
          savedPaths.push(image);
        }

        answerOptions.push({
          key: option.key,
          text: option.text,
          image
        });
      }

      return {
        question: {
          ...question,

          questionImage,

          answerOptions
        },

        savedPaths
      };

    } catch (error) {
      await cleanupPersistedImages(
        savedPaths
      );

      throw error;
    }
  };

  export const cleanupPersistedImages =
  async (imagePaths = []) => {
    await Promise.allSettled(
      imagePaths.map(
        async (imagePath) => {
          if (!imagePath) {
            return;
          }

          const relativePath =
            imagePath.replace(
              /^\/uploads\//,
              ''
            );

          const localPath =
            path.resolve(
              'uploads',
              relativePath
            );

          await fs.unlink(
            localPath
          );
        }
      )
    );
  };