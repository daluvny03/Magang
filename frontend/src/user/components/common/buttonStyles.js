const base =
  'focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60'

const tones = {
  solid: 'bg-primary-700 text-white hover:bg-primary-700/90',
  outline: 'border border-border bg-card text-foreground hover:bg-muted',
  soft: 'border border-transparent bg-muted text-foreground hover:bg-border/60',
  ink: 'bg-foreground text-white hover:bg-foreground/90',
}

const build = (tone, size) => `${base} ${size} ${tones[tone]}`

export const buttonClass = {
  solid: build('solid', 'h-11'),
  outline: build('outline', 'h-11'),
  soft: build('soft', 'h-11'),
  ink: build('ink', 'h-11'),
  // Ukuran besar untuk tombol aksi utama
  solidLg: build('solid', 'h-12'),
  outlineLg: build('outline', 'h-12'),
  softLg: build('soft', 'h-12'),
  inkLg: build('ink', 'h-12'),
}