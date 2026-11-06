import MathText from '@/components/common/MathText'
import { getImageUrl } from '@/utils/image-url'
import { formatNumber } from '@/utils/format'
import { isTkp } from '@/user/utils/questionReview'

import QuestionExplanation from './QuestionExplanation'
import QuestionOption from './QuestionOption'
import ReviewStatusBadge from './ReviewStatusBadge'

function SummaryRow({ label, value, valueClass = 'text-foreground' }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`font-semibold ${valueClass}`}>{value}</dd>
    </div>
  )
}

function QuestionAnalysisCard({ question }) {
  const options = Array.isArray(question.answerOptions)
    ? question.answerOptions
    : []

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-7 lg:p-9">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[17px] font-bold text-foreground">
            Soal {question.questionOrder}
          </h2>

          <span className="rounded-full bg-muted px-3 py-1 text-[13px] font-semibold uppercase text-muted-foreground">
            {question.categorySlug}
          </span>
        </div>

        <ReviewStatusBadge question={question} />
      </div>

      <div className="mb-6 space-y-3">
        {question.questionText && (
          <MathText
            content={question.questionText}
            className="text-[14px] font-medium leading-8 text-foreground lg:text-[17px] lg:leading-9"
          />
        )}

        {question.questionImage && (
          <img
            src={getImageUrl(question.questionImage)}
            alt={`Gambar soal ${question.questionOrder}`}
            loading="lazy"
            className="max-h-80 max-w-full rounded-xl object-contain"
          />
        )}
      </div>

      <ul className="space-y-3">
        {options.map((option) => (
          <QuestionOption key={option.key} question={question} option={option} />
        ))}
      </ul>

      <section
        aria-labelledby="answer-summary-title"
        className="mt-6 rounded-xl bg-muted/60 p-4 sm:p-5"
      >
        <h3
          id="answer-summary-title"
          className="mb-3 text-[15px] font-bold text-foreground"
        >
          Ringkasan Jawaban
        </h3>

        <dl className="space-y-2 text-[14px]">
          <SummaryRow
            label="Jawabanmu"
            value={question.selectedAnswer ?? 'Tidak dijawab'}
          />

          {!isTkp(question) && (
            <SummaryRow
              label="Jawaban Benar"
              value={question.correctAnswer ?? '—'}
              valueClass="text-emerald-800"
            />
          )}

          <SummaryRow
            label="Skor Diperoleh"
            value={`${formatNumber(question.earnedScore)} / ${formatNumber(question.maximumScore)}`}
          />
        </dl>
      </section>

      <section
        aria-labelledby="explanation-title"
        className="mt-5 rounded-xl border border-border bg-muted/30 p-4 sm:p-5"
      >
        <h3
          id="explanation-title"
          className="mb-3 text-[15px] font-bold text-foreground"
        >
          Pembahasan Soal
        </h3>

        <QuestionExplanation explanation={question.explanation} />
      </section>
    </article>
  )
}

export default QuestionAnalysisCard