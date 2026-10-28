import { normalizeEmail } from '../utils/email.js';
import { randomUUID } from 'node:crypto';
import { getEmailConfig } from '../email/email-config.js';
import { createVerificationToken, hashVerificationToken, encryptEmailPayload } from '../email/verification-crypto.js';
import { verificationMessage } from '../email/verification-template.js';
import {
  withVerificationTransaction, lockVerificationUser, canIssueVerification,
  saveVerification, consumeVerification,
} from '../repositories/email-verification.repository.js';
import { AppError } from '../utils/app-error.js';

export const queueVerification = async (client, user) => {
  const config = getEmailConfig();
  const token = createVerificationToken();
  const outboxId = randomUUID();
  const payload = verificationMessage({ from: config.from, to: normalizeEmail(user.email), frontendUrl: config.frontendUrl, token });
  await saveVerification(client, {
    id: randomUUID(), userId: user.id, email: user.email,
    hash: hashVerificationToken(token), outboxId,
    payload: encryptEmailPayload(payload, config.encryptionKey, outboxId),
  });
};

export const resendVerification = async (email) => {
  getEmailConfig();
  await withVerificationTransaction(async (client) => {
    const user = await lockVerificationUser(client, email);
    if (!user || !user.is_active || user.email_verified_at || !user.email_verification_required) return;
    if (!await canIssueVerification(client, user.id)) return;
    await queueVerification(client, user);
  });
};

export const verifyEmail = async (token) => {
  const verified = await withVerificationTransaction((client) =>
    consumeVerification(client, hashVerificationToken(token)));
  if (!verified) throw new AppError(
    'Tautan verifikasi tidak valid, sudah digunakan, atau kedaluwarsa. Silakan masuk atau minta tautan baru.',
    400, 'INVALID_VERIFICATION_TOKEN');
};
