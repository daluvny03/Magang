export const normalizeQuestionText = (
  value
) => {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
};