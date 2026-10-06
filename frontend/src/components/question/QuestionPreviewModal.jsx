import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { ImagePreview } from './ImageInput'
import { DIFFICULTY_OPTIONS } from '../../constants/question'

const EXPLANATION = [
  ['summary', 'Summary'],
  ['detail', 'Detail'],
  ['tips', 'Tips'],
]

const imgClass = 'max-w-full rounded-lg border border-gray-200 object-contain'

function QuestionPreviewModal({ isOpen, values, categoryName, onClose }) {
  const difficulty = DIFFICULTY_OPTIONS.find(
    (d) => Number(d.value) === Number(values?.difficulty)
  )

  return (
    <Modal
      isOpen={isOpen && Boolean(values)}
      onClose={onClose}
      size="lg"
      title="Question Preview"
      description="Preview how this question will appear."
      footer={
        <Button variant="soft" onClick={onClose}>
          Close Preview
        </Button>
      }
    >
      {values && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {categoryName && <Badge tone="primary">{categoryName}</Badge>}
            {difficulty && <Badge>{difficulty.label}</Badge>}
            <Badge>Score: {values.score}</Badge>
            <Badge tone={values.isActive ? 'green' : 'gray'}>
              {values.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="space-y-3">
            <p className="whitespace-pre-wrap text-base leading-7 text-gray-900">
              {values.questionText}
            </p>
            <ImagePreview
              image={values.questionImage}
              file={values.questionImageFile}
              removed={values.removeQuestionImage}
              alt="Question"
              className={`max-h-80 ${imgClass}`}
            />
          </div>

          <div className="space-y-2">
            {values.answerOptions?.map((o) => {
              const isCorrect = values.correctAnswer === o.key

              return (
                <div
                  key={o.key}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                      isCorrect ? 'bg-green-600 text-white' : 'bg-primary-50 text-primary-700'
                    }`}
                  >
                    {o.key}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    {o.text?.trim() && (
                      <p className="whitespace-pre-wrap text-sm text-gray-900">{o.text}</p>
                    )}
                    <ImagePreview
                      image={o.image}
                      file={o.imageFile}
                      removed={o.removeImage}
                      alt={`Option ${o.key}`}
                      className={`max-h-48 ${imgClass}`}
                    />
                  </div>

                  {isCorrect && <Badge tone="green">Correct</Badge>}
                </div>
              )
            })}
          </div>

          <div className="space-y-4 rounded-lg bg-gray-50 p-4">
            {EXPLANATION.map(([key, label]) => (
              <div key={key}>
                <p className="mb-1 text-sm font-semibold text-gray-900">{label}</p>
                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                  {values.explanation?.[key]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}

export default QuestionPreviewModal