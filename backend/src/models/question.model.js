export const createQuestionModel = ({
  id,
  categoryId,
  questionText,
  questionImage,
  answerOptions,
  correctAnswer,
  explanation,
  score,
  difficulty,
  isActive,
  createdAt,
  updatedAt,
  category
}) => ({
  id,
  categoryId,
  questionText,
  questionImage,
  answerOptions,
  correctAnswer,
  explanation,
  score,
  difficulty,
  isActive,
  createdAt,
  updatedAt,
  ...(category ? { category } : {})
});