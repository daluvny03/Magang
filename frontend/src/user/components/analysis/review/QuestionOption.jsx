import { Check, X } from 'lucide-react'

import MathText from '@/components/common/MathText'
import { getImageUrl } from '@/utils/image-url'
import { formatNumber } from '@/utils/format'
import {
    isCorrectOption,
    isSelectedOption,
    isTkp,
} from '@/user/utils/questionReview'

const getBoxClass = ({ selected, correct, tkp }) => {
    if (correct) return 'border-emerald-300 bg-emerald-50'
    if (selected && !tkp) return 'border-red-300 bg-red-50'
    if (selected) return 'border-primary bg-primary/10'

    return 'border-border bg-card'
}

const getKeyClass = ({ selected, correct, tkp }) => {
    if (correct) return 'bg-emerald-700 text-white'
    if (selected && !tkp) return 'bg-red-700 text-white'
    if (selected) return 'bg-primary-700 text-white'

    return 'bg-muted text-muted-foreground'
}

function QuestionOption({ question, option }) {
    const selected = isSelectedOption(question, option)
    const correct = isCorrectOption(question, option)
    const tkp = isTkp(question)
    const state = { selected, correct, tkp }

    return (
        <li className={`rounded-xl border p-4 lg:p-5 ${getBoxClass(state)}`}>
            <div className="flex items-start gap-4">
                <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[15px] font-bold ${getKeyClass(state)}`}
                >
                    {option.key}
                </span>

                <div className="min-w-0 flex-1 space-y-2 pt-1.5">
                    {option.text && (
                        <MathText
                            content={option.text}
                            className="text-[13px] leading-relaxed text-foreground lg:text-[14px]"
                        />
                    )}

                    {option.image && (
                        <img
                            src={getImageUrl(option.image)}
                            alt={`Gambar opsi ${option.key}`}
                            loading="lazy"
                            className="max-h-64 max-w-full rounded-lg object-contain"
                        />
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-semibold">
                        {selected && (
                            <span
                                className={`inline-flex items-center gap-1 ${!correct && !tkp ? 'text-red-800' : 'text-primary-700'
                                    }`}
                            >
                                {!correct && !tkp && <X size={14} aria-hidden="true" />}
                                Jawabanmu
                            </span>
                        )}

                        {correct && (
                            <span className="inline-flex items-center gap-1 text-emerald-800">
                                <Check size={14} aria-hidden="true" />
                                Jawaban Benar
                            </span>
                        )}

                        {tkp && (
                            <span className="font-medium text-muted-foreground">
                                Skor: {formatNumber(option.score)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </li>
    )
}

export default QuestionOption