
import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import QuestionAnalysisCard from './QuestionAnalysisCard'

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'twk', label: 'TWK' },
  { value: 'tiu', label: 'TIU' },
  { value: 'tkp', label: 'TKP' },
]

function QuestionAnalysisList({ questions = [] }) {
  const [category, setCategory] = useState('all')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredQuestions = useMemo(() => {
    if (!Array.isArray(questions)) return []

    const sorted = [...questions].sort(
      (a, b) =>
        Number(a.questionOrder) -
        Number(b.questionOrder)
    )

    if (category === 'all') return sorted

    return sorted.filter(
      (question) => question.categorySlug === category
    )
  }, [questions, category])

  const currentQuestion =
    filteredQuestions[selectedIndex] ?? null

  const handleCategoryChange = (nextCategory) => {
    setCategory(nextCategory)
    setSelectedIndex(0)
  }

  const previousQuestion = () => {
    setSelectedIndex((index) => Math.max(0, index - 1))
  }

  const nextQuestion = () => {
    setSelectedIndex((index) =>
      Math.min(filteredQuestions.length - 1, index + 1)
    )
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return null
  }

  return (
    <section
      aria-labelledby="question-analysis-title"
      className="space-y-5"
    >
      <div>
        <h2
          id="question-analysis-title"
          className="text-lg font-semibold text-slate-900"
        >
          Analisis & Pembahasan Soal
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Tinjau jawaban, skor, dan pembahasan
          setiap soal yang telah dikerjakan.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((option) => {
          const active = category === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                handleCategoryChange(option.value)
              }
              aria-pressed={active}
              className={[
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              ].join(' ')}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {currentQuestion ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Menampilkan soal {selectedIndex + 1}
              {' dari '}
              {filteredQuestions.length}
            </p>

            <select
              value={selectedIndex}
              onChange={(event) =>
                setSelectedIndex(Number(event.target.value))
              }
              aria-label="Pilih nomor soal"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              {filteredQuestions.map((question, index) => (
                <option
                  key={question.questionId}
                  value={index}
                >
                  Soal {question.questionOrder}
                </option>
              ))}
            </select>
          </div>

          <QuestionAnalysisCard
            key={currentQuestion.questionId}
            question={currentQuestion}
          />

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={previousQuestion}
              disabled={selectedIndex === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Sebelumnya
            </button>

            <button
              type="button"
              onClick={nextQuestion}
              disabled={
                selectedIndex >= filteredQuestions.length - 1
              }
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya
              <ChevronRight size={16} />
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">
            Tidak ada soal pada kategori ini.
          </p>
        </div>
      )}
    </section>
  )
}

export default QuestionAnalysisList
