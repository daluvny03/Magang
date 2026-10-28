import { forgotPassword, resetPassword } from '../services/password-reset.service.js';

export const requestPasswordReset = async (req, res, next) => {
  try {
    await forgotPassword(req.body.email);
    return res.status(202).json({ success: true,
      message: 'Jika email terhubung ke akun aktif, tautan reset akan dikirim. Periksa juga folder spam.' });
  } catch (error) { next(error); }
};

export const completePasswordReset = async (req, res, next) => {
  try {
    const result = await resetPassword(req.body);
    return res.json({ success: true, data: result,
      message: 'Password berhasil diubah. Silakan masuk kembali menggunakan password baru.' });
  } catch (error) { next(error); }
};
