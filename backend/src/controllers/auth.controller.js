import { verifyEmail, resendVerification } from '../services/email-verification.service.js';
import {
  registerUser,
  loginUser
} from '../services/auth.service.js';
import {
  loginOrRegisterWithGoogle
} from '../services/google-auth.service.js';

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: 'Akun berhasil dibuat. Silakan verifikasi email sebelum masuk.',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Authenticated user retrieved successfully',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const verify = async (req, res, next) => {
  try {
    await verifyEmail(req.body.token);
    return res.json({ success: true, message: 'Email berhasil diverifikasi. Silakan masuk.' });
  } catch (error) { next(error); }
};

export const resend = async (req, res, next) => {
  try {
    await resendVerification(req.body.email);
    return res.status(202).json({ success: true,
      message: 'Jika akun memerlukan verifikasi, tautan akan dikirim ke email tersebut. Periksa juga folder spam.' });
  } catch (error) { next(error); }
};

export const googleLogin = async (req, res, next) => {
  try {
    const result = await loginOrRegisterWithGoogle(
      req.body.credential
    );

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};