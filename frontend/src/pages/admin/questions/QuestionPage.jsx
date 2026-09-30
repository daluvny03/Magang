import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import QuestionDeleteDialog from '../../../components/question/QuestionDeleteDialog'
import QuestionFilters from '../../../components/question/QuestionFilters'
import QuestionFormModal from '../../../components/question/QuestionFormModal'
import QuestionTable from '../../../components/question/QuestionTable'

import EmptyState from '../../../components/common/EmptyState'
import ErrorState from '../../../components/common/ErrorState'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import Pagination from '../../../components/common/Pagination'

import {
    useCategories,
} from '../../../hooks/useCategories'

import {
    useCreateQuestion,
    useDeleteQuestion,
    useQuestions,
    useUpdateQuestion,
} from '../../../hooks/useQuestions'

function QuestionPage() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [isActive, setIsActive] = useState('true')

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [formMode, setFormMode] = useState('create')
    const [selectedQuestion, setSelectedQuestion] =
        useState(null)

    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [questionToDelete, setQuestionToDelete] =
        useState(null)

    const limit = 20

    const questionParams = useMemo(
        () => ({
            page,
            limit,

            ...(search.trim()
                ? {
                    search: search.trim(),
                }
                : {}),

            ...(categoryId
                ? {
                    categoryId,
                }
                : {}),

            ...(isActive !== ''
                ? {
                    isActive,
                }
                : {}),
        }),
        [page, search, categoryId, isActive],
    )

    const {
        data: questionResponse,
        isLoading,
        isError,
        refetch,
    } = useQuestions(questionParams)

    const {
        data: categoryResponse,
        isLoading: isCategoriesLoading,
    } = useCategories({
        page: 1,
        limit: 100,
    })

    const createMutation = useCreateQuestion()
    const updateMutation = useUpdateQuestion()
    const deleteMutation = useDeleteQuestion()

    const questions = questionResponse?.data || []

    const meta = questionResponse?.meta || {
        page: 1,
        limit,
        total: 0,
        totalPages: 0,
    }

    const categories = categoryResponse?.data || []

    const isSaving =
        createMutation.isPending ||
        updateMutation.isPending

    const handleSearch = (event) => {
        setSearch(event.target.value)
        setPage(1)
    }

    const handleCategoryChange = (event) => {
        setCategoryId(event.target.value)
        setPage(1)
    }

    const handleOpenCreate = () => {
        createMutation.reset()
        updateMutation.reset()

        setSelectedQuestion(null)
        setFormMode('create')
        setIsFormOpen(true)
    }
    const handleOpenEdit = (question) => {
        createMutation.reset()
        updateMutation.reset()

        setSelectedQuestion(question)
        setFormMode('edit')
        setIsFormOpen(true)
    }

    const handleCloseForm = () => {
        if (isSaving) {
            return
        }

        setIsFormOpen(false)
        setSelectedQuestion(null)
    }

    const handleStatusChange = (event) => {
        setIsActive(event.target.value)
        setPage(1)
    }

    const handleResetFilter = () => {
        setSearch('')
        setCategoryId('')
        setIsActive('true')
        setPage(1)
    }

    const normalizePayload = (values) => {
        return {
            categoryId: Number(values.categoryId),

            questionText: values.questionText.trim(),

            answerOptions: values.answerOptions.map(
                (option) => ({
                    key: option.key,
                    text: option.text.trim(),
                }),
            ),

            correctAnswer: values.correctAnswer,

            explanation: {
                summary: values.explanation.summary.trim(),
                detail: values.explanation.detail.trim(),
                tips: values.explanation.tips.trim(),
            },

            score: Number(values.score),

            difficulty: Number(values.difficulty),
            isActive: values.isActive,
        }
    }

    const handleSubmitQuestion = async (values) => {
        const payload = normalizePayload(values)

        try {
            if (formMode === 'edit') {
                await updateMutation.mutateAsync({
                    id: selectedQuestion.id,
                    payload,
                })

                toast.success('Question updated successfully')
            } else {
                await createMutation.mutateAsync(payload)

                toast.success('Question created successfully')
            }

            handleCloseForm()
        } catch (error) {
            const message =
                error.response?.data?.message ||
                'Failed to save question'

            toast.error(message)
        }
    }

    const getMutationServerErrors = () => {
        const mutation =
            formMode === 'edit'
                ? updateMutation
                : createMutation

        const response = mutation.error?.response
        const data = response?.data

        if (!data) {
            return {}
        }

        const errors = {}

        if (Array.isArray(data.errors)) {
            data.errors.forEach((item) => {
                if (item.field && item.message) {
                    errors[item.field] = item.message
                } else if (item.message && !errors.general) {
                    errors.general = item.message
                }
            })
        }

        if (
            response?.status === 409 &&
            data.message &&
            !errors.general
        ) {
            errors.general = data.message
        }

        return errors
    }

    const handleOpenDelete = (question) => {
        setQuestionToDelete(question)
        setIsDeleteOpen(true)
    }

    const handleCloseDelete = () => {
        if (deleteMutation.isPending) {
            return
        }

        setIsDeleteOpen(false)
        setQuestionToDelete(null)
    }

    const handleConfirmDelete = async () => {
        if (!questionToDelete) {
            return
        }

        try {
            await deleteMutation.mutateAsync(
                questionToDelete.id,
            )

            toast.success('Question deleted successfully')

            setIsDeleteOpen(false)
            setQuestionToDelete(null)

            if (questions.length === 1 && page > 1) {
                setPage((currentPage) => currentPage - 1)
            }
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                'Failed to delete question'

            toast.error(message)
        }
    }

    if (isLoading && !questionResponse) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <LoadingSpinner />
            </div>
        )
    }

    if (isError) {
        return (
            <ErrorState
                title="Failed to load questions"
                message="Unable to retrieve question data."
                onRetry={refetch}
            />
        )
    }

    const serverErrors = getMutationServerErrors()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Questions
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage question bank and answer keys.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus size={18} />
                    Add Question
                </button>
            </div>

            {/* Filters */}
            <QuestionFilters
                search={search}
                categoryId={categoryId}
                isActive={isActive}
                categories={categories}
                onSearchChange={handleSearch}
                onCategoryChange={handleCategoryChange}
                onStatusChange={handleStatusChange}
                onReset={handleResetFilter}
            />

            {/* Category loading */}
            {isCategoriesLoading && (
                <p className="text-sm text-gray-500">
                    Loading categories...
                </p>
            )}

            {/* Table */}
            {questions.length === 0 ? (
                <EmptyState
                    title="No questions found"
                    message={
                        search || categoryId
                            ? 'No questions match the selected filters.'
                            : 'There are no questions yet.'
                    }
                />
            ) : (
                <>
                    <QuestionTable
                        questions={questions}
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                    />

                    <Pagination
                        page={meta.page}
                        totalPages={meta.totalPages}
                        onPageChange={setPage}
                    />
                </>
            )}

            {/* Create / Edit */}
            <QuestionFormModal
                isOpen={isFormOpen}
                mode={formMode}
                question={selectedQuestion}
                categories={categories}
                isSubmitting={isSaving}
                serverErrors={serverErrors}
                onClose={handleCloseForm}
                onSubmit={handleSubmitQuestion}
            />

            {/* Delete */}
            <QuestionDeleteDialog
                isOpen={isDeleteOpen}
                question={questionToDelete}
                isDeleting={deleteMutation.isPending}
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
            />
        </div>
    )
}

export default QuestionPage