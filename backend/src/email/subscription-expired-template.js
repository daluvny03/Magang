export const subscriptionExpiredMessage = ({ from, to, tierName, expiredAt }) => {
  const expiration = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Jakarta',
  }).format(new Date(expiredAt));
  const name = String(tierName).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  return {
    from, to: [to], subject: 'Masa subscription Halobakat telah berakhir',
    text: `Masa aktif paket ${tierName} telah berakhir pada ${expiration} WIB. Untuk kembali menggunakan fitur Premium, masuk ke akun Halobakat dan lakukan pembelian paket Premium.`,
    html: `<h1>Masa subscription telah berakhir</h1><p>Masa aktif paket ${name} telah berakhir pada ${expiration} WIB.</p><p>Untuk kembali menggunakan fitur Premium, masuk ke akun Halobakat dan lakukan pembelian paket Premium.</p>`,
  };
};
