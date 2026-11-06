import { CheckCircle2, CircleHelp, ClipboardCheck, XCircle } from 'lucide-react'

export const REVIEW_STATUS_ORDER = ['correct', 'wrong', 'tkp', 'unanswered']

export const REVIEW_STATUS = {
  correct: {
    label: 'Benar',
    Icon: CheckCircle2,
    badge: 'bg-emerald-50 text-emerald-800',
    nav: 'border-emerald-300 bg-emerald-50 text-emerald-800',
    dot: 'bg-emerald-600',
  },
  wrong: {
    label: 'Salah',
    Icon: XCircle,
    badge: 'bg-red-50 text-red-800',
    nav: 'border-red-300 bg-red-50 text-red-800',
    dot: 'bg-red-600',
  },
  tkp: {
    label: 'TKP dijawab',
    Icon: ClipboardCheck,
    badge: 'bg-primary-50 text-primary-700',
    nav: 'border-primary/40 bg-primary-50 text-primary-700',
    dot: 'bg-primary',
  },
  unanswered: {
    label: 'Tidak dijawab',
    Icon: CircleHelp,
    badge: 'bg-muted text-muted-foreground',
    nav: 'border-border bg-card text-muted-foreground',
    dot: 'bg-muted-foreground/50',
  },
}