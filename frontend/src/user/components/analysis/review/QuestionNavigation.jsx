import {
  REVIEW_STATUS,
  REVIEW_STATUS_ORDER,
} from '@/user/constants/reviewStatus'
import { getQuestionStatus } from '@/user/utils/questionReview'

function QuestionNavigation({
  questions,
  categories,
  category,
  onCategoryChange,
  selectedIndex,
  onSelect,
}) {
  if (!questions.length) return null

  const counts = questions.reduce((result, question) => {
    const key = getQuestionStatus(question)
    result[key] = (result[key] ?? 0) + 1

    return result
  }, {})

  return (
    <nav
      aria-label="Navigasi nomor soal pembahasan"
      className="rounded-2xl border border-border bg-card p-5 shadow-soft"
    >
      <h2 className="text-[15px] font-bold text-foreground">Navigasi Soal</h2>

      <label
        htmlFor="review-category"
        className="mt-4 block text-[14px] font-medium text-foreground"
      >
        Kategori
      </label>

      <select
        id="review-category"
        value={category}
        onChange={(event) => onCategoryChange(event.target.value)}
        className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-border bg-card px-3.5 text-[14px] text-foreground"
      >
        <option value="all">Semua kategori</option>

        {categories.map((slug) => (
          <option key={slug} value={slug}>
            {String(slug).toUpperCase()}
          </option>
        ))}
      </select>

      <div className="mt-4 grid max-h-[40vh] grid-cols-5 gap-2 overflow-y-auto p-1 sm:grid-cols-8 lg:grid-cols-5">
        {questions.map((question, index) => {
          const statusKey = getQuestionStatus(question)
          const isActive = selectedIndex === index

          return (
            <button
              key={question.questionId}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Soal ${question.questionOrder}, ${REVIEW_STATUS[statusKey].label}`}
              aria-current={isActive ? 'step' : undefined}
              className={`focus-ring flex h-11 items-center justify-center rounded-xl border text-[14px] font-semibold transition-colors ${REVIEW_STATUS[statusKey].nav} ${
                isActive
                  ? 'ring-2 ring-primary-700 ring-offset-2 ring-offset-card'
                  : 'hover:brightness-95'
              }`}
            >
              {question.questionOrder}
            </button>
          )
        })}
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-4">
        {REVIEW_STATUS_ORDER.filter((key) => counts[key]).map((key) => (
          <li
            key={key}
            className="flex items-center gap-2 text-[13px] text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className={`h-3 w-3 shrink-0 rounded-full ${REVIEW_STATUS[key].dot}`}
            />
            {REVIEW_STATUS[key].label} ({counts[key]})
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default QuestionNavigation