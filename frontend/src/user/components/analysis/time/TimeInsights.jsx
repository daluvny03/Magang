
import { Compass, Sparkles } from 'lucide-react'

import Surface from '@/user/components/common/Surface'
import { INSIGHT_TITLES, TIME_STATUS } from '@/user/constants/timeStatus'
import { formatRatio } from '@/utils/format'

const MAX_LISTED_NUMBERS = 12

function TimeInsights({ groups = [], rules }) {
    return (
        <Surface
            as="section"
            aria-labelledby="time-conclusion-title"
            className="p-5 sm:p-6"
        >
            <div className="flex items-center gap-2">
                <Sparkles
                    size={20}
                    aria-hidden="true"
                    className="text-primary-700"
                />

                <h2
                    id="time-conclusion-title"
                    className="text-[17px] font-bold text-foreground"
                >
                    Kesimpulan Waktu
                </h2>
            </div>

            <p className="mt-1 text-[14px] leading-6 text-muted-foreground">
                Ringkasan pola waktu pengerjaan dan hal yang perlu
                diperhatikan untuk meningkatkan efisiensi pengerjaan soal.
            </p>

            {groups.length === 0 ? (
                <p className="mt-4 rounded-xl bg-muted/60 p-4 text-[14px] text-muted-foreground">
                    Belum ada insight yang bisa ditampilkan.
                    Terus kerjakan tryout untuk mengumpulkan data
                    waktu yang cukup.
                </p>
            ) : (
                <ul className="mt-4 space-y-3">
                    {groups.map((group) => {
                        const config = TIME_STATUS[group.statusKey]

                        if (!config) return null

                        const Icon = config.Icon
                        const listed = group.numbers.slice(
                            0,
                            MAX_LISTED_NUMBERS
                        )
                        const rest = group.numbers.length - listed.length

                        return (
                            <li
                                key={group.code}
                                className="flex gap-3.5 rounded-2xl bg-muted/50 px-4 py-3.5"
                            >
                                <span
                                    aria-hidden="true"
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.badge}`}
                                >
                                    <Icon size={20} />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="text-[15px] font-bold text-foreground">
                                        {INSIGHT_TITLES[group.code] ?? group.message}

                                        <span className="ml-2 text-[14px] font-semibold text-muted-foreground">
                                            {group.count} soal
                                        </span>
                                    </p>

                                    <p className="mt-1 text-[14px] leading-6 text-muted-foreground">
                                        {group.message}
                                    </p>

                                    <p className="mt-2 text-[13px] text-muted-foreground">
                                        Soal nomor {listed.join(', ')}
                                        {rest > 0 ? ` dan ${rest} lainnya` : ''}
                                    </p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}

            <div className="my-6 border-t border-border" />

            <div className="flex items-center gap-2">
                <Compass
                    size={20}
                    aria-hidden="true"
                    className="text-primary-700"
                />

                <h3 className="text-[15px] font-bold text-foreground">
                    Cara Membaca Analisis
                </h3>
            </div>

            <p className="mt-3 text-[14px] leading-6 text-foreground">
                Status waktu bersifat relatif: waktu satu soal dibandingkan
                dengan rata-rata soal lain di kategori yang sama, bukan
                dengan standar waktu resmi ujian CAT.
            </p>

            {rules && (
                <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-muted/60 px-4 py-3">
                        <dt className="text-[13px] text-muted-foreground">
                            Batas relatif cepat
                        </dt>

                        <dd className="mt-0.5 text-[20px] font-bold text-foreground">
                            {formatRatio(rules.fastRatio)}
                        </dd>
                    </div>

                    <div className="rounded-2xl bg-muted/60 px-4 py-3">
                        <dt className="text-[13px] text-muted-foreground">
                            Batas relatif lambat
                        </dt>

                        <dd className="mt-0.5 text-[20px] font-bold text-foreground">
                            {formatRatio(rules.slowRatio)}
                        </dd>
                    </div>

                    <div className="rounded-2xl bg-muted/60 px-4 py-3">
                        <dt className="text-[13px] text-muted-foreground">
                            Minimal soal valid
                        </dt>

                        <dd className="mt-0.5 text-[20px] font-bold text-foreground">
                            {rules.minSamples}
                        </dd>
                    </div>
                </dl>
            )}

            <p className="mt-4 text-[13px] leading-6 text-muted-foreground">
                Angka batas merupakan kelipatan dari rata-rata kategori.
                Kategori dengan jumlah soal berwaktu valid di bawah
                batas minimal belum dapat dianalisis.
            </p>
        </Surface>
    )
}

export default TimeInsights
