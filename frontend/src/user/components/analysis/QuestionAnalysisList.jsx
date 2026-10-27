import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import QuestionNavigation from './QuestionNavigation'
import QuestionAnalysisCard from './QuestionAnalysisCard'

function QuestionAnalysisList({ questions = [], resultUrl }) {
  const [category, setCategory] = useState('all')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const questionPanel = useRef(null)
  const sorted = useMemo(() => Array.isArray(questions)
    ? [...questions].sort((a, b) => Number(a.questionOrder) - Number(b.questionOrder))
    : [], [questions])
  const categories = [...new Set(sorted.map((question) => question.categorySlug))]
  const filtered = category === 'all' ? sorted : sorted.filter((question) => question.categorySlug === category)
  const index = Math.min(selectedIndex, Math.max(0, filtered.length - 1))
  const currentQuestion = filtered[index]
  const selectQuestion = (nextIndex) => {
    setSelectedIndex(nextIndex)
    questionPanel.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    questionPanel.current?.focus({ preventScroll: true })
  }

  if (!sorted.length) return <p className="p-6 text-center text-gray-500">Pembahasan soal belum tersedia.</p>

  return (
    <section aria-label="Pembahasan soal" className="flex flex-1 flex-col">
      <div className="mx-auto grid w-full max-w-[1600px] flex-1 items-start gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6">
        <div ref={questionPanel} tabIndex={-1} className="min-w-0 scroll-mt-24 outline-none">
          {currentQuestion ? (
            <QuestionAnalysisCard key={currentQuestion.questionId} question={currentQuestion} />
          ) : <p className="rounded-xl bg-white p-6">Tidak ada soal pada kategori ini.</p>}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-bold text-gray-900">Informasi Pembahasan</h2>
            <p className="mt-3 text-sm text-gray-600">{sorted.length} soal · Mode tinjauan</p>
            <p className="mt-2 text-xs leading-5 text-gray-500">Jawaban ujian sudah tersimpan. Pelajari kunci jawaban, skor, dan pembahasan tiap soal.</p>
            <label htmlFor="review-category" className="mt-4 block text-sm font-medium text-gray-700">Kategori</label>
            <select id="review-category" value={category} onChange={(event) => {
              setCategory(event.target.value)
              setSelectedIndex(0)
            }} className="mt-2 w-full rounded-lg border border-gray-200 bg-white p-2 text-sm">
              <option value="all">Semua kategori</option>
              {categories.map((slug) => <option key={slug} value={slug}>{slug.toUpperCase()}</option>)}
            </select>
          </div>
          <QuestionNavigation questions={filtered} selectedIndex={index} onSelect={selectQuestion} />
        </aside>
      </div>
      <footer className="sticky bottom-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <button type="button" onClick={() => selectQuestion(index - 1)} disabled={index === 0}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-40">Sebelumnya</button>
          <p aria-live="polite" className="text-center text-xs text-gray-500">{filtered.length ? index + 1 : 0} / {filtered.length} soal</p>
          {index === filtered.length - 1 && resultUrl ? (
            <Link to={resultUrl} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Kembali ke Hasil</Link>
          ) : (
            <button type="button" onClick={() => selectQuestion(index + 1)} disabled={index >= filtered.length - 1}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Selanjutnya</button>
          )}
        </div>
      </footer>
    </section>
  )
}

export default QuestionAnalysisList
