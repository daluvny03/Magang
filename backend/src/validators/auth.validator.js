import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .max(255)
    .required(),

  password: Joi.string()
    .min(8)
    .max(128)
    .required()
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .max(255)
    .required(),

  password: Joi.string()
    .required()
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().pattern(/^[a-f0-9]{64}$/).required()
});

export const resendVerificationSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(255).required()
});


export const forgotPasswordSchema = resendVerificationSchema;

export const resetPasswordSchema = Joi.object({
  token: Joi.string().pattern(/^[a-f0-9]{64}$/).required(),
  password: Joi.string().min(8).max(128).custom((value, helpers) => {
    // bcrypt only considers the first 72 UTF-8 bytes; never truncate a new reset password.
    return Buffer.byteLength(value, 'utf8') > 72 ? helpers.error('any.invalid') : value;
  }).messages({ 'any.invalid': 'Password terlalu panjang. Gunakan password yang lebih pendek.' }).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({ 'any.only': 'Konfirmasi password tidak cocok.' })
});

export const googleLoginSchema = Joi.object({
  credential: Joi.string()
    .trim()
    .min(1)
    .max(8192)
    .required()
}).unknown(false);