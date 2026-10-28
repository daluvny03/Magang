import { normalizeEmail } from '../utils/email.js';
import bcrypt from 'bcryptjs';
import { randomUUID, randomInt } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { performance } from 'node:perf_hooks';
import { getEmailConfig } from '../email/email-config.js';
import { createVerificationToken as createToken, hashVerificationToken as hashToken, encryptEmailPayload } from '../email/verification-crypto.js';
import { passwordResetMessage } from '../email/password-reset-template.js';
import { withTransaction } from '../utils/transaction.js';
import { AppError } from '../utils/app-error.js';
import {
  lockResetUser, canIssuePasswordReset, savePasswordReset, isPasswordResetUsable, consumePasswordReset,
} from '../repositories/password-reset.repository.js';

export const forgotPassword = async (email) => {
  email = normalizeEmail(email);
  const startedAt = performance.now();
  const minimumDuration = 300 + randomInt(0, 51);
  try {
    const config = getEmailConfig();
    // Prepare the same crypto work for both existing and unknown addresses.
    const token = createToken();
    const hash = hashToken(token);
    const outboxId = randomUUID();
    const payload = encryptEmailPayload(passwordResetMessage({
      from: config.from, to: email, frontendUrl: config.frontendUrl, token,
    }), config.encryptionKey, outboxId);
    await withTransaction(async (client) => {
      const user = await lockResetUser(client, email);
      if (!user || !user.is_active || !user.has_password || !await canIssuePasswordReset(client, user.id)) return;
      await savePasswordReset(client, { id: randomUUID(), user, hash, outboxId, payload });
    });
  } finally {
    // Avoid a fast account-existence branch; provider work happens in the worker.
    await delay(Math.max(0, minimumDuration - (performance.now() - startedAt)));
  }
};

const invalidReset = () => new AppError(
  'Tautan reset tidak valid, sudah digunakan, atau kedaluwarsa. Silakan minta tautan baru.',
  400, 'INVALID_RESET_TOKEN');

export const resetPassword = async ({ token, password }) => {
  const hash = hashToken(token);
  if (!await isPasswordResetUsable(hash)) throw invalidReset();
  const passwordHash = await bcrypt.hash(password, 12);
  const reset = await withTransaction((client) => consumePasswordReset(client, hash, passwordHash));
  if (!reset) throw invalidReset();
  return { userId: reset };
};
