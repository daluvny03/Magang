import { AlertCircle, Gauge, Info, Timer } from 'lucide-react'

export const TIME_FALLBACK_MESSAGE =
  'Data waktu belum cukup untuk memberikan analisis.'

export const TIME_STATUS = {
  relatively_slow: {
    label: 'Relatif Lambat',
    Icon: AlertCircle,
    badge: 'bg-amber-50 text-amber-800',
    chartColor: '#f59e0b',
  },
  normal: {
    label: 'Normal',
    Icon: Gauge,
    badge: 'bg-emerald-50 text-emerald-800',
    chartColor: '#1f9d73',
  },
  relatively_fast: {
    label: 'Relatif Cepat',
    Icon: Timer,
    badge: 'bg-sky-50 text-sky-800',
    chartColor: '#2f8fe0',
  },
  insufficient_data: {
    label: 'Data Tidak Cukup',
    Icon: Info,
    badge: 'bg-muted text-muted-foreground',
    chartColor: '#9aa5b1',
  },
}

export const getTimeStatusKey = (status) =>
  TIME_STATUS[status] ? status : 'insufficient_data'

// Judul kelompok kesimpulan per kode insight dari backend.
// Kode yang belum terdaftar memakai pesan backend sebagai judul.
export const INSIGHT_TITLES = {
  SLOW_CORRECT: 'Benar, tetapi relatif lambat',
  FAST_WRONG: 'Cepat, tetapi belum tepat',
  NORMAL_TIME: 'Waktu pengerjaan normal',
  INSUFFICIENT_DATA: 'Data waktu belum cukup',
}