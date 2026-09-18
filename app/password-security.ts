import { timingSafeEqual } from "node:crypto";

// Cloudflare Workers' native PBKDF2 implementation caps the work factor at
// 100,000. Use that supported maximum so password derivation stays native and
// does not exhaust the Worker's JavaScript CPU budget.
export const passwordIterations = { current: 100_000, legacy: 210_000 } as const;
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
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations },
    baseKey,
    256,
  );
  return new Uint8Array(bits);
}

function randomHex(length: number) {
  return hex(crypto.getRandomValues(new Uint8Array(length)));
}

export async function hashPassword(password: string, salt = randomHex(16), iterations = passwordIterations.current) {
  return { salt, hash: hex(await derivePassword(password, salt, iterations)), iterations };
}

export function passwordError(password: string) {
  if (password.length < 12 || password.length > 128) return "Use a password with 12–128 characters.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return "Use at least one uppercase letter, lowercase letter, number, and symbol.";
  }
  return "";
}

export async function verifyPassword(password: string, salt: string, expected: string, iterations: number = passwordIterations.legacy) {
  const actual = await derivePassword(password, salt, iterations);
  const target = fromHex(expected);
  return actual.length === target.length && timingSafeEqual(Buffer.from(actual), Buffer.from(target));
}
