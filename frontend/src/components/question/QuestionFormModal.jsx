import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import Alert from '../ui/Alert'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import ImageInput from './ImageInput'
import OptionEditor from './OptionEditor'
import QuestionPreviewModal from './QuestionPreviewModal'
import {
  DEFAULT_ANSWER_OPTIONS,
  DEFAULT_EXPLANATION,
  DIFFICULTY_OPTIONS,
} from '../../constants/question'

const answerOptionSchema = z.object({
  key: z.string(),
  text: z.string(),
  image: z.string().nullable().optional(),
  imageFile: z.any().nullable().optional(),
  removeImage: z.boolean().optional().default(false),
})

const required = (label) => z.string().trim().min(1, `${label} is required`)

const questionSchema = z
  .object({
    categoryId: z.string().min(1, 'Category is required'),
    questionText: required('Question'),
    questionImage: z.string().nullable().optional(),
    questionImageFile: z.any().nullable().optional(),
    removeQuestionImage: z.boolean().optional().default(false),
    answerOptions: z
      .array(answerOptionSchema)
      .length(5, 'Five answer options are required')
      .refine(
        (options) =>
          options.every(
            (o) =>
              o.text.trim().length > 0 ||
              (Boolean(o.image) && !o.removeImage) ||
              Boolean(o.imageFile)
          ),
        { message: 'Each answer option must contain text or an image' }
      ),
    correctAnswer: z.string().min(1, 'Correct answer is required'),
    explanation: z.object({
      summary: required('Summary'),
      detail: required('Detail'),
      tips: required('Tips'),
    }),
    score: z.coerce
      .number({ invalid_type_error: 'Score must be a number' })
      .min(0, 'Score must be at least 0'),
    difficulty: z.coerce
      .number({ invalid_type_error: 'Difficulty is required' })
      .int('Difficulty must be an integer')
      .min(1, 'Invalid difficulty')
      .max(3, 'Invalid difficulty'),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    // Opsi hanya-gambar diabaikan karena tidak punya teks untuk dibandingkan
    const texts = data.answerOptions
      .map((o) => o.text.trim().toLowerCase())
      .filter(Boolean)

    if (texts.length !== new Set(texts).size) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['answerOptions'],
        message: 'Answer options must not contain duplicates',
      })
    }

    if (
      data.correctAnswer &&
      !data.answerOptions.some((o) => o.key === data.correctAnswer)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctAnswer'],
        message: 'Correct answer must match one of the answer options',
      })
    }
  })

const createEmptyOptions = () =>
  DEFAULT_ANSWER_OPTIONS.map((o) => ({
    ...o,
    image: null,
    imageFile: null,
    removeImage: false,
  }))

const createEmptyValues = () => ({
  categoryId: '',
  questionText: '',
  questionImage: null,
  questionImageFile: null,
  removeQuestionImage: false,
  answerOptions: createEmptyOptions(),
  correctAnswer: '',
  explanation: { ...DEFAULT_EXPLANATION },
  score: 0,
  difficulty: 2,
  isActive: true,
})

const normalizeQuestionForForm = (q) => ({
  categoryId: String(q.categoryId ?? q.category?.id ?? ''),
  questionText: q.questionText || '',
  questionImage: q.questionImage || null,
  questionImageFile: null,
  removeQuestionImage: false,
  answerOptions: q.answerOptions?.length
    ? q.answerOptions.map((o, i) => ({
        key: o.key || String.fromCharCode(65 + i),
        text: o.text || '',
        image: o.image || null,
        imageFile: null,
        removeImage: false,
      }))
    : createEmptyOptions(),
  correctAnswer: q.correctAnswer || '',
  explanation: {
    summary: q.explanation?.summary || '',
    detail: q.explanation?.detail || '',
    tips: q.explanation?.tips || '',
  },
  score: Number(q.score ?? 0),
  difficulty: Number(q.difficulty ?? 2),
  isActive: Boolean(q.isActive),
})

const EXPLANATION_FIELDS = [
  ['summary', 'Summary', 3, 'Short explanation...'],
  ['detail', 'Detail', 5, 'Detailed explanation...'],
  ['tips', 'Tips', 3, 'Useful tips for answering...'],
]

