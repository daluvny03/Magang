import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { useDebounce } from '../../../hooks/useDebounce'

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

import QuestionImportModal from '../../../components/question-import/QuestionImportModal'

function QuestionPage() {
    const [page, setPage] = useState(1)
    const [searchInput, setSearchInput] = useState('')
    const search = useDebounce(searchInput.trim())
    const [categoryId, setCategoryId] = useState('')
    const [isActive, setIsActive] = useState('true')
    const [isImportOpen, setIsImportOpen] = useState(false)

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

    const handleSearch = (e) => {
        setSearchInput(e.target.value)
        setPage(1)
    }

    const handleResetFilter = () => {
        setSearchInput('')
        setCategoryId('')
        setIsActive('true')
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

    const normalizePayload = (values) => {
        return {
            categoryId: Number(values.categoryId),

            questionText:
                values.questionText.trim(),

            questionImage:
                values.questionImage || null,

            questionImageFile:
                values.questionImageFile || null,

            removeQuestionImage:
                Boolean(
                    values.removeQuestionImage,
                ),

            answerOptions:
                values.answerOptions.map(
                    (option) => ({
                        key: option.key,

                        text:
                            option.text?.trim() ||
                            '',

                        image:
                            option.image || null,

                        imageFile:
                            option.imageFile ||
                            null,

                        removeImage:
                            Boolean(
                                option.removeImage,
                            ),
                    }),
                ),

            correctAnswer:
                values.correctAnswer,

            explanation: {
                summary:
                    values.explanation.summary.trim(),

                detail:
                    values.explanation.detail.trim(),

                tips:
                    values.explanation.tips.trim(),
            },

            score: Number(values.score),

            difficulty: Number(
                values.difficulty,
            ),

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
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Questions</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage question bank and answer keys.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                        Import Questions
                    </Button>
                    <Button onClick={handleOpenCreate}>
                        <Plus size={18} />
                        Add Question
                    </Button>
                </div>
            </div>

            <Card className="space-y-4">
                <QuestionFilters
                    search={searchInput}
                    categoryId={categoryId}
                    isActive={isActive}
                    categories={categories}
                    onSearchChange={handleSearch}
                    onCategoryChange={handleCategoryChange}
                    onStatusChange={handleStatusChange}
                    onReset={handleResetFilter}
                />

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
                            page={page}
                            totalPages={meta.totalPages}
                            total={meta.total}
                            limit={limit}
                            onPageChange={setPage}
                        />
                    </>
                )}
            </Card>

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
            <QuestionImportModal
                isOpen={isImportOpen}
                onClose={() =>
                    setIsImportOpen(false)
                }
                onImportSuccess={() => {
                    setPage(1)
                    refetch()
                }}
            />
        </div>
    )
}

export default QuestionPage