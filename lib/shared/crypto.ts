import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

import { SECRET_KEY } from './variables';

const ALGO = 'aes-256-cbc';

export const encrypt = (str: string): string => {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGO, Buffer.from(SECRET_KEY, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(str), cipher.final()]);

  return `${encrypted.toString('hex')}_${iv.toString('hex')}`;
};

export const decrypt = (str: string): string => {
  const [value, iv] = str.split('_');
  const encryptedText = Buffer.from(value, 'hex');
  const decipher = createDecipheriv(
    ALGO,
    Buffer.from(SECRET_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  );
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);

  return decrypted.toString();
};
