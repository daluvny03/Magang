import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

export const createVerificationToken = () => randomBytes(32).toString('hex');
export const hashVerificationToken = (token) => createHash('sha256').update(token).digest('hex');

const readKey = (key) => {
  if (!/^[a-f0-9]{64}$/i.test(key ?? '')) throw new Error('Invalid email encryption key');
  return Buffer.from(key, 'hex');
};

export const encryptEmailPayload = (payload, key, id) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', readKey(key), iv);
  cipher.setAAD(Buffer.from(id));
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64')).join('.');
};

export const decryptEmailPayload = (value, key, id) => {
  const [iv, tag, ciphertext] = value.split('.').map((part) => Buffer.from(part, 'base64'));
  const decipher = createDecipheriv('aes-256-gcm', readKey(key), iv);
  decipher.setAAD(Buffer.from(id));
  decipher.setAuthTag(tag);
  return JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8'));
};
