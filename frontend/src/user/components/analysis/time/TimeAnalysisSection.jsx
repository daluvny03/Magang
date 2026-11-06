import { useMemo } from 'react'

import { buildTimeRows, countByStatus, groupByInsight } from '@/user/utils/timeAnalysis'

import TimeInsights from './TimeInsights'
import TimePerCategory from './TimePerCategory'
import TimePerQuestionChart from './TimePerQuestionChart'
import TimeSummaryCards from './TimeSummaryCards'
import TimeTable from './TimeTable'

function TimeAnalysisSection({ questions = [], timeAnalysis, summary }) {
  const rows = useMemo(() => buildTimeRows(questions), [questions])
  const counts = useMemo(() => countByStatus(rows), [rows])
  const groups = useMemo(() => groupByInsight(rows), [rows])

  const recordedSeconds = summary?.recordedTimeSeconds ?? null
  const averageSeconds = timeAnalysis?.summary?.averageTimeSeconds ?? null
  const validTimeCount = timeAnalysis?.summary?.questionsWithValidTime ?? 0

  return (
    <div className="space-y-6">
      <TimeSummaryCards
        durationSeconds={summary?.durationSeconds ?? null}
        recordedSeconds={recordedSeconds}
        averageSeconds={averageSeconds}
        validTimeCount={validTimeCount}
        counts={counts}
      />

      <TimePerQuestionChart rows={rows} averageSeconds={averageSeconds} />

      <TimePerCategory categories={timeAnalysis?.categories ?? []} />

      <TimeTable rows={rows} />

      <TimeInsights groups={groups} rules={timeAnalysis?.rules} />
    </div>
  )
}

export default TimeAnalysisSection
