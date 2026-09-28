import { CircleCheck } from 'lucide-react'

function OptionEditor({
  options,
  correctAnswer,
  onChange,
  onCorrectChange,
  error,
}) {
  const handleOptionChange = (key, value) => {
    const updatedOptions = options.map((option) =>
      option.key === key
        ? {
            ...option,
            text: value,
          }
        : option,
    )

    onChange(updatedOptions)
  }

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isCorrect = correctAnswer === option.key

        return (
          <div
            key={option.key}
            className={`rounded-lg border p-3 ${
              isCorrect
                ? 'border-green-300 bg-green-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">
                {option.key}
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  value={option.text}
                  onChange={(event) =>
                    handleOptionChange(
                      option.key,
                      event.target.value,
                    )
                  }
                  placeholder={`Option ${option.key}`}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="button"
                onClick={() => onCorrectChange(option.key)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  isCorrect
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CircleCheck size={16} />

                {isCorrect ? 'Correct' : 'Set Correct'}
              </button>
            </div>
          </div>
        )
      })}

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default OptionEditor