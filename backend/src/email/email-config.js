import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

export const getEmailConfig = () => {
  const config = env.email;
  let url;
  try { url = new URL(env.frontendUrl); } catch { /* validated below */ }
  const provider = config.provider ?? 'resend';
  const smtp = config.smtp;
  const providerValid = provider === 'resend' ? Boolean(config.apiKey) : provider === 'smtp' &&
    smtp && typeof smtp.host === 'string' && smtp.host.length > 0 && !/[\s/]/.test(smtp.host) &&
    Number.isInteger(smtp.port) && smtp.port > 0 && smtp.port <= 65535 &&
    typeof smtp.secure === 'boolean' && smtp.secureValid !== false &&
    !(smtp.port === 465 && !smtp.secure) && !(smtp.port === 587 && smtp.secure) &&
    Boolean(smtp.user && smtp.pass) && !/[\r\n]/.test(smtp.user);
  if (!config.enabled || !providerValid || !config.from || /[\r\n]/.test(config.from) ||
      !/^[a-f0-9]{64}$/i.test(config.encryptionKey ?? '') || !url ||
      !['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      (env.nodeEnv === 'production' && url.protocol !== 'https:')) {
    throw new AppError('Email service is not configured', 503, 'EMAIL_UNAVAILABLE');
  }
  return { ...config, provider, frontendUrl: url.origin };
};
