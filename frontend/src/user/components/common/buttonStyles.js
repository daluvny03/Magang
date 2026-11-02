const base =
  'focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60'

export const buttonClass = {
  solid: `${base} bg-primary-700 text-white hover:bg-primary-700/90`,
  outline: `${base} border border-border bg-card text-foreground hover:bg-muted`,
}