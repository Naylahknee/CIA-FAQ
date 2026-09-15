import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
export const digest = (s: string) => createHash('sha256').update(s).digest('hex');
export const randomToken = () => randomBytes(32).toString('hex');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function base32(bytes: Uint8Array) {
  let bits = 0, value = 0, out = '';
  for (const b of bytes) { value = (value << 8) | b; bits += 8; while (bits >= 5) { out += alphabet[(value >>> (bits -= 5)) & 31]; } }
  if (bits) out += alphabet[(value << (5 - bits)) & 31];
  return out;
}
export function totp(secret: string, step: number) {
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(step));
  const h = createHmac('sha1', Buffer.from(secret, 'hex')).update(counter).digest();
  return ((h.readUInt32BE(h[19] & 15) & 0x7fffffff) % 1000000).toString().padStart(6, '0');
}
export function matchingStep(secret: string, code: string, now = Date.now()) {
  if (!/^\d{6}$/.test(code)) return -1;
  const step = Math.floor(now / 30000);
  for (const candidate of [step, step - 1, step + 1]) {
    if (candidate >= 0 && timingSafeEqual(Buffer.from(totp(secret, candidate)), Buffer.from(code))) return candidate;
  }
  return -1;
}
async function key(value: string) {
  if (!/^[0-9a-f]{64}$/i.test(value)) throw new Error('AUTH_ENCRYPTION_KEY must be a 32-byte hex secret');
  return crypto.subtle.importKey('raw', Buffer.from(value, 'hex'), 'AES-GCM', false, ['encrypt', 'decrypt']);
}
export async function seal(value: string, secret: string, userId: string) {
  const iv = randomBytes(12);
  const ciphertext = await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:Buffer.from(userId)}, await key(secret), Buffer.from(value));
  return `${iv.toString('hex')}.${Buffer.from(ciphertext).toString('hex')}`;
}
export async function unseal(value: string, secret: string, userId: string) {
  const [iv, data] = value.split('.');
  const plaintext = await crypto.subtle.decrypt({name:'AES-GCM',iv:Buffer.from(iv,'hex'),additionalData:Buffer.from(userId)},await key(secret),Buffer.from(data,'hex'));
  return Buffer.from(plaintext).toString();
}
