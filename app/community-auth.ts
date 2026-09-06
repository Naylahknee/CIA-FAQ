import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { getDb } from "../db";
import { communitySessions, communityUsers } from "../db/schema";

const COOKIE_NAME = "mva_community_session";
const SESSION_DAYS = 30;

function hex(bytes: Uint8Array) { return Buffer.from(bytes).toString("hex"); }
function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }

export function normalizeEmail(email: string) { return email.trim().toLowerCase(); }

export function hashPassword(password: string, salt = hex(randomBytes(16))) {
  return { salt, hash: pbkdf2Sync(password, salt, 210_000, 32, "sha256").toString("hex") };
}

export function verifyPassword(password: string, salt: string, expected: string) {
  const actual = Buffer.from(hashPassword(password, salt).hash, "hex");
  const target = Buffer.from(expected, "hex");
  return actual.length === target.length && timingSafeEqual(actual, target);
}

export async function createSession(userId: string) {
  const token = hex(randomBytes(32));
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await getDb().insert(communitySessions).values({ id: crypto.randomUUID(), userId, tokenHash: tokenHash(token), expiresAt, createdAt: new Date() });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", expires: expiresAt });
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) await getDb().delete(communitySessions).where(eq(communitySessions.tokenHash, tokenHash(token)));
  jar.delete(COOKIE_NAME);
}

export async function getCommunityUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const rows = await getDb().select({ id: communityUsers.id, email: communityUsers.email, displayName: communityUsers.displayName, role: communityUsers.role })
    .from(communitySessions).innerJoin(communityUsers, eq(communitySessions.userId, communityUsers.id))
    .where(and(eq(communitySessions.tokenHash, tokenHash(token)), gt(communitySessions.expiresAt, new Date()))).limit(1);
  return rows[0] ?? null;
}

export async function requireCommunityUser() {
  const user = await getCommunityUser();
  if (!user) throw new Response("Sign in required", { status: 401 });
  return user;
}

export async function validSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = (await headers()).get("host");
  return Boolean(host && new URL(origin).host === host);
}
