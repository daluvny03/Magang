import Notice from '@/user/components/common/Notice'

function CheckoutNotices({
  storageWarning,
  needsReview,
  paymentId,
  checkoutError,
  hasMutationError,
}) {
  if (!storageWarning && !needsReview && !checkoutError && !hasMutationError) {
    return null
  }

  return (
    <div className="space-y-3">
      {storageWarning && <Notice tone="warning">{storageWarning}</Notice>}

      {needsReview && (
        <Notice
          tone="warning"
          title="Pembayaran diterima, aktivasi perlu pemeriksaan"
        >
          <p>
            Pembayaran kamu sudah diterima, tetapi subscription belum dapat
            diaktifkan secara otomatis. Simpan nomor transaksi dan hubungi
            administrator untuk pemeriksaan lebih lanjut.
          </p>

          <p className="mt-2 text-[13px]">ID Pembayaran: {paymentId}</p>
        </Notice>
      )}

      {checkoutError && <Notice tone="warning">{checkoutError}</Notice>}

      {hasMutationError && (
        <Notice tone="danger">Gagal menyiapkan transaksi pembayaran.</Notice>
      )}
    </div>
  )
}

export default CheckoutNotices