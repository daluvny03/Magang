export const createQuestionModel = ({
  id,
  categoryId,
  questionText,
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