import MathText from '@/components/common/MathText'
import { getExplanationSections } from '@/user/utils/questionReview'

function QuestionExplanation({ explanation }) {
  const sections = getExplanationSections(explanation)

  if (sections.length === 0) {
    return (
      <p className="text-[14px] text-muted-foreground">
        Pembahasan belum tersedia.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {sections.map(({ key, label, content }) => (
        <div key={key}>
          <h4 className="mb-1 text-[14px] font-bold text-foreground">{label}</h4>

          <MathText
            content={content}
            className="text-[15px] leading-relaxed text-foreground lg:text-[16px]"
          />
        </div>
      ))}
    </div>
  )
}

export default QuestionExplanation