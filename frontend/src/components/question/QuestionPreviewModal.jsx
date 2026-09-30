import { X } from 'lucide-react'

import { DIFFICULTY_OPTIONS } from '../../constants/question'

function QuestionPreviewModal({
  isOpen,
  values,
  categoryName,
  onClose,
}) {
  if (!isOpen || !values) return null

  const difficulty = DIFFICULTY_OPTIONS.find(
    (item) => Number(item.value) === Number(values.difficulty),
  )

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Question Preview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Preview how this question will appear.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          {/* Metadata */}
          <div className="mb-5 flex flex-wrap gap-2">
            {categoryName && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {categoryName}
              </span>
            )}

            {difficulty && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {difficulty.label}
              </span>
            )}

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              Score: {values.score}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                values.isActive
                  ? 'bg-green-50 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {values.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-gray-500">
              Question
            </h3>

            <p className="whitespace-pre-wrap text-base leading-7 text-gray-900">
              {values.questionText}
            </p>
          </div>

          {/* Options */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-gray-500">
              Answer Options
            </h3>

            <div className="space-y-3">
              {values.answerOptions.map((option) => {
                const isCorrect =
                  values.correctAnswer === option.key

                return (
                  <div
                    key={option.key}
                    className={`flex items-start gap-3 rounded-lg border p-4 ${
                      isCorrect
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                        isCorrect
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {option.key}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {option.text}
                      </p>
                    </div>

                    {isCorrect && (
                      <span className="rounded-full bg-green-600 px-2.5 py-1 text-xs font-medium text-white">
                        Correct
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-500">
              Explanation
            </h3>

            <div className="space-y-4 rounded-lg bg-gray-50 p-4">
              <div>
                <p className="mb-1 text-sm font-semibold text-gray-900">
                  Summary
                </p>

                <p className="text-sm leading-6 text-gray-600">
                  {values.explanation.summary}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold text-gray-900">
                  Detail
                </p>

                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                  {values.explanation.detail}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold text-gray-900">
                  Tips
                </p>

                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                  {values.explanation.tips}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuestionPreviewModal