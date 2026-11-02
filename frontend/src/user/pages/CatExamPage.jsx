import { logRequestError } from '../../utils/log-request-error'
import { AlertTriangle, FileQuestion, Timer } from 'lucide-react'
import { toast } from 'sonner'
import {
    useNavigate,
    useParams,
} from 'react-router-dom'
import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { useAttemptQuestions } from '../hooks/useAttemptQuestions'
import { useSaveAttemptAnswer } from '../hooks/useSaveAttemptAnswer'
import { useAttemptTimer } from '../hooks/useAttemptTimer'
import { useSaveQuestionProgress } from '../hooks/useSaveQuestionProgress'
import { useUpdateDoubtful } from '../hooks/useUpdateDoubtful'
import { useFinishAttempt } from '../hooks/useFinishAttempt'
import CatHeader from '../components/cat/CatHeader'
import QuestionPanel from '../components/cat/QuestionPanel'
import CatSidebar from '../components/cat/CatSidebar'
import CatFooter from '../components/cat/CatFooter'
import CatNavigatorSheet from '../components/cat/CatNavigatorSheet'
import CatStatusScreen from '../components/cat/CatStatusScreen'
import FinishConfirmModal from '../components/cat/FinishConfirmModal'

const URGENT_THRESHOLD_SECONDS = 300

