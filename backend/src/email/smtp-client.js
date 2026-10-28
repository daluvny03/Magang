import nodemailer from 'nodemailer';
import { createHash } from 'node:crypto';

// Bound DNS, connection, greeting and socket inactivity separately.
// Await transport completion: a Promise.race alone would leave a send running in the background.
export const createSmtpSender = (createTransport = nodemailer.createTransport) =>
  async ({ smtp, payload, idempotencyKey }) => {
    const transport = createTransport({
      host: smtp.host, port: smtp.port, secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
      requireTLS: !smtp.secure, tls: { rejectUnauthorized: true },
      pool: true, maxConnections: 1, maxMessages: 1, maxRequeues: 0,
      connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000, dnsTimeout: 5000,
      logger: false, debug: false, disableFileAccess: true, disableUrlAccess: true,
    });
    const messageId = `<${createHash('sha256').update(idempotencyKey).digest('hex')}@outbox.halobakat.invalid>`;
    try {
      const info = await transport.sendMail({ from: payload.from, to: payload.to, subject: payload.subject,
        text: payload.text, html: payload.html, messageId,
        disableFileAccess: true, disableUrlAccess: true });
      if (!info.accepted?.length || info.rejected?.length) {
        throw Object.assign(new Error('SMTP recipient rejected'), { code: 'EENVELOPE', responseCode: 550 });
      }
      return messageId;
    } finally {
      transport.close();
    }
  };

export const sendSmtpEmail = createSmtpSender();
