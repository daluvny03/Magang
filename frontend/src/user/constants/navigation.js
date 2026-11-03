import { matchPath } from 'react-router-dom'
import {
  ChartNoAxesCombined,
  ClipboardList,
  Crown,
  History,
  Home,
  Lightbulb,
  ReceiptText,
  Trophy,
  User,
} from 'lucide-react'

// alsoActiveFor: halaman turunan yang ikut menyalakan menu ini
export const NAV_GROUPS = [
  {
    title: 'Menu Utama',
    items: [
      { label: 'Beranda', path: '/user/dashboard', icon: Home },
      { label: 'Kumpulan Tryout', path: '/user/tryouts', icon: ClipboardList },
      {
        label: 'Riwayat Tryout',
        path: '/user/history',
        icon: History,
        alsoActiveFor: ['/user/results'],
      },
      { label: 'Statistik Performa', path: '/user/statistics', icon: ChartNoAxesCombined },
      {
        label: 'Rekomendasi Belajar',
        path: '/user/recommendations',
        icon: Lightbulb,
        },
      { label: 'Leaderboard', path: '/user/leaderboard', icon: Trophy, comingSoon: true },
    ],
  },
  {
    title: 'Subscription',
    items: [
      { label: 'Paket Subscription', path: '/user/subscription', icon: Crown },
      {
        label: 'Riwayat Pembayaran',
        path: '/user/payments',
        icon: ReceiptText,
        alsoActiveFor: ['/user/payment'],
      },
    ],
  },
  {
    title: 'Akun',
    items: [{ label: 'Profil Saya', path: '/user/profile', icon: User }],
  },
]

export const isNavActive = (item, pathname) =>
  [item.path, ...(item.alsoActiveFor ?? [])].some(
    (base) => pathname === base || pathname.startsWith(`${base}/`)
  )

// Urutan penting: pola yang lebih spesifik tidak bentrok karena end: true
const ROUTE_TITLES = [
  { path: '/user/dashboard', title: 'Beranda' },
  { path: '/user/tryouts', title: 'Kumpulan Tryout' },
  { path: '/user/tryouts/:tryoutId', title: 'Detail Tryout', parent: 'Kumpulan Tryout' },
  { path: '/user/history', title: 'Riwayat Tryout' },
  { path: '/user/results/:attemptId', title: 'Hasil Tryout', parent: 'Riwayat Tryout' },
  { path: '/user/results/:attemptId/analysis', title: 'Analisis Waktu', parent: 'Riwayat Tryout' },
  { path: '/user/statistics', title: 'Statistik Performa' },
  { path: '/user/leaderboard', title: 'Leaderboard' },
  { path: '/user/subscription', title: 'Paket Subscription' },
  { path: '/user/payments', title: 'Riwayat Pembayaran' },
  { path: '/user/payment/success', title: 'Pembayaran Berhasil', parent: 'Paket Subscription' },
  { path: '/user/profile', title: 'Profil Saya' },
  { path: '/user/forbidden', title: 'Akses Terbatas' },
  {
    path: '/user/recommendations',
    title: 'Rekomendasi Belajar',
    },
]

export function getRouteInfo(pathname) {
  const route = ROUTE_TITLES.find((item) =>
    matchPath({ path: item.path, end: true }, pathname)
  )

  return route ?? { title: 'Halobakat', parent: null }
}