function QuestionFormModal({
  isOpen,
  mode,
  question,
  categories = [],
  isSubmitting = false,
  serverErrors = {},
  onClose,
  onSubmit,
}) {
  const isEdit = mode === 'edit'
  const [previewValues, setPreviewValues] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: createEmptyValues(),
  })

  const answerOptions = watch('answerOptions')
  const correctAnswer = watch('correctAnswer')
  const questionImage = watch('questionImage')
  const questionImageFile = watch('questionImageFile')
  const removeQuestionImage = watch('removeQuestionImage')

  useEffect(() => {
    if (!isOpen) return
    reset(isEdit && question ? normalizeQuestionForForm(question) : createEmptyValues())
    setPreviewValues(null)
  }, [isOpen, isEdit, question, reset])

  const set = (name, value, validate = false) =>
    setValue(name, value, { shouldDirty: true, shouldValidate: validate })

  const fieldError = (name) => errors[name]?.message || serverErrors[name]

  const handlePreview = async () => {
    if (!(await trigger(undefined, { shouldFocus: true }))) return
    setPreviewValues(getValues())
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={isSubmitting ? undefined : onClose}
        size="xl"
        title={isEdit ? 'Edit Question' : 'Add Question'}
        description={
          isEdit
            ? 'Update question data and answer.'
            : 'Create a new question and configure its answer.'
        }
        footer={
          <>
            <Button variant="outline" onClick={handlePreview} disabled={isSubmitting}>
              Preview
            </Button>
            <Button variant="soft" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" form="question-form" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Question' : 'Create Question'}
            </Button>
          </>
        }
      >
        <form
          id="question-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {serverErrors.general && <Alert tone="red">{serverErrors.general}</Alert>}

          <FormField label="Category" htmlFor="q-category" error={fieldError('categoryId')}>
            <Select
              id="q-category"
              {...register('categoryId')}
              error={fieldError('categoryId')}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Question" htmlFor="q-text" error={fieldError('questionText')}>
            <Input
              id="q-text"
              {...register('questionText')}
              error={fieldError('questionText')}
              placeholder="Enter question..."
            />
            <div className="mt-3">
              <ImageInput
                label="Add Question Image"
                previewClass="max-h-64"
                image={questionImage}
                file={questionImageFile}
                removed={removeQuestionImage}
                onPick={(file) => {
                  set('questionImageFile', file, true)
                  set('removeQuestionImage', false)
                }}
                onRemove={() => {
                  set('questionImageFile', null, true)
                  set('removeQuestionImage', Boolean(questionImage))
                }}
              />
              <p className="mt-1 text-xs text-gray-400">
                Optional. JPEG, PNG or WebP, maximum 5 MB.
              </p>
            </div>
          </FormField>

          <FormField
            label="Answer Options"
            error={fieldError('correctAnswer')}
          >
            <p className="mb-2 text-xs text-gray-400">
              Each option must contain text, an image, or both. Select one correct answer.
            </p>
            <OptionEditor
              options={answerOptions}
              correctAnswer={correctAnswer}
              onChange={(options) => set('answerOptions', options, true)}
              onCorrectChange={(key) => set('correctAnswer', key, true)}
              error={fieldError('answerOptions')}
            />
          </FormField>

          <div className="space-y-4 rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-900">Explanation</p>

            {EXPLANATION_FIELDS.map(([name, label, rows, placeholder]) => {
              const error =
                errors.explanation?.[name]?.message ||
                serverErrors[`explanation.${name}`] ||
                (name === 'summary' && serverErrors.explanation)

              return (
                <FormField key={name} label={label} htmlFor={`q-${name}`} error={error}>
                  <Textarea
                    id={`q-${name}`}
                    rows={rows}
                    {...register(`explanation.${name}`)}
                    error={error}
                    placeholder={placeholder}
                  />
                </FormField>
              )
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Score" htmlFor="q-score" error={fieldError('score')}>
              <Input
                id="q-score"
                type="number"
                min="0"
                step="0.01"
                {...register('score')}
                error={fieldError('score')}
              />
            </FormField>

            <FormField label="Difficulty" htmlFor="q-difficulty" error={fieldError('difficulty')}>
              <Select
                id="q-difficulty"
                {...register('difficulty')}
                error={fieldError('difficulty')}
              >
                {DIFFICULTY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              {...register('isActive')}
              className="h-4 w-4 accent-primary-500"
            />
            Active
          </label>
        </form>
      </Modal>

      <QuestionPreviewModal
        isOpen={Boolean(previewValues)}
        values={previewValues}
        categoryName={
          categories.find((c) => String(c.id) === String(previewValues?.categoryId))?.name
        }
        onClose={() => setPreviewValues(null)}
      />
    </>
  )
}

export default QuestionFormModal