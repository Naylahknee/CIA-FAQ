import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "cloudflare:workers";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "../db";
import { communitySessions, communityUsers } from "../db/schema";

const COOKIE_NAME = "__Host-cia_guide_session";
const SESSION_DAYS = 7;
const CURRENT_PASSWORD_ITERATIONS = 600_000;
const LEGACY_PASSWORD_ITERATIONS = 210_000;
const encoder = new TextEncoder();

type AuthAction = "signin" | "signup";
type AuthLimit = { allowed: boolean; key: string; retryAfter: number };

function hex(bytes: Uint8Array) { return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join(""); }
function fromHex(value: string) {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2) return new Uint8Array();
  return Uint8Array.from(value.match(/.{2}/g) ?? [], byte => Number.parseInt(byte, 16));
}
function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }

async function derivePassword(password: string, salt: string, iterations: number) {
  const baseKey = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: fromHex(salt), iterations }, baseKey, 256);
  return new Uint8Array(bits);
}

export function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
export const passwordIterations = { current: CURRENT_PASSWORD_ITERATIONS, legacy: LEGACY_PASSWORD_ITERATIONS };

export async function hashPassword(password: string, salt = hex(randomBytes(16)), iterations = CURRENT_PASSWORD_ITERATIONS) {
  return { salt, hash: hex(await derivePassword(password, salt, iterations)), iterations };
}

export async function verifyPassword(password: string, salt: string, expected: string, iterations = LEGACY_PASSWORD_ITERATIONS) {
  const actual = await derivePassword(password, salt, iterations);
  const target = fromHex(expected);
  return actual.length === target.length && timingSafeEqual(Buffer.from(actual), Buffer.from(target));
}

export async function takeAuthAttempt(request: Request, action: AuthAction, email: string): Promise<AuthLimit> {
  const now = Date.now();
  const settings = action === "signin" ? { max: 5, windowMs: 15 * 60_000 } : { max: 5, windowMs: 60 * 60_000 };
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const identity = action === "signup" ? ip : `${ip}\0${email}`;
  const key = tokenHash(`${action}\0${identity}`);
  const resetBefore = now - settings.windowMs;

  await env.DB.prepare(`INSERT INTO auth_rate_limits (key, attempts, window_start)
    VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET
      attempts = CASE WHEN window_start <= ? THEN 1 ELSE attempts + 1 END,
      window_start = CASE WHEN window_start <= ? THEN ? ELSE window_start END`)
    .bind(key, now, resetBefore, resetBefore, now).run();

  const row = await env.DB.prepare("SELECT attempts, window_start AS windowStart FROM auth_rate_limits WHERE key = ?")
    .bind(key).first<{ attempts: number; windowStart: number }>();
  const retryAfter = row ? Math.max(1, Math.ceil((row.windowStart + settings.windowMs - now) / 1000)) : 1;
  return { allowed: Boolean(row && row.attempts <= settings.max), key, retryAfter };
}

export async function resetAuthLimit(key: string) {
  await env.DB.prepare("DELETE FROM auth_rate_limits WHERE key = ?").bind(key).run();
}

export function noStoreJson(body: object, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("cache-control", "no-store");
  headers.set("pragma", "no-cache");
  return Response.json(body, { ...init, headers });
}

export async function createSession(userId: string) {
  const token = hex(randomBytes(32));
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await env.DB.prepare("DELETE FROM community_sessions WHERE expires_at <= ?").bind(Date.now()).run();
  await getDb().insert(communitySessions).values({ id: crypto.randomUUID(), userId, tokenHash: tokenHash(token), expiresAt, createdAt: new Date() });
  await env.DB.prepare(`DELETE FROM community_sessions
    WHERE user_id = ? AND id NOT IN (
      SELECT id FROM community_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
    )`).bind(userId, userId).run();
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, { httpOnly: true, secure: true, sameSite: "strict", path: "/", expires: expiresAt });
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) await getDb().delete(communitySessions).where(eq(communitySessions.tokenHash, tokenHash(token)));
  jar.set(COOKIE_NAME, "", { httpOnly: true, secure: true, sameSite: "strict", path: "/", expires: new Date(0) });
}

export async function getCommunityUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const rows = await getDb().select({ id: communityUsers.id, email: communityUsers.email, displayName: communityUsers.displayName, role: communityUsers.role })
    .from(communitySessions).innerJoin(communityUsers, eq(communitySessions.userId, communityUsers.id))
    .where(and(eq(communitySessions.tokenHash, tokenHash(token)), gt(communitySessions.expiresAt, new Date()))).limit(1);
  return rows[0] ?? null;
}

export async function requireCommunityUser() {
  const user = await getCommunityUser();
  if (!user) throw new Response("Sign in required", { status: 401, headers: { "cache-control": "no-store" } });
  return user;
}

export async function validSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}
