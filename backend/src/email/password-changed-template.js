export const passwordChangedMessage = ({ from, to, frontendUrl, changedAt }) => {
  const time = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Jakarta',
  }).format(new Date(changedAt));
  const link = `${frontendUrl}/forgot-password`;
  // Escape configuration-derived URLs before placing them in HTML attributes.
  const htmlLink = link.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll("'", '&#39;');
  return {
    from, to: [to], subject: 'Password akun Halobakat berhasil diubah',
    text: `Password akun Anda berhasil diubah pada ${time} WIB. Sesi login lama telah dibatalkan. Jika Anda melakukan perubahan ini, tidak perlu tindakan lain. Jika bukan Anda, segera pulihkan akun melalui ${link} dan amankan akun email Anda.`,
    html: `<h1>Password berhasil diubah</h1><p>Password akun Anda berhasil diubah pada ${time} WIB.</p><p>Sesi login lama telah dibatalkan.</p><p>Jika Anda melakukan perubahan ini, tidak perlu tindakan lain.</p><p>Jika bukan Anda, segera <a href="${htmlLink}">pulihkan akun</a> dan amankan akun email Anda.</p>`,
  };
};
