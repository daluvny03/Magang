import {
    useNavigate,
    useParams,
} from 'react-router-dom'

import {
    useEffect,
    useRef,
    useState,
} from 'react'

import {
    useAttemptQuestions,
} from '../hooks/useAttemptQuestions'
import {
    useSaveAttemptAnswer,
} from '../hooks/useSaveAttemptAnswer'
import {
    useAttemptTimer,
} from '../hooks/useAttemptTimer'
import {
    useSaveQuestionProgress,
} from '../hooks/useSaveQuestionProgress'
import {
    useUpdateDoubtful,
} from '../hooks/useUpdateDoubtful'
import {
    useFinishAttempt,
} from '../hooks/useFinishAttempt'

import CatHeader from '../components/cat/CatHeader'
import QuestionPanel from '../components/cat/QuestionPanel'
import CatSidebar from '../components/cat/CatSidebar'
import CatFooter from '../components/cat/CatFooter'
import FinishConfirmModal from '../components/cat/FinishConfirmModal'

function CatExamPage() {
    const navigate = useNavigate()

    const finishAttemptMutation =
        useFinishAttempt()

    const autoFinishTriggeredRef =
        useRef(false)
    const { attemptId } = useParams()

    const [currentQuestionIndex, setCurrentQuestionIndex] =
        useState(0)

    const [selectedAnswers, setSelectedAnswers] =
        useState({})

    const [doubtfulQuestions, setDoubtfulQuestions] =
        useState({})
    const [
        isFinishModalOpen,
        setIsFinishModalOpen,
    ] = useState(false)

    const saveAnswerMutation =
        useSaveAttemptAnswer()

    const saveProgressMutation =
        useSaveQuestionProgress()

    const questionStartedAtRef =
        useRef(null)

    const doubtfulMutation =
        useUpdateDoubtful()

    const {
        data,
        isLoading,
        isError,
        error,
    } = useAttemptQuestions(attemptId)

    const questions =
        data?.data?.questions ?? []

    const attempt =
        data?.data?.attempt

    const {
        formattedTime,
        remainingSeconds,
        isExpired,
    } = useAttemptTimer(
        attempt?.expiresAt
    )

    const currentQuestion =
        questions[currentQuestionIndex]

    const currentQuestionId =
        currentQuestion?.id

    useEffect(() => {
        if (!currentQuestionId) {
            return
        }

        questionStartedAtRef.current =
            Date.now()
    }, [currentQuestionId])

    const progressSavingRef =
        useRef(false)

    useEffect(() => {
        if (!currentQuestionId) {
            return
        }

        const intervalId = setInterval(
            async () => {
                if (
                    !currentQuestion ||
                    !questionStartedAtRef.current ||
                    progressSavingRef.current ||
                    isExpired
                ) {
                    return
                }

                progressSavingRef.current = true

                const now = Date.now()

                const durationSeconds =
                    Math.floor(
                        (
                            now -
                            questionStartedAtRef.current
                        ) / 1000
                    )

                questionStartedAtRef.current =
                    now

                try {
                    if (durationSeconds > 0) {
                        await saveProgressMutation.mutateAsync({
                            attemptId,
                            questionId:
                                currentQuestionId,
                            durationSeconds,
                        })
                    }
                } catch (error) {
                    console.error(
                        'Failed to checkpoint question progress:',
                        error
                    )
                } finally {
                    progressSavingRef.current =
                        false
                }
            },
            30000
        )

        return () => {
            clearInterval(intervalId)
        }
    }, [
        attemptId,
        currentQuestionId,
    ])

    useEffect(() => {
        if (
            !attempt ||
            !isExpired ||
            autoFinishTriggeredRef.current
        ) {
            return
        }

        autoFinishTriggeredRef.current =
            true

        const finishExpiredAttempt =
            async () => {
                try {
                    await finishAttemptMutation.mutateAsync({
                        attemptId,
                    })

                    navigate(
                        '/user/tryouts', //route untuk menampilkan daftar tryout yang sudah selesai seharusnya ke halaman hasil tryout
                        {
                            replace: true,
                        }
                    )
                } catch (error) {
                    console.error(
                        'Failed to auto-finish attempt:',
                        error
                    )

                    autoFinishTriggeredRef.current =
                        false
                }
            }

        finishExpiredAttempt()
    }, [
        attempt,
        attemptId,
        isExpired,
        navigate,
    ])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-sm text-gray-500">
                    Memuat soal...
                </p>
            </div>
        )
    }

    if (isError) {
        const status =
            error?.response?.status

        const code =
            error?.response?.data?.code

        let message =
            'Sesi tryout tidak tersedia atau tidak dapat diakses.'

        if (
            status === 409 &&
            code === 'ATTEMPT_COMPLETED'
        ) {
            message =
                'Tryout ini sudah selesai.'
        }

        if (
            status === 409 &&
            code === 'ATTEMPT_EXPIRED'
        ) {
            message =
                'Waktu pengerjaan tryout telah habis.'
        }

        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
                <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                    <h1 className="text-lg font-semibold text-gray-900">
                        Tryout Tidak Dapat Dibuka
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        {message}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/user/tryouts')
                        }
                        className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        Kembali ke Tryout
                    </button>
                </div>
            </div>
        )
    }

    const totalQuestions = questions.length

    const isFirstQuestion =
        currentQuestionIndex === 0

    const isLastQuestion =
        currentQuestionIndex ===
        totalQuestions - 1

    const selectedAnswer =
        selectedAnswers[currentQuestion?.id] ??
        currentQuestion?.selectedAnswer ??
        null

    const saveCurrentQuestionProgress =
        async () => {
            if (
                !currentQuestion ||
                !questionStartedAtRef.current ||
                progressSavingRef.current ||
                isExpired
            ) {
                return
            }

            progressSavingRef.current = true

            const now = Date.now()

            const durationSeconds =
                Math.floor(
                    (
                        now -
                        questionStartedAtRef.current
                    ) / 1000
                )

            questionStartedAtRef.current =
                now

            try {
                if (durationSeconds > 0) {
                    await saveProgressMutation.mutateAsync({
                        attemptId,
                        questionId:
                            currentQuestion.id,
                        durationSeconds,
                    })
                }
            } catch (error) {
                console.error(
                    'Failed to save question progress:',
                    error
                )
            } finally {
                progressSavingRef.current = false
            }
        }

    const handlePreviousQuestion =
        async () => {
            if (isFirstQuestion) {
                return
            }

            await saveCurrentQuestionProgress()

            setCurrentQuestionIndex(
                (current) =>
                    Math.max(current - 1, 0)
            )
        }

    const handleNextQuestion =
        async () => {
            if (isLastQuestion) {
                return
            }

            await saveCurrentQuestionProgress()

            setCurrentQuestionIndex(
                (current) =>
                    Math.min(
                        current + 1,
                        totalQuestions - 1
                    )
            )
        }

    const handleSelectAnswer = async (
        answerKey
    ) => {
        if (!currentQuestion) return

        const questionId =
            currentQuestion.id

        const previousAnswer =
            selectedAnswers[questionId] ??
            currentQuestion.selectedAnswer ??
            null

        setSelectedAnswers((current) => ({
            ...current,
            [questionId]: answerKey,
        }))

        try {
            await saveAnswerMutation.mutateAsync({
                attemptId,
                questionId,
                selectedAnswer: answerKey,
            })
        } catch (error) {
            console.error(
                'Failed to save answer:',
                error
            )

            setSelectedAnswers((current) => {
                const next = {
                    ...current,
                }

                if (previousAnswer) {
                    next[questionId] =
                        previousAnswer
                } else {
                    delete next[questionId]
                }

                return next
            })
        }
    }

    const handleQuestionSelect =
        async (questionIndex) => {
            if (
                questionIndex ===
                currentQuestionIndex
            ) {
                return
            }

            await saveCurrentQuestionProgress()

            setCurrentQuestionIndex(
                questionIndex
            )
        }

    const isCurrentQuestionDoubtful =
        doubtfulQuestions[
        currentQuestion?.id
        ] ??
        currentQuestion?.isDoubtful ??
        false

    const handleToggleDoubtful =
        async () => {
            if (!currentQuestion) {
                return
            }

            const questionId =
                currentQuestion.id

            const previousValue =
                doubtfulQuestions[
                questionId
                ] ??
                currentQuestion.isDoubtful ??
                false

            const nextValue =
                !previousValue

            setDoubtfulQuestions(
                (current) => ({
                    ...current,
                    [questionId]:
                        nextValue,
                })
            )

            try {
                await doubtfulMutation.mutateAsync({
                    attemptId,
                    questionId,
                    isDoubtful:
                        nextValue,
                })
            } catch (error) {
                setDoubtfulQuestions(
                    (current) => ({
                        ...current,
                        [questionId]:
                            previousValue,
                    })
                )

                console.error(
                    'Failed to update doubtful status:',
                    error
                )
            }
        }

    const answeredCount =
        questions.filter((question) => {
            const answer =
                selectedAnswers[question.id] ??
                question.selectedAnswer

            return Boolean(answer)
        }).length

    const unansweredCount =
        Math.max(
            totalQuestions -
            answeredCount,
            0
        )

    const doubtfulCount =
        questions.filter((question) => {
            const isDoubtful =
                doubtfulQuestions[
                question.id
                ] ??
                question.isDoubtful ??
                false

            return isDoubtful
        }).length

    const handleFinishAttempt =
        async () => {
            if (
                finishAttemptMutation.isPending
            ) {
                return
            }

            try {
                await saveCurrentQuestionProgress()

                await finishAttemptMutation.mutateAsync({
                    attemptId,
                })

                setIsFinishModalOpen(false)

                navigate(
                    '/user/tryouts',
                    {
                        replace: true,
                    }
                )
            } catch (error) {
                console.error(
                    'Failed to finish attempt:',
                    error
                )
            }
        }

    if (!currentQuestion) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
                <div className="text-center">
                    <h1 className="font-semibold text-gray-900">
                        Soal Tidak Tersedia
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Tryout ini belum memiliki soal
                        yang dapat dikerjakan.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <CatHeader
                formattedTime={formattedTime}
                isFinishing={
                    finishAttemptMutation.isPending
                }
                onFinish={() =>
                    setIsFinishModalOpen(true)
                }
            />
            <FinishConfirmModal
                isOpen={isFinishModalOpen}
                answeredCount={answeredCount}
                unansweredCount={unansweredCount}
                doubtfulCount={doubtfulCount}
                isSubmitting={
                    finishAttemptMutation.isPending
                }
                onClose={() =>
                    setIsFinishModalOpen(false)
                }
                onConfirm={
                    handleFinishAttempt
                }
            />

            <main className="mx-auto max-w-[1600px] px-4 py-5 lg:px-6">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <QuestionPanel
                        question={currentQuestion}
                        currentNumber={
                            currentQuestionIndex + 1
                        }
                        totalQuestions={totalQuestions}
                        selectedAnswer={selectedAnswer}
                        onSelectAnswer={handleSelectAnswer}
                        isSavingAnswer={
                            saveAnswerMutation.isPending
                        }
                    />

                    <CatSidebar
                        questions={questions}
                        currentQuestionIndex={
                            currentQuestionIndex
                        }
                        selectedAnswers={
                            selectedAnswers
                        }
                        doubtfulQuestions={
                            doubtfulQuestions
                        }
                        answeredCount={
                            answeredCount
                        }
                        doubtfulCount={
                            doubtfulCount
                        }
                        isSavingProgress={
                            saveProgressMutation.isPending
                        }
                        onQuestionSelect={
                            handleQuestionSelect
                        }
                    />
                </div>
            </main>

            <CatFooter
                isFirstQuestion={
                    isFirstQuestion
                }
                isLastQuestion={
                    isLastQuestion
                }
                isDoubtful={
                    isCurrentQuestionDoubtful
                }
                isSavingProgress={
                    saveProgressMutation.isPending
                }
                onPrevious={
                    handlePreviousQuestion
                }
                onNext={
                    handleNextQuestion
                }
                onToggleDoubtful={
                    handleToggleDoubtful
                }
            />
        </div>
    )
}

export default CatExamPage