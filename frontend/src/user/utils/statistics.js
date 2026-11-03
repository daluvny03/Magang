const TIME_ZONE = 'Asia/Jakarta'

const formatDay = (time, withYear) =>
  new Intl.DateTimeFormat('id-ID', {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  }).format(new Date(time))

const directionOf = (difference) =>
  Math.abs(difference) < 0.005 ? 'same' : difference > 0 ? 'up' : 'down'

// Titik grafik: diurutkan menurut waktu selesai, nilai skala 0-100
export const buildTrendPoints = (trend) =>
  (Array.isArray(trend) ? trend : [])
    .map((item) => ({
      attemptId: item.attemptId,
      tryoutName: item.tryoutName,
      time: new Date(item.completedAt).getTime(),
      score: Number(item.scorePercentage),
      totalScore: item.totalScore,
      maximumScore: item.maximumScore,
      passingStatus: item.passingStatus,
    }))
    .filter((point) => Number.isFinite(point.score) && Number.isFinite(point.time))
    .sort((a, b) => a.time - b.time)
    .map((point) => ({
      ...point,
      label: formatDay(point.time, false),
      dateLabel: formatDay(point.time, true),
    }))

// Perubahan skor hasil terakhir dibanding tryout sebelumnya
export const getScoreChange = (points, latestAttempt) => {
  if (!latestAttempt || points.length < 2) return null

  const last = points[points.length - 1]

  if (String(last.attemptId) !== String(latestAttempt.attemptId)) return null

  const previous = points[points.length - 2]
  const difference = last.score - previous.score

  return {
    previous: previous.score,
    current: last.score,
    direction: directionOf(difference),
  }
}

// Riwayat tidak mengirim persen: ambil dari titik tren yang sama, atau hitung
export const normalizeLatestAttempt = (item, points = []) => {
  if (!item) return null

  const attemptId = String(item.attemptId)
  const matched = points.find((point) => String(point.attemptId) === attemptId)

  const total = Number(item.totalScore)
  const max = Number(item.maximumScore)

  const computed =
    max > 0 && Number.isFinite(total)
      ? Math.round((total / max) * 10000) / 100
      : null

  return { ...item, attemptId, scorePercentage: matched?.score ?? computed }
}

export const getPassingDistribution = (summary) => {
  const items = [
    { key: 'passed', count: Number(summary?.passedAttempts) || 0 },
    { key: 'failed', count: Number(summary?.failedAttempts) || 0 },
    { key: 'not_evaluated', count: Number(summary?.notEvaluatedAttempts) || 0 },
  ]

  const total = items.reduce((sum, item) => sum + item.count, 0)

  return {
    total,
    items: items.map((item) => ({
      ...item,
      percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
    })),
  }
}

