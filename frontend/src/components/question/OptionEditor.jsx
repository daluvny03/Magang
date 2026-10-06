import { CircleCheck } from 'lucide-react'
import Input from '../ui/Input'
import ImageInput from './ImageInput'

function OptionEditor({ options, correctAnswer, onChange, onCorrectChange, error }) {
  const update = (key, changes) =>
    onChange(options.map((o) => (o.key === key ? { ...o, ...changes } : o)))

  return (
    <div className="space-y-3">
      {options.map((o) => {
        const isCorrect = correctAnswer === o.key

        return (
          <div
            key={o.key}
            className={`flex items-start gap-3 rounded-lg border p-3 ${
              isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-200'
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                isCorrect ? 'bg-green-600 text-white' : 'bg-primary-50 text-primary-700'
              }`}
            >
              {o.key}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <Input
                value={o.text || ''}
                onChange={(e) => update(o.key, { text: e.target.value })}
                placeholder={`Option ${o.key}`}
              />
              <ImageInput
                image={o.image}
                file={o.imageFile}
                removed={o.removeImage}
                onPick={(file) => update(o.key, { imageFile: file, removeImage: false })}
                onRemove={() =>
                  update(o.key, { imageFile: null, removeImage: Boolean(o.image) })
                }
              />
            </div>

            <button
              type="button"
              onClick={() => onCorrectChange(o.key)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                isCorrect
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-700'
              }`}
            >
              <CircleCheck size={15} />
              {isCorrect ? 'Correct' : 'Set Correct'}
            </button>
          </div>
        )
      })}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default OptionEditor