function CatExamPage() {
    const navigate = useNavigate()
    const finishAttemptMutation = useFinishAttempt()
    const autoFinishTriggeredRef = useRef(false)
    const { attemptId } = useParams()
    const questionPositionStorageKey =
        `cat-current-question:${attemptId}`
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState({})
    const [doubtfulQuestions, setDoubtfulQuestions] = useState({})
    const [isFinishModalOpen, setIsFinishModalOpen] = useState(false)
    const [isNavigatorOpen, setIsNavigatorOpen] = useState(false)
    const saveAnswerMutation = useSaveAttemptAnswer()
    const saveProgressMutation = useSaveQuestionProgress()
    const saveProgress = saveProgressMutation.mutateAsync
    const finishAttempt = finishAttemptMutation.mutateAsync
    const questionStartedAtRef = useRef(null)
    const doubtfulMutation = useUpdateDoubtful()
    const {
        data,
        isLoading,
        isError,
        error,
    } = useAttemptQuestions(attemptId)
    const questions = useMemo(() => data?.data?.questions ?? [], [data?.data?.questions])
    const attempt = data?.data?.attempt
    const {
        formattedTime,
        remainingSeconds,
        isExpired,
    } = useAttemptTimer(attempt?.expiresAt)
    const currentQuestion = questions[currentQuestionIndex]
    const currentQuestionId = currentQuestion?.id

    useEffect(() => {
        if (!currentQuestionId) {
            return
        }

        questionStartedAtRef.current = Date.now()
    }, [currentQuestionId])

    const hasRestoredQuestionRef =
        useRef(false)

    useEffect(() => {
        if (
            questions.length === 0 ||
            hasRestoredQuestionRef.current
        ) {
            return
        }

        hasRestoredQuestionRef.current = true
        const storedQuestionId =
            sessionStorage.getItem(
                questionPositionStorageKey
            )
        if (!storedQuestionId) {
            return
        }

        const restoredIndex =
            questions.findIndex(
                (question) =>
                    String(question.id) ===
                    String(storedQuestionId)
            )
        if (restoredIndex >= 0) {
            // Restore the saved sessionStorage position once after asynchronous questions load.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentQuestionIndex(
                restoredIndex
            )
        }
    }, [
        questions,
        questionPositionStorageKey,
    ])

    useEffect(() => {
        if (
            !currentQuestionId ||
            !hasRestoredQuestionRef.current
        ) {
            return
        }
        sessionStorage.setItem(
            questionPositionStorageKey,
            String(currentQuestionId)
        )
    }, [
        currentQuestionId,
        questionPositionStorageKey,
    ])

    const progressSavingRef =
        useRef(false)
    useEffect(() => {
        if (!currentQuestionId) {
            return
        }

        const intervalId = setInterval(
            async () => {
                if (
                    !currentQuestionId ||
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
                        await saveProgress({
                            attemptId,
                            questionId:
                                currentQuestionId,
                            durationSeconds,
                        })
                    }
                } catch (error) {
                    logRequestError(
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
        isExpired,
        saveProgress,
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
                    await finishAttempt({
                        attemptId,
                    })
                    sessionStorage.removeItem(
                        questionPositionStorageKey
                    )
                    navigate(`/user/results/${attemptId}`, {
                        replace: true,
                    })
                } catch (error) {
                    logRequestError(
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
        finishAttempt,
        questionPositionStorageKey,
    ])
    if (isLoading) {
        return <CatStatusScreen loading title="Memuat soal..." />
    }

    if (isError) {
        const status = error?.response?.status
        const code = error?.response?.data?.code

        let message =
            'Sesi tryout tidak tersedia atau tidak dapat diakses.'
        if (status === 409 && code === 'ATTEMPT_COMPLETED') {
            message = 'Tryout ini sudah selesai.'
        }
        if (status === 409 && code === 'ATTEMPT_EXPIRED') {
            message = 'Waktu pengerjaan tryout telah habis.'
        }

        return (
            <CatStatusScreen
                icon={AlertTriangle}
                title="Tryout Tidak Dapat Dibuka"
                message={message}
                actionLabel="Kembali ke Tryout"
                onAction={() => navigate('/user/tryouts')}
            />
        )
    }

    const totalQuestions = questions.length
    const isFirstQuestion = currentQuestionIndex === 0
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1
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
                    await saveProgress({
                        attemptId,
                        questionId:
                            currentQuestion.id,
                        durationSeconds,
                    })
                }
            } catch (error) {
                logRequestError(
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

    const handleSelectAnswer = async (answerKey) => {
        if (!currentQuestion) return

        const questionId = currentQuestion.id
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
            logRequestError('Failed to save answer:', error)
            toast.error('Jawaban gagal disimpan. Silakan pilih ulang.')
            setSelectedAnswers((current) => {
                const next = { ...current }

                if (previousAnswer) {
                    next[questionId] = previousAnswer
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
        doubtfulQuestions[currentQuestion?.id] ??
        currentQuestion?.isDoubtful ??
        false

    const handleToggleDoubtful = async () => {
        if (!currentQuestion) {
            return
        }

        const questionId = currentQuestion.id
        const previousValue =
            doubtfulQuestions[questionId] ??
            currentQuestion.isDoubtful ??
            false
        const nextValue = !previousValue
        setDoubtfulQuestions((current) => ({
            ...current,
            [questionId]: nextValue,
        }))

        try {
            await doubtfulMutation.mutateAsync({
                attemptId,
                questionId,
                isDoubtful: nextValue,
            })
        } catch (error) {
            setDoubtfulQuestions((current) => ({
                ...current,
                [questionId]: previousValue,
            }))
            logRequestError('Failed to update doubtful status:', error)
            toast.error('Status ragu-ragu gagal disimpan.')
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

    const unansweredNumbers = questions.reduce((numbers, question, index) => {
        const answer =
            selectedAnswers[question.id] ?? question.selectedAnswer

        if (!answer) numbers.push(index + 1)

        return numbers
    }, [])

    const handleExit = async () => {
        await saveCurrentQuestionProgress()
        toast.info(
            'Waktu tetap berjalan. Lanjutkan dari halaman Tryout.'
        )
        navigate('/user/tryouts')
    }

    const handleFinishAttempt = async () => {
        if (finishAttemptMutation.isPending) {
            return
        }

        try {
            await saveCurrentQuestionProgress()
            await finishAttempt({ attemptId })
            sessionStorage.removeItem(questionPositionStorageKey)
            setIsFinishModalOpen(false)
            navigate(`/user/results/${attemptId}`, { replace: true })
        } catch (error) {
            logRequestError('Failed to finish attempt:', error)
            toast.error(
                'Gagal menyelesaikan tryout. Periksa koneksi lalu coba lagi.'
            )
        }
    }


    const handleNavigatorSelect = async (questionIndex) => {
        await handleQuestionSelect(questionIndex)
        setIsNavigatorOpen(false)
    }

    const isUrgent =
        remainingSeconds > 0 &&
        remainingSeconds <= URGENT_THRESHOLD_SECONDS

    if (!currentQuestion) {
        return (
            <CatStatusScreen
                icon={FileQuestion}
                title="Soal Tidak Tersedia"
                message="Tryout ini belum memiliki soal yang dapat dikerjakan."
                actionLabel="Kembali ke Tryout"
                onAction={() => navigate('/user/tryouts')}
            />
        )
    }

    const sidebarProps = {
        questions,
        currentQuestionIndex,
        selectedAnswers,
        doubtfulQuestions,
        answeredCount,
        doubtfulCount,
        isSavingProgress: saveProgressMutation.isPending,
    }

    return (
        <div className="min-h-screen bg-background font-user text-foreground">
            <CatHeader
                subtitle={`Soal ${currentQuestionIndex + 1} dari ${totalQuestions}`}
                formattedTime={formattedTime}
                isUrgent={isUrgent}
                isFinishing={finishAttemptMutation.isPending}
                onExit={handleExit}
                onFinish={() => setIsFinishModalOpen(true)}
            />

            <FinishConfirmModal
                isOpen={isFinishModalOpen}
                answeredCount={answeredCount}
                unansweredCount={unansweredCount}
                doubtfulCount={doubtfulCount}
                unansweredNumbers={unansweredNumbers}
                isSubmitting={finishAttemptMutation.isPending}
                onClose={() => setIsFinishModalOpen(false)}
                onConfirm={handleFinishAttempt}
            />
            <main className="mx-auto w-full max-w-[1600px] px-3 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
                {isUrgent && (
                    <div
                        role="alert"
                        className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-[13px] font-medium text-destructive"
                    >
                        <Timer size={16} aria-hidden="true" />
                        Waktu tersisa kurang dari 5 menit. Periksa soal yang belum dijawab.
                    </div>
                )}

                <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6">
                    <div className="min-w-0 space-y-4">
                        <QuestionPanel
                            question={currentQuestion}
                            currentNumber={currentQuestionIndex + 1}
                            totalQuestions={totalQuestions}
                            selectedAnswer={selectedAnswer}
                            onSelectAnswer={handleSelectAnswer}
                            isSavingAnswer={saveAnswerMutation.isPending}
                        />

                        <CatFooter
                            isFirstQuestion={isFirstQuestion}
                            isLastQuestion={isLastQuestion}
                            isDoubtful={isCurrentQuestionDoubtful}
                            isSavingProgress={
                                saveProgressMutation.isPending ||
                                saveAnswerMutation.isPending ||
                                finishAttemptMutation.isPending
                            }
                            answeredCount={answeredCount}
                            totalQuestions={totalQuestions}
                            onPrevious={handlePreviousQuestion}
                            onNext={handleNextQuestion}
                            onFinish={() => setIsFinishModalOpen(true)}
                            onToggleDoubtful={handleToggleDoubtful}
                            onOpenNavigator={() => setIsNavigatorOpen(true)}
                        />
                    </div>

                    <CatSidebar
                        {...sidebarProps}
                        onQuestionSelect={handleQuestionSelect}
                        className="hidden lg:order-first lg:block lg:sticky lg:top-24 lg:self-start"
                    />
                </div>
            </main>

            <CatNavigatorSheet
                open={isNavigatorOpen}
                onClose={() => setIsNavigatorOpen(false)}
            >
                <CatSidebar
                    {...sidebarProps}
                    onQuestionSelect={handleNavigatorSelect}
                />

                <button
                    type="button"
                    onClick={() => {
                        setIsNavigatorOpen(false)
                        setIsFinishModalOpen(true)
                    }}
                    className="focus-ring mt-4 h-12 w-full rounded-xl bg-primary-700 text-[14px] font-semibold text-white transition hover:bg-primary-700/90"
                >
                    Selesai & kirim jawaban
                </button>
            </CatNavigatorSheet>
        </div>
    )
}

export default CatExamPage