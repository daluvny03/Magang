import { useMemo, useState } from 'react'

import Surface from '@/user/components/common/Surface'
import { buttonClass } from '@/user/components/common/buttonStyles'
import { CATEGORY_ORDER } from '@/user/constants/categoryStyles'
import { countByStatus } from '@/user/utils/timeAnalysis'
import { formatDurationShort, formatRatio } from '@/utils/format'

import TimeStatusBadge from './TimeStatusBadge'

const PAGE_SIZE = 10

const STATUS_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'relatively_slow', label: 'Relatif Lambat' },
  { value: 'relatively_fast', label: 'Relatif Cepat' },
  { value: 'normal', label: 'Normal' },
  { value: 'insufficient_data', label: 'Data Tidak Cukup' },
]

const SORT_OPTIONS = [
  { value: 'longest', label: 'Waktu terlama' },
  { value: 'shortest', label: 'Waktu tercepat' },
  { value: 'order', label: 'Nomor soal' },
]

const SORTERS = {
  longest: (a, b) => (b.seconds ?? -1) - (a.seconds ?? -1) || a.number - b.number,
  shortest: (a, b) =>
    (a.seconds ?? Infinity) - (b.seconds ?? Infinity) || a.number - b.number,
  order: (a, b) => a.number - b.number,
}

const selectClass =
  'focus-ring h-11 w-full rounded-xl border border-border bg-card px-3.5 text-[14px] text-foreground'

const formatDelta = (delta) => {
  if (delta == null) return '—'

  const rounded = Math.round(delta)

  return `${rounded > 0 ? '+' : ''}${rounded} dtk`
}

const deltaClass = (delta) =>
  delta == null
    ? 'text-muted-foreground'
    : delta > 0
      ? 'text-amber-800'
      : 'text-sky-800'

