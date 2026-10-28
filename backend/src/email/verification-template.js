const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

export const verificationMessage = ({ from, to, frontendUrl, token }) => {
  // Fragment avoids transmitting the token in the initial page request/referrer.
  const link = `${frontendUrl}/verify-email#token=${encodeURIComponent(token)}`;
  return {
    from, to: [to], subject: 'Verifikasi email akun Halobakat',
    text: `Konfirmasi email Anda dengan membuka ${link} lalu menekan Verifikasi Email. Link berlaku 24 jam. Jika Anda tidak mendaftar, abaikan email ini.`,
    html: `<h1>Verifikasi email Anda</h1><p>Tekan tautan berikut, lalu konfirmasi melalui tombol Verifikasi Email.</p><p><a href="${escapeHtml(link)}">Verifikasi Email</a></p><p>Link berlaku 24 jam. Jika Anda tidak mendaftar, abaikan email ini.</p>`,
  };
};
