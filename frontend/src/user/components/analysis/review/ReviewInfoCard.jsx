function ReviewInfoCard({ total }) {
  return (
    <section
      aria-labelledby="review-info-title"
      className="rounded-2xl border border-border bg-card p-5 shadow-soft"
    >
      <h2 id="review-info-title" className="text-[15px] font-bold text-foreground">
        Informasi Pembahasan
      </h2>

      <p className="mt-3 text-[14px] text-foreground">
        {total} soal · Mode tinjauan
      </p>

      <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
        Jawaban ujian sudah tersimpan. Pelajari kunci jawaban, skor, dan
        pembahasan tiap soal.
      </p>
    </section>
  )
}

export default ReviewInfoCard