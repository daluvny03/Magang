import { REVIEW_STATUS } from '@/user/constants/reviewStatus'
import { formatNumber } from '@/utils/format'
import { getQuestionStatus } from '@/user/utils/questionReview'

function ReviewStatusBadge({ question }) {
  const statusKey = getQuestionStatus(question)
  const { Icon, badge, label } = REVIEW_STATUS[statusKey]

  // TKP tidak punya benar atau salah, jadi yang ditampilkan skornya
  const text =
    statusKey === 'tkp' ? `Skor ${formatNumber(question.earnedScore)}` : label

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${badge}`}
    >
      <Icon size={15} aria-hidden="true" />
      {text}
    </span>
  )
}

export default ReviewStatusBadge