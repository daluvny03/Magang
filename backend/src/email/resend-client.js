import axios from 'axios';

export const sendEmail = async ({ apiKey, payload, idempotencyKey }) => {
  const response = await axios.post('https://api.resend.com/emails', payload, {
    timeout: 10000,
    maxRedirects: 0,
    headers: { Authorization: `Bearer ${apiKey}`, 'Idempotency-Key': idempotencyKey },
  });
  if (typeof response.data?.id !== 'string') throw new Error('Invalid email response');
  return response.data.id;
};
