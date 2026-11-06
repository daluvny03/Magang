import { useQuestionReview } from '@/user/hooks/useQuestionReview'

import QuestionAnalysisCard from './QuestionAnalysisCard'
import QuestionNavigation from './QuestionNavigation'
import ReviewFooter from './ReviewFooter'
import ReviewInfoCard from './ReviewInfoCard'

function QuestionAnalysisList({ questions = [], resultUrl }) {
  const {
    total,
    categories,
    category,
    changeCategory,
    filtered,
    index,
    currentQuestion,
    selectQuestion,
    panelRef,
  } = useQuestionReview(questions)

  if (total === 0) {
    return (
      <p className="p-6 text-center text-[14px] text-muted-foreground">
        Pembahasan soal belum tersedia.
      </p>
    )
  }

  return (
    <section aria-label="Pembahasan soal" className="flex flex-1 flex-col">
      <div className="mx-auto grid w-full max-w-[1600px] flex-1 items-start gap-5 px-3 py-5 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6 lg:px-8">
        <div
          ref={panelRef}
          tabIndex={-1}
          className="min-w-0 scroll-mt-24 outline-none"
        >
          {currentQuestion ? (
            <QuestionAnalysisCard
              key={currentQuestion.questionId}
              question={currentQuestion}
            />
          ) : (
            <p className="rounded-2xl border border-border bg-card p-6 text-[14px] text-muted-foreground">
              Tidak ada soal pada kategori ini.
            </p>
          )}
        </div>

        {/* Di DOM setelah soal (urutan Tab), tampil di kiri pada layar lebar */}
        <aside className="space-y-4 lg:order-first lg:sticky lg:top-24">
          <QuestionNavigation
            questions={filtered}
            categories={categories}
            category={category}
            onCategoryChange={changeCategory}
            selectedIndex={index}
            onSelect={selectQuestion}
          />

          <ReviewInfoCard total={total} />
        </aside>
      </div>

      <ReviewFooter
        index={index}
        total={filtered.length}
        resultUrl={resultUrl}
        onPrevious={() => selectQuestion(index - 1)}
        onNext={() => selectQuestion(index + 1)}
      />
    </section>
  )
}

export default QuestionAnalysisList