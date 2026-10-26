
import katex from 'katex';

const MAX_CONTENT_LENGTH = 20000;
const MAX_EXPRESSIONS = 100;

const DELIMITERS = [
  { open: '\\(', close: '\\)', displayMode: false },
  { open: '\\[', close: '\\]', displayMode: true },
  { open: '$$', close: '$$', displayMode: true },
];

const renderOptions = {
  throwOnError: true,
  trust: false,
  strict: 'warn',
  maxExpand: 1000,
  maxSize: 10,
};

export const validateLatexContent = (content) => {
  const errors = [];
  const value = String(content ?? '');

  if (value.length > MAX_CONTENT_LENGTH) {
    return [{
      message: 'Content exceeds maximum allowed length',
    }];
  }

  let position = 0;
  let expressionCount = 0;

  while (position < value.length) {
    const delimiter = DELIMITERS
      .map((item) => ({
        ...item,
        index: value.indexOf(item.open, position),
      }))
      .filter((item) => item.index !== -1)
      .sort((a, b) => a.index - b.index)[0];

    if (!delimiter) break;

    const start = delimiter.index + delimiter.open.length;
    const end = value.indexOf(delimiter.close, start);

    if (end === -1) {
      errors.push({
        message: `Unclosed LaTeX delimiter ${delimiter.open}`,
      });
      break;
    }

    const expression = value.slice(start, end);

    if (!expression.trim()) {
      errors.push({
        message: 'Empty LaTeX expression',
      });
    } else {
      try {
        katex.renderToString(expression, {
          ...renderOptions,
          displayMode: delimiter.displayMode,
        });
      } catch (error) {
        if (!(error instanceof katex.ParseError)) {
          throw error;
        }

        errors.push({
          message: 'Invalid or unsupported LaTeX expression',
        });
      }
    }

    expressionCount += 1;

    if (expressionCount > MAX_EXPRESSIONS) {
      errors.push({
        message: 'Too many LaTeX expressions',
      });
      break;
    }

    position = end + delimiter.close.length;
  }

  return errors;
};
