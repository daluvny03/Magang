const escapeHtml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export const subscriptionActivatedMessage = ({ from, to, tierName, action, activatedAt, expiredAt }) => {
  const format = (value) => `${new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Jakarta',
  }).format(new Date(value))} WIB`;
  const title = action === 'renewed' ? 'Subscription berhasil diperpanjang' : 'Subscription berhasil diaktifkan';
  const occurred = format(activatedAt);
  const expiration = format(expiredAt);
  return {
    from, to: [to], subject: `${title} — Halobakat`,
    text: `${title}. Paket: ${tierName}. Waktu: ${occurred}. Masa aktif hingga: ${expiration}. Silakan masuk ke akun Halobakat untuk menggunakan fitur Premium.`,
    html: `<h1>${title}</h1><p>Paket: ${escapeHtml(tierName)}</p><p>Waktu: ${occurred}</p><p>Masa aktif hingga: ${expiration}</p><p>Silakan masuk ke akun Halobakat untuk menggunakan fitur Premium.</p>`,
  };
};
