import { randomBytes, timingSafeEqual } from "node:crypto";

export const passwordIterations = { current: 600_000, legacy: 210_000 } as const;
const encoder = new TextEncoder();

function hex(bytes: Uint8Array) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(value: string) {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2) return new Uint8Array();
  return Uint8Array.from(value.match(/.{2}/g) ?? [], byte => Number.parseInt(byte, 16));
}

async function derivePassword(password: string, salt: string, iterations: number) {
  const saltBytes = iterations === passwordIterations.legacy ? encoder.encode(salt) : fromHex(salt);
  const baseKey = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations }, baseKey, 256);
  return new Uint8Array(bits);
}

export async function hashPassword(password: string, salt = hex(randomBytes(16)), iterations = passwordIterations.current) {
  return { salt, hash: hex(await derivePassword(password, salt, iterations)), iterations };
}

export async function verifyPassword(password: string, salt: string, expected: string, iterations = passwordIterations.legacy) {
  const actual = await derivePassword(password, salt, iterations);
  const target = fromHex(expected);
  return actual.length === target.length && timingSafeEqual(Buffer.from(actual), Buffer.from(target));
}
