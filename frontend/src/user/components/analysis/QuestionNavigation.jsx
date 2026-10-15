
const getQuestionStatus = (question) => {
  if (question.selectedAnswer == null) {
    return 'unanswered'
  }

  if (question.categorySlug === 'tkp') {
    return 'tkp'
  }

  return question.isCorrect === true
    ? 'correct'
    : 'wrong'
}

const STATUS_STYLES = {
  correct: 'border-green-200 bg-green-50 text-green-700',
  wrong: 'border-red-200 bg-red-50 text-red-700',
  tkp: 'border-blue-200 bg-blue-50 text-blue-700',
  unanswered: 'border-slate-200 bg-white text-slate-500',
}

const STATUS_LABELS = {
  correct: 'Benar',
  wrong: 'Salah',
  tkp: 'TKP dijawab',
  unanswered: 'Tidak dijawab',
}

function QuestionNavigation({
  questions,
  selectedIndex,
  onSelect,
}) {
  if (!questions.length) return null

  return (
    <nav
      aria-label="Navigasi nomor soal pembahasan"
      className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
    >
      <h3 className="mb-4 text-sm font-semibold text-slate-900">
        Navigasi Soal
      </h3>

      <div className="mb-4 flex flex-wrap gap-3 text-xs">
        <span className="text-green-700">● Benar</span>
        <span className="text-red-700">● Salah</span>
        <span className="text-blue-700">● TKP dijawab</span>
        <span className="text-slate-500">○ Belum dijawab</span>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">
        {questions.map((question, index) => {
          const status = getQuestionStatus(question)
          const active = selectedIndex === index

          return (
            <button
              key={question.questionId}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Soal ${question.questionOrder}, ${STATUS_LABELS[status]}`}
              aria-current={active ? 'step' : undefined}
              className={[
                'flex h-11 items-center justify-center rounded-lg border text-sm font-semibold transition',
                STATUS_STYLES[status],
                active
                  ? 'ring-2 ring-slate-900 ring-offset-2'
                  : 'hover:brightness-95',
              ].join(' ')}
            >
              {question.questionOrder}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default QuestionNavigation
