import { Clock3, Sparkles } from 'lucide-react'

import Surface from '@/user/components/common/Surface'

function TimeRecommendationSection({ time }) {
    const priority = time?.mainPriority

    const isInsufficientData =
        time?.state === 'insufficient_time_data'

    return (
        <Surface
            as="section"
            aria-labelledby="time-insight-title"
            className="p-5 sm:p-6"
        >
            <div className="flex items-center gap-2">
                <Sparkles
                    size={20}
                    aria-hidden="true"
                    className="text-primary-700"
                />

                <h2
                    id="time-insight-title"
                    className="text-[17px] font-bold text-foreground"
                >
                    Insight Strategi Waktu
                </h2>
            </div>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Hal utama yang perlu diperhatikan dari pola waktu
                pengerjaan tryout terakhir.
            </p>

            {priority ? (
                <div className="mt-4 rounded-xl bg-muted/50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700">
                            {priority.categoryName}
                        </span>

                        <span className="text-xs text-muted-foreground">
                            {priority.affectedQuestionCount} soal perlu diperhatikan
                        </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-foreground">
                        {priority.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {priority.message}
                    </p>
                </div>
            ) : (
                <div className="mt-4 flex items-start gap-3 rounded-xl bg-muted/50 p-4">
                    <Clock3
                        size={20}
                        className="mt-0.5 shrink-0 text-muted-foreground"
                    />

                    <p className="text-sm leading-6 text-muted-foreground">
                        {isInsufficientData
                            ? 'Data waktu pengerjaan belum mencukupi untuk menghasilkan insight. Selesaikan lebih banyak tryout agar sistem dapat mengenali pola pengerjaanmu.'
                            : 'Belum ditemukan pola waktu pengerjaan yang perlu menjadi prioritas. Pertahankan strategi pengerjaanmu.'}
                    </p>
                </div>
            )}
        </Surface>
    )
}

export default TimeRecommendationSection