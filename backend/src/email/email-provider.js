import { sendEmail as sendResendEmail } from './resend-client.js';
import { sendSmtpEmail } from './smtp-client.js';

export const sendEmail = (config, args) => {
  const provider = config.provider ?? 'resend';
  if (provider === 'resend') return sendResendEmail(args);
  if (provider === 'smtp') return sendSmtpEmail({ ...args, smtp: config.smtp });
  throw new Error('Unsupported email provider');
};

export const classifyEmailError = (error, provider) => {
  if (provider === 'smtp') {
    const status = error.responseCode;
    if (Number.isInteger(status) && status >= 400 && status <= 599) {
      return { code: `SMTP_${status}`, permanent: status >= 500 };
    }
    const known = ['EAUTH', 'EENVELOPE', 'EMESSAGE', 'ETIMEDOUT', 'ECONNECTION', 'ESOCKET', 'EDNS',
      'ECONNRESET', 'ECONNREFUSED', 'ETLS'];
    const code = known.includes(error.code) ? error.code : 'DELIVERY_ERROR';
    return { code: `SMTP_${code}`, permanent: ['EAUTH', 'EENVELOPE', 'EMESSAGE', 'ETLS'].includes(code) };
  }
  const status = error.response?.status;
  return { code: Number.isInteger(status) ? `PROVIDER_HTTP_${status}` : 'DELIVERY_ERROR',
    permanent: [400, 401, 403, 404, 422].includes(status) };
};
