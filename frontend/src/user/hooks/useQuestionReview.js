import { useMemo, useRef, useState } from 'react'

import { sortByOrder } from '@/user/utils/questionReview'

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

export function useQuestionReview(questions) {
  const [category, setCategory] = useState('all')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const panelRef = useRef(null)

  const sorted = useMemo(() => sortByOrder(questions), [questions])

  const categories = useMemo(
    () => [...new Set(sorted.map((question) => question.categorySlug))],
    [sorted]
  )

  const filtered = useMemo(
    () =>
      category === 'all'
        ? sorted
        : sorted.filter((question) => question.categorySlug === category),
    [sorted, category]
  )

  const index = Math.min(selectedIndex, Math.max(0, filtered.length - 1))

  const selectQuestion = (nextIndex) => {
    if (filtered.length === 0) return

    setSelectedIndex(Math.min(Math.max(nextIndex, 0), filtered.length - 1))

    const panel = panelRef.current

    panel?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    })
    panel?.focus({ preventScroll: true })
  }

  const changeCategory = (value) => {
    setCategory(value)
    setSelectedIndex(0)
  }

  return {
    total: sorted.length,
    categories,
    category,
    changeCategory,
    filtered,
    index,
    currentQuestion: filtered[index],
    selectQuestion,
    panelRef,
  }
}