function TimeTable({ rows }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('longest')
  const [page, setPage] = useState(1)

  const statusCounts = useMemo(() => countByStatus(rows), [rows])

  const categoryOptions = useMemo(() => {
    const slugs = [...new Set(rows.map((row) => row.categorySlug).filter(Boolean))]

    return slugs.sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))
  }, [rows])

  const filtered = useMemo(
    () =>
      rows
        .filter(
          (row) =>
            (statusFilter === 'all' || row.statusKey === statusFilter) &&
            (category === 'all' || row.categorySlug === category)
        )
        .sort(SORTERS[sortBy]),
    [rows, statusFilter, category, sortBy]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const changeStatus = (value) => {
    setStatusFilter(value)
    setPage(1)
  }

  const changeCategory = (value) => {
    setCategory(value)
    setPage(1)
  }

  const changeSort = (value) => {
    setSortBy(value)
    setPage(1)
  }

  const resetFilters = () => {
    setStatusFilter('all')
    setCategory('all')
    setSortBy('longest')
    setPage(1)
  }

  return (
    <Surface as="section" aria-labelledby="time-table-title" className="overflow-hidden">
      <div className="border-b border-border p-5 sm:p-6">
        <h2 id="time-table-title" className="text-[17px] font-bold text-foreground">
          Tabel Detail Waktu per Soal
        </h2>

        <p className="mt-1 text-[14px] leading-6 text-muted-foreground">
          Bandingkan waktu tiap soal dengan rata-rata kategorinya, lalu baca
          insight untuk soal tersebut.
        </p>

        <div
          role="group"
          aria-label="Filter status waktu"
          className="mt-4 flex flex-wrap gap-2"
        >
          {STATUS_FILTERS.filter(
            (option) => option.value === 'all' || statusCounts[option.value] > 0
          ).map((option) => {
            const count =
              option.value === 'all' ? statusCounts.total : statusCounts[option.value]
            const isActive = statusFilter === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => changeStatus(option.value)}
                aria-pressed={isActive}
                className={`focus-ring h-11 rounded-xl px-4 text-[14px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'border border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                {option.label} ({count})
              </button>
            )
          })}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:max-w-xl">
          <div>
            <label
              htmlFor="time-category-filter"
              className="mb-1.5 block text-[14px] font-medium text-foreground"
            >
              Kategori
            </label>

            <select
              id="time-category-filter"
              value={category}
              onChange={(event) => changeCategory(event.target.value)}
              className={selectClass}
            >
              <option value="all">Semua kategori</option>

              {categoryOptions.map((slug) => (
                <option key={slug} value={slug}>
                  {slug.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="time-sort"
              className="mb-1.5 block text-[14px] font-medium text-foreground"
            >
              Urutkan berdasarkan
            </label>

            <select
              id="time-sort"
              value={sortBy}
              onChange={(event) => changeSort(event.target.value)}
              className={selectClass}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p aria-live="polite" className="mt-4 text-[14px] text-muted-foreground">
          Menampilkan {filtered.length} dari {rows.length} soal
        </p>
      </div>

      {pageRows.length === 0 ? (
        <div className="px-5 py-12 text-center sm:px-6">
          <p className="text-[15px] font-semibold text-foreground">
            Tidak ada soal pada filter ini
          </p>

          <p className="mt-1 text-[14px] text-muted-foreground">
            Pilih filter lain untuk melihat detail waktu pengerjaan.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className={`${buttonClass.outline} mt-4`}
          >
            Reset filter
          </button>
        </div>
      ) : (
        <>
          <div
            role="region"
            tabIndex={0}
            aria-label="Tabel waktu pengerjaan per soal"
            className="focus-ring hidden overflow-x-auto xl:block"
          >
            <table className="w-full min-w-[860px] text-left text-[14px]">
              <caption className="sr-only">
                Waktu pengerjaan setiap soal beserta insight dari analisis
              </caption>

              <thead>
                <tr className="border-b border-border bg-muted/60 text-[13px] text-muted-foreground">
                  <th scope="col" className="px-6 py-3 font-semibold">No. Soal</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Kategori</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Waktu</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Rata-rata kategori</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Selisih</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Status</th>
                  <th scope="col" className="min-w-[260px] px-6 py-3 font-semibold">Insight</th>
                </tr>
              </thead>

              <tbody>
                {pageRows.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-border align-top last:border-0 ${
                      row.statusKey === 'relatively_slow' ? 'bg-amber-50' : ''
                    }`}
                  >
                    <th scope="row" className="px-6 py-3 font-bold text-foreground">
                      {row.number}
                    </th>

                    <td className="px-3 py-3 font-semibold uppercase text-foreground">
                      {row.categorySlug}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-foreground">
                      {formatDurationShort(row.seconds)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-foreground">
                      {formatDurationShort(row.averageSeconds)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3">
                      <span className={`font-semibold ${deltaClass(row.delta)}`}>
                        {formatDelta(row.delta)}
                      </span>

                      <span className="block text-[13px] text-muted-foreground">
                        {formatRatio(row.ratio)}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <TimeStatusBadge statusKey={row.statusKey} />
                    </td>

                    <td className="px-6 py-3 leading-6 text-foreground">
                      {row.insightMessage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="grid gap-3 p-4 sm:p-5 md:grid-cols-2 xl:hidden">
            {pageRows.map((row) => (
              <li
                key={row.id}
                className={`rounded-2xl border p-4 ${
                  row.statusKey === 'relatively_slow'
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-border'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[15px] font-bold text-foreground">
                      Soal {row.number}
                    </p>

                    <p className="text-[13px] uppercase text-muted-foreground">
                      {row.categorySlug}
                    </p>
                  </div>

                  <TimeStatusBadge statusKey={row.statusKey} />
                </div>

                <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-muted/70 px-2 py-2.5">
                    <dd className="text-[14px] font-bold text-foreground">
                      {formatDurationShort(row.seconds)}
                    </dd>
                    <dt className="text-[12px] text-muted-foreground">Waktu</dt>
                  </div>

                  <div className="rounded-xl bg-muted/70 px-2 py-2.5">
                    <dd className="text-[14px] font-bold text-foreground">
                      {formatDurationShort(row.averageSeconds)}
                    </dd>
                    <dt className="text-[12px] text-muted-foreground">Rata-rata</dt>
                  </div>

                  <div className="rounded-xl bg-muted/70 px-2 py-2.5">
                    <dd className={`text-[14px] font-bold ${deltaClass(row.delta)}`}>
                      {formatDelta(row.delta)}
                    </dd>
                    <dt className="text-[12px] text-muted-foreground">Selisih</dt>
                  </div>
                </dl>

                <p className="mt-3 text-[14px] leading-6 text-foreground">
                  {row.insightMessage}
                </p>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav
              aria-label="Halaman tabel waktu"
              className="flex flex-col items-center justify-between gap-3 border-t border-border px-5 py-4 sm:flex-row sm:px-6"
            >
              <p className="text-[14px] text-muted-foreground">
                Halaman {page} dari {totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className={buttonClass.outline}
                >
                  Sebelumnya
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className={buttonClass.outline}
                >
                  Berikutnya
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </Surface>
  )
}

export default TimeTable