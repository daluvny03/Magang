import { subscriptionExpiredMessage } from '../email/subscription-expired-template.js';
import { randomUUID } from 'node:crypto';
import { prepareNotificationPayload } from './notification-payload.repository.js';
import { subscriptionActivatedMessage } from '../email/subscription-activated-template.js';

// Same transaction as subscription application. Never call the provider here.
export const queueSubscriptionActivated = async (client, { user, paymentId, snapshot }) => {
  await client.query(`INSERT INTO public.email_outbox
    (id, user_id, kind, recipient_email, payment_id, subscription_snapshot, expires_at)
    VALUES ($1, $2, 'subscription_activated', $3, $4, $5, clock_timestamp() + INTERVAL '24 hours')
    ON CONFLICT (payment_id) WHERE kind = 'subscription_activated' DO NOTHING`,
  [randomUUID(), user.id, user.email, paymentId, JSON.stringify(snapshot)]);
};

export const prepareSubscriptionActivated = (id, config) => prepareNotificationPayload(
  id, 'subscription_activated', config,
  (event, settings) => subscriptionActivatedMessage({ from: settings.from,
    to: event.recipient_email, ...event.subscription_snapshot }),
);

export const prepareSubscriptionExpired = (id, config) => prepareNotificationPayload(
  id, 'subscription_expired', config,
  (event, settings) => subscriptionExpiredMessage({ from: settings.from,
    to: event.recipient_email, ...event.subscription_snapshot }),
);
