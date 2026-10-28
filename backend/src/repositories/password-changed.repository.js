import { randomUUID } from 'node:crypto';
import { prepareNotificationPayload } from './notification-payload.repository.js';
import { passwordChangedMessage } from '../email/password-changed-template.js';

// Called inside the password transaction; no provider or encryption config needed.
export const queuePasswordChanged = async (client, user) => {
  await client.query(`INSERT INTO public.email_outbox
    (id, user_id, kind, recipient_email, event_auth_version, expires_at)
    VALUES ($1, $2, 'password_changed', $3, $4, clock_timestamp() + INTERVAL '24 hours')
    ON CONFLICT (user_id, event_auth_version) WHERE kind = 'password_changed' DO NOTHING`,
  [randomUUID(), user.id, user.email, user.auth_version]);
};

export const preparePasswordChanged = (id, config) => prepareNotificationPayload(
  id, 'password_changed', config,
  (event, settings) => passwordChangedMessage({ from: settings.from, to: event.recipient_email,
    frontendUrl: settings.frontendUrl, changedAt: event.created_at }),
);
