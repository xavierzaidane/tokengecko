import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY =
  process.env.ENCRYPTION_SECRET ||
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ||
  'tokengecko-default-aes-256-gcm-master-key-32b!';

function getDerivedKey(): Buffer {
  return crypto.createHash('sha256').update(SECRET_KEY).digest();
}

export function encryptKey(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const key = getDerivedKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptKey(encryptedString: string): string {
  try {
    const parts = encryptedString.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }

    const [ivHex, authTagHex, encryptedText] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getDerivedKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err);
    throw new Error('Failed to decrypt API key');
  }
}

export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '••••••••';
  const prefix = key.slice(0, 4);
  const suffix = key.slice(-4);
  return `${prefix}••••${suffix}`;
}
