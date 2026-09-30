import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import QuestionPreviewModal from './QuestionPreviewModal'

import OptionEditor from './OptionEditor'
import {
    DEFAULT_ANSWER_OPTIONS,
    DEFAULT_EXPLANATION,
    DIFFICULTY_OPTIONS,
} from '../../constants/question'

const questionSchema = z
    .object({
        categoryId: z.string().min(1, 'Category is required'),

        questionText: z
            .string()
            .trim()
            .min(1, 'Question is required'),

        answerOptions: z
            .array(
                z.object({
                    key: z.string(),
                    text: z.string(),
                }),
            )
            .length(5, 'Five answer options are required')
            .refine(
                (options) =>
                    options.every(
                        (option) => option.text.trim().length > 0,
                    ),
                {
                    message: 'All answer options are required',
                },
            ),

        correctAnswer: z
            .string()
            .min(1, 'Correct answer is required'),

        explanation: z.object({
            summary: z
                .string()
                .trim()
                .min(1, 'Summary is required'),

            detail: z
                .string()
                .trim()
                .min(1, 'Detail is required'),

            tips: z
                .string()
                .trim()
                .min(1, 'Tips is required'),
        }),

        score: z.preprocess(
            (value) => {
                if (value === '' || value === null || value === undefined) {
                    return undefined
                }

                return Number(value)
            },
            z
                .number({
                    required_error: 'Score is required',
                    invalid_type_error: 'Score must be a number',
                })
                .min(0, 'Score must be at least 0'),
        ),

        difficulty: z.coerce
            .number({
                invalid_type_error: 'Difficulty is required',
            })
            .int('Difficulty must be an integer')
            .min(1, 'Invalid difficulty')
            .max(3, 'Invalid difficulty'),

        isActive: z.boolean(),
    })
    .superRefine((data, ctx) => {
        // --------------------------------
        // Duplicate answer option
        // --------------------------------

        const normalizedOptions = data.answerOptions
            .map((option) => option.text.trim().toLowerCase())
            .filter(Boolean)

        const uniqueOptions = new Set(normalizedOptions)

        if (normalizedOptions.length !== uniqueOptions.size) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['answerOptions'],
                message: 'Answer options must not contain duplicates',
            })
        }

        // --------------------------------
        // Correct answer validation
        // --------------------------------

        const validAnswerKeys = data.answerOptions.map(
            (option) => option.key,
        )

        if (
            data.correctAnswer &&
            !validAnswerKeys.includes(data.correctAnswer)
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['correctAnswer'],
                message: 'Correct answer must match one of the answer options',
            })
        }
    })

const emptyValues = {
    categoryId: '',
    questionText: '',
    answerOptions: DEFAULT_ANSWER_OPTIONS,
    correctAnswer: '',
    explanation: DEFAULT_EXPLANATION,
    score: 0,
    difficulty: 2,
    isActive: true,
}

