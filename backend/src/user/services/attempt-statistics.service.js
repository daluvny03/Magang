
import {
  findAttemptStatisticsSummary,
  findAttemptStatisticsTrend,
} from '../repositories/attempt-statistics.repository.js'

const toNullableNumber = (value) => {
  if (value == null) return null

  const number = Number(value)

  return Number.isFinite(number)
    ? number
    : null
}

export const getAttemptStatisticsForUser = async (
  userId
) => {
  const [summary, trend] = await Promise.all([
    findAttemptStatisticsSummary(userId),
    findAttemptStatisticsTrend({
      userId,
      limit: 20,
    }),
  ])

  return {
    summary: {
      totalAttempts: Number(
        summary.totalAttempts ?? 0
      ),
      averageScorePercentage:
        toNullableNumber(
          summary.averageScorePercentage
        ),
      bestScorePercentage:
        toNullableNumber(
          summary.bestScorePercentage
        ),
      passedAttempts: Number(
        summary.passedAttempts ?? 0
      ),
      failedAttempts: Number(
        summary.failedAttempts ?? 0
      ),
      notEvaluatedAttempts: Number(
        summary.notEvaluatedAttempts ?? 0
      ),
    },

    trend: trend.map((item) => ({
      attemptId: String(item.attemptId),
      tryoutName: item.tryoutName,
      completedAt: item.completedAt,
      totalScore:
        toNullableNumber(item.totalScore),
      maximumScore:
        toNullableNumber(item.maximumScore),
      scorePercentage:
        toNullableNumber(item.scorePercentage),
      passingStatus: item.passingStatus,
    })),
  }
}
