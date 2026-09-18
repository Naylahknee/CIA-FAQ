import { createHash, randomBytes, randomUUID } from "node:crypto";
import { env } from "cloudflare:workers";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "../db";
import { communitySessions, communityUsers } from "../db/schema";
import { ensureD1AuthSchema } from "./community-auth-schema";
import { createNeonSession, deleteNeonSession, neonAuthConfigured, neonSessionUser, resetNeonRateLimit, sha256, takeNeonRateLimit } from "./neon-auth";
export { hashPassword, passwordIterations, verifyPassword } from "./password-security";

const COOKIE_NAME = "__Host-cia_guide_session";
const SESSION_DAYS = 7;
type AuthAction = string;
type AuthLimit = { allowed: boolean; key: string; retryAfter: number };

function hex(bytes: Uint8Array) { return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join(""); }
function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }

export function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
export function emailVerificationConfigured() {
  if (!env.RESEND_API_KEY || !env.AUTH_EMAIL_FROM || !env.APP_ORIGIN) return false;
  try { return new URL(String(env.APP_ORIGIN)).protocol === "https:"; }
  catch { return false; }
}

export async function takeAuthAttempt(request: Request, action: AuthAction, email: string): Promise<AuthLimit> {
  const now = Date.now();
  const settings = action === "signin" ? { max: 5, windowMs: 15 * 60_000 } : { max: 5, windowMs: 60 * 60_000 };
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const identity = (action === "signup" || action === "account") ? ip : `${ip}\0${email}`;
  const key = tokenHash(`${action}\0${identity}`);
  const resetBefore = now - settings.windowMs;

  if (neonAuthConfigured()) {
    const result = await takeNeonRateLimit(key, settings.max, settings.windowMs);
    return { ...result, key };
  }

  await ensureD1AuthSchema();

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
  if (neonAuthConfigured()) return resetNeonRateLimit(key);
  await ensureD1AuthSchema();
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
  if (neonAuthConfigured()) {
    await createNeonSession(userId, sha256(token), expiresAt);
  } else {
    await ensureD1AuthSchema();
    await env.DB.prepare("DELETE FROM community_sessions WHERE expires_at <= ?").bind(Date.now()).run();
    await getDb().insert(communitySessions).values({ id: randomUUID(), userId, tokenHash: tokenHash(token), expiresAt, createdAt: new Date() });
    await env.DB.prepare(`DELETE FROM community_sessions
      WHERE user_id = ? AND id NOT IN (
        SELECT id FROM community_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
      )`).bind(userId, userId).run();
  }
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, { httpOnly: true, secure: true, sameSite: "strict", path: "/", expires: expiresAt });
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    if (neonAuthConfigured()) await deleteNeonSession(sha256(token));
    else await getDb().delete(communitySessions).where(eq(communitySessions.tokenHash, tokenHash(token)));
  }
  jar.set(COOKIE_NAME, "", { httpOnly: true, secure: true, sameSite: "strict", path: "/", expires: new Date(0) });
}

export async function getCommunityUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  if (neonAuthConfigured()) {
    const user = await neonSessionUser(sha256(token));
    return user ? { id: user.id, email: user.email, displayName: user.displayName, role: user.role, emailVerified: user.emailVerified, verificationRequired: emailVerificationConfigured() } : null;
  }
  await ensureD1AuthSchema();
  const rows = await getDb().select({ id: communityUsers.id, email: communityUsers.email, displayName: communityUsers.displayName, role: communityUsers.role, emailVerified: communityUsers.emailVerified })
    .from(communitySessions).innerJoin(communityUsers, eq(communitySessions.userId, communityUsers.id))
    .where(and(eq(communitySessions.tokenHash, tokenHash(token)), gt(communitySessions.expiresAt, new Date()))).limit(1);
  return rows[0] ? { ...rows[0], verificationRequired: emailVerificationConfigured() } : null;
}

export async function requireCommunityUser() {
  const user = await getCommunityUser();
  if (!user) throw new Response("Sign in required", { status: 401, headers: { "cache-control": "no-store" } });
  if (user.verificationRequired && !user.emailVerified) throw new Response("Verify your email in Account settings before using the community.", { status: 403, headers: { "cache-control": "no-store" } });
  return user;
}

export async function validSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}