function QuestionFormModal({
    isOpen,
    mode,
    question,
    categories,
    isSubmitting,
    serverErrors = {},
    onClose,
    onSubmit,
}) {
    const isEdit = mode === 'edit'
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
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
        defaultValues: emptyValues,
    })

    const answerOptions = watch('answerOptions')
    const correctAnswer = watch('correctAnswer')

    useEffect(() => {
        if (!isOpen) {
            return
        }

        if (isEdit && question) {
            const normalizedOptions =
                Array.isArray(question.answerOptions) &&
                    question.answerOptions.length > 0
                    ? question.answerOptions.map((option, index) => ({
                        key:
                            option.key ||
                            String.fromCharCode(65 + index),
                        text: option.text || '',
                    }))
                    : DEFAULT_ANSWER_OPTIONS

            const normalizedExplanation = {
                summary: question.explanation?.summary || '',
                detail: question.explanation?.detail || '',
                tips: question.explanation?.tips || '',
            }

            reset({
                categoryId: String(
                    question.categoryId ??
                    question.category?.id ??
                    '',
                ),

                questionText: question.questionText || '',

                answerOptions: normalizedOptions,

                correctAnswer: question.correctAnswer || '',

                explanation: normalizedExplanation,

                score: Number(question.score ?? 0),

                difficulty: Number(
                    question.difficulty ?? 2,
                ),
                isActive: Boolean(question.isActive),
            })
        } else {
            reset({
                ...emptyValues,
                answerOptions: DEFAULT_ANSWER_OPTIONS.map(
                    (option) => ({
                        ...option,
                    }),
                ),
                explanation: {
                    ...DEFAULT_EXPLANATION,
                },
            })
        }
    }, [isOpen, isEdit, question, reset])

    if (!isOpen) {
        return null
    }

    const handleFormSubmit = (values) => {
        onSubmit(values)
    }

    const handleOptionsChange = (options) => {
        setValue('answerOptions', options, {
            shouldDirty: true,
            shouldValidate: true,
        })
    }

    const handleCorrectAnswerChange = (value) => {
        setValue('correctAnswer', value, {
            shouldDirty: true,
            shouldValidate: true,
        })
    }

    const handlePreview = async () => {
        const isValid = await trigger(undefined, {
            shouldFocus: true,
        })

        if (!isValid) {
            return
        }

        const values = getValues()

        setPreviewValues(values)
        setIsPreviewOpen(true)
    }

    const getServerError = (field) => serverErrors[field]

    const questionError =
        errors.questionText?.message ||
        getServerError('questionText')

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {isEdit
                                ? 'Edit Question'
                                : 'Add Question'}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {isEdit
                                ? 'Update question data and answer.'
                                : 'Create a new question and configure its answer.'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="overflow-y-auto"
                >
                    <div className="space-y-6 p-6">
                        {/* General Server Error */}
                        {serverErrors.general && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {serverErrors.general}
                            </div>
                        )}

                        {/* Category */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Category
                            </label>

                            <select
                                {...register('categoryId')}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">
                                    Select category
                                </option>

                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            {(errors.categoryId ||
                                getServerError('categoryId')) && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.categoryId?.message ||
                                            getServerError('categoryId')}
                                    </p>
                                )}
                        </div>

                        {/* Question */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Question
                            </label>

                            <input
                                {...register('questionText')}
                                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${questionError
                                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                    }`}
                            />

                            {questionError && (
                                <p className="mt-1 text-sm text-red-600">
                                    {questionError}
                                </p>
                            )}
                        </div>

                        {/* Options */}
                        <div>
                            <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Answer Options
                                </label>

                                <p className="mt-1 text-xs text-gray-500">
                                    Fill all options and select one correct answer.
                                </p>
                            </div>

                            <OptionEditor
                                options={answerOptions}
                                correctAnswer={correctAnswer}
                                onChange={handleOptionsChange}
                                onCorrectChange={
                                    handleCorrectAnswerChange
                                }
                                error={
                                    errors.answerOptions?.message ||
                                    getServerError('answerOptions')
                                }
                            />

                            {(errors.correctAnswer ||
                                getServerError('correctAnswer')) && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.correctAnswer?.message ||
                                            getServerError('correctAnswer')}
                                    </p>
                                )}
                        </div>

                        {/* Explanation */}
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Explanation
                                </label>

                                <p className="text-xs text-gray-500">
                                    Provide a summary, detailed explanation,
                                    and useful tips for the question.
                                </p>
                            </div>

                            {/* Summary */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Summary
                                </label>

                                <textarea
                                    {...register('explanation.summary')}
                                    rows={3}
                                    placeholder="Short explanation..."
                                    className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                {(errors.explanation?.summary ||
                                    getServerError(
                                        'explanation.summary',
                                    ) ||
                                    getServerError('explanation')) && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.explanation?.summary?.message ||
                                                getServerError(
                                                    'explanation.summary',
                                                ) ||
                                                getServerError('explanation')}
                                        </p>
                                    )}
                            </div>

                            {/* Detail */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Detail
                                </label>

                                <textarea
                                    {...register('explanation.detail')}
                                    rows={5}
                                    placeholder="Detailed explanation..."
                                    className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                {errors.explanation?.detail && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.explanation.detail.message}
                                    </p>
                                )}
                            </div>

                            {/* Tips */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Tips
                                </label>

                                <textarea
                                    {...register('explanation.tips')}
                                    rows={3}
                                    placeholder="Useful tips for answering..."
                                    className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                {errors.explanation?.tips && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.explanation.tips.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Score + Difficulty */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Score */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Score
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    {...register('score')}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                {(errors.score ||
                                    getServerError('score')) && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.score?.message ||
                                                getServerError('score')}
                                        </p>
                                    )}
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Difficulty
                                </label>

                                <select
                                    {...register('difficulty', {
                                        valueAsNumber: true,
                                    })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    {DIFFICULTY_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                {(errors.difficulty ||
                                    getServerError('difficulty')) && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.difficulty?.message ||
                                                getServerError('difficulty')}
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={handlePreview}
                            disabled={isSubmitting}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Preview
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting
                                ? 'Saving...'
                                : isEdit
                                    ? 'Update Question'
                                    : 'Create Question'}
                        </button>
                    </div>
                </form>
            </div>
            <QuestionPreviewModal
                isOpen={isPreviewOpen}
                values={previewValues}
                categoryName={
                    categories.find(
                        (category) =>
                            String(category.id) ===
                            String(previewValues?.categoryId),
                    )?.name
                }
                onClose={() => setIsPreviewOpen(false)}
            />
        </div>
    )
}

export default QuestionFormModal