import { BookOpen } from 'lucide-react'
import { useState } from 'react'

import { useTryouts } from '../hooks/useTryouts'
import TryoutCard from '../components/tryout/TryoutCard'
import TryoutFilter from '../components/tryout/TryoutFilter'
import { useNavigate } from 'react-router-dom'

function TryoutPage() {
    const navigate = useNavigate()
    const [activeFilter, setActiveFilter] = useState('all')
    const {
        data: tryoutResponse,
        isLoading,
        isError,
        error,
    } = useTryouts()

    const tryouts = tryoutResponse?.data || []

    const filteredTryouts = tryouts.filter((tryout) => {
        switch (activeFilter) {
            case 'accessible':
                return tryout.isAccessible

            case 'free':
                return tryout.isFree

            case 'locked':
                return !tryout.isAccessible

            default:
                return true
        }
    })

    const handleDetail = (tryout) => {
        navigate(`/user/tryouts/${tryout.id}`)
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Tryout
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Temukan dan pilih simulasi tryout untuk
                    membantu persiapan seleksi CPNS.
                </p>
            </div>
            {!isLoading && !isError && tryouts.length > 0 && (
                <TryoutFilter
                    value={activeFilter}
                    onChange={setActiveFilter}
                />
            )}
            {/* Loading */}
            {isLoading && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div
                            key={item}
                            className="h-56 animate-pulse rounded-2xl bg-gray-100"
                        />
                    ))}
                </div>
            )}

            {/* Error */}
            {isError && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                    <p className="text-sm font-medium text-red-700">
                        {error?.response?.data?.message ||
                            'Gagal memuat data tryout.'}
                    </p>
                </div>
            )}

            {/* Empty */}
            {!isLoading &&
                !isError &&
                tryouts.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
                        <BookOpen
                            size={32}
                            className="mx-auto text-gray-400"
                        />

                        <h2 className="mt-3 font-semibold text-gray-900">
                            Belum ada tryout
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Tryout yang tersedia akan muncul di sini.
                        </p>
                    </div>
                )}

            {/* Tryout List */}
            {!isLoading &&
                !isError &&
                filteredTryouts.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredTryouts.map((tryout) => (
                            <TryoutCard
                                key={tryout.id}
                                tryout={tryout}
                                onDetail={handleDetail}
                            />
                        ))}
                    </div>
                )}

            {!isLoading &&
                !isError &&
                tryouts.length > 0 &&
                filteredTryouts.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
                        <BookOpen
                            size={32}
                            className="mx-auto text-gray-400"
                        />

                        <h2 className="mt-3 font-semibold text-gray-900">
                            Tryout tidak ditemukan
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Tidak ada tryout yang sesuai dengan filter ini.
                        </p>

                        <button
                            type="button"
                            onClick={() => setActiveFilter('all')}
                            className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700"
                        >
                            Tampilkan Semua
                        </button>
                    </div>
                )}
        </div>
    )
}

export default TryoutPage