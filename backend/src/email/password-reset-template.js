export const passwordResetMessage = ({ from, to, frontendUrl, token }) => {
  // Both origin and token come from validated configuration / server crypto.
  const link = `${frontendUrl}/reset-password#token=${encodeURIComponent(token)}`;
  return {
    from, to: [to], subject: 'Reset password akun Halobakat',
    text: `Untuk mengganti password akun Anda, buka ${link} lalu isi password baru. Tautan berlaku 30 menit dan hanya dapat digunakan sekali. Jika Anda tidak meminta reset, abaikan email ini; password Anda tidak berubah.`,
    html: `<h1>Reset password</h1><p>Buka tautan berikut dan isi password baru Anda.</p><p><a href="${link}">Reset Password</a></p><p>Tautan berlaku 30 menit dan hanya dapat digunakan sekali.</p><p>Jika Anda tidak meminta reset, abaikan email ini. Password Anda tidak berubah.</p>`,
  };
};
