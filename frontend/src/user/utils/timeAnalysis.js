import {
  TIME_FALLBACK_MESSAGE,
  getTimeStatusKey,
} from '@/user/constants/timeStatus'

export function buildTimeRows(questions) {
  const list = Array.isArray(questions) ? questions : []

  return list.map((question, index) => {
    const insight = question.timeInsight ?? null
    const rawOrder = question.questionOrder
    const hasOrder = rawOrder != null && Number.isFinite(Number(rawOrder))

    const statusKey = getTimeStatusKey(insight?.status)
    const isRated = statusKey !== 'insufficient_data'

    const secondsValue =
      insight?.recordedTimeSeconds ?? question.recordedTimeSeconds ?? null
    const seconds = secondsValue == null ? null : Number(secondsValue)

    const averageValue = isRated ? insight?.categoryAverageSeconds ?? null : null
    const averageSeconds = averageValue == null ? null : Number(averageValue)

    return {
      id: question.questionId,
      number: hasOrder ? Number(rawOrder) : index + 1,
      categorySlug: question.categorySlug,
      seconds,
      averageSeconds,
      ratio: isRated ? insight?.timeRatio ?? null : null,
      delta:
        seconds != null && averageSeconds != null
          ? seconds - averageSeconds
          : null,
      statusKey,
      insightCode: insight?.insight?.code ?? 'INSUFFICIENT_DATA',
      insightMessage:
        typeof insight?.insight?.message === 'string'
          ? insight.insight.message
          : TIME_FALLBACK_MESSAGE,
    }
  })
}

export function countByStatus(rows) {
  const counts = {
    relatively_fast: 0,
    normal: 0,
    relatively_slow: 0,
    insufficient_data: 0,
    total: rows.length,
  }

  rows.forEach((row) => {
    counts[row.statusKey] += 1
  })

  return counts
}

export function groupByInsight(rows) {
  const map = new Map()

  rows.forEach((row) => {
    const entry = map.get(row.insightCode) ?? {
      code: row.insightCode,
      statusKey: row.statusKey,
      message: row.insightMessage,
      count: 0,
      numbers: [],
    }

    entry.count += 1
    entry.numbers.push(row.number)
    map.set(row.insightCode, entry)
  })

  // Pola yang perlu perhatian lebih dulu, kelompok normal paling bawah
  return [...map.values()].sort(
    (a, b) =>
      Number(a.code === 'NORMAL_TIME') - Number(b.code === 'NORMAL_TIME') ||
      b.count - a.count
  )
}