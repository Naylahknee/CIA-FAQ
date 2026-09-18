import { createHash } from "node:crypto";
import { env } from "cloudflare:workers";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export type NeonUser = {
  id: string;
  email: string;
  displayName: string;
  role: "member" | "moderator";
  emailVerified: boolean;
  passwordHash: string | null;
  passwordSalt: string | null;
  passwordIterations: number | null;
};

export type NeonSecurityRow = {
  id: string;
  email: string;
  email_verified: number;
  mfa_secret: string | null;
  mfa_pending: string | null;
  mfa_last_step: number;
  password_hash: string;
  password_salt: string;
  password_iterations: number;
};

let cachedUrl = "";
let cachedSql: NeonQueryFunction<false, false> | null = null;

function configuredUrl() {
  return String((env as unknown as Record<string, unknown>).DATABASE_URL ?? "").trim();
}

export function neonAuthConfigured() {
  return /^postgres(ql)?:\/\//i.test(configuredUrl());
}

export function getNeonAuthDb() {
  const url = configuredUrl();
  if (!/^postgres(ql)?:\/\//i.test(url)) throw new Error("Neon authentication is not configured.");
  if (!cachedSql || cachedUrl !== url) {
    cachedUrl = url;
    cachedSql = neon(url);
  }
  return cachedSql;
}

function mapUser(row: Record<string, unknown> | undefined): NeonUser | null {
  if (!row) return null;
  return {
    id: String(row.id),
    email: String(row.email),
    displayName: String(row.display_name),
    role: row.role === "moderator" ? "moderator" : "member",
    emailVerified: Boolean(row.email_verified_at),
    passwordHash: row.password_hash == null ? null : String(row.password_hash),
    passwordSalt: row.password_salt == null ? null : String(row.password_salt),
    passwordIterations: row.password_iterations == null ? null : Number(row.password_iterations),
  };
}

const userSelect = `SELECT u.id, u.email, u.display_name, u.role, u.email_verified_at,
  c.password_hash, c.password_salt, c.password_iterations
  FROM auth_users u LEFT JOIN auth_credentials c ON c.user_id = u.id`;

export async function neonUserByEmail(email: string) {
  const rows = await getNeonAuthDb().query(`${userSelect} WHERE u.email_normalized = $1 LIMIT 1`, [email]);
  return mapUser(rows[0] as Record<string, unknown> | undefined);
}

export async function neonUserById(id: string) {
  const rows = await getNeonAuthDb().query(`${userSelect} WHERE u.id = $1 LIMIT 1`, [id]);
  return mapUser(rows[0] as Record<string, unknown> | undefined);
}

export async function neonSecurityRowById(id: string): Promise<NeonSecurityRow | null> {
  const rows = await getNeonAuthDb().query(`SELECT u.id, u.email,
      CASE WHEN u.email_verified_at IS NULL THEN 0 ELSE 1 END AS email_verified,
      u.mfa_secret, u.mfa_pending, u.mfa_last_step,
      COALESCE(c.password_hash, '') AS password_hash,
      COALESCE(c.password_salt, '') AS password_salt,
      COALESCE(c.password_iterations, 600000) AS password_iterations
    FROM auth_users u LEFT JOIN auth_credentials c ON c.user_id = u.id WHERE u.id = $1 LIMIT 1`, [id]);
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    id: String(row.id), email: String(row.email), email_verified: Number(row.email_verified),
    mfa_secret: row.mfa_secret == null ? null : String(row.mfa_secret),
    mfa_pending: row.mfa_pending == null ? null : String(row.mfa_pending),
    mfa_last_step: Number(row.mfa_last_step), password_hash: String(row.password_hash),
    password_salt: String(row.password_salt), password_iterations: Number(row.password_iterations),
  };
}

export async function neonSecurityRowByEmail(email: string) {
  const user = await neonUserByEmail(email);
  return user ? neonSecurityRowById(user.id) : null;
}

export async function storeNeonAccountToken(userId: string, purpose: "verify" | "reset", tokenHash: string, expiresAt: Date) {
  const sql = getNeonAuthDb();
  await sql.transaction([
    sql.query("DELETE FROM auth_tokens WHERE user_id = $1 AND purpose = $2", [userId, purpose]),
    sql.query("INSERT INTO auth_tokens (token_hash, user_id, purpose, expires_at) VALUES ($1, $2, $3, $4)", [tokenHash, userId, purpose, expiresAt.toISOString()]),
  ]);
}

export async function deleteNeonAccountToken(tokenHash: string) {
  await getNeonAuthDb().query("DELETE FROM auth_tokens WHERE token_hash = $1", [tokenHash]);
}

export async function neonTokenUser(tokenHash: string, purpose: "verify" | "reset") {
  const rows = await getNeonAuthDb().query(`SELECT user_id FROM auth_tokens
    WHERE token_hash = $1 AND purpose = $2 AND expires_at > now() LIMIT 1`, [tokenHash, purpose]);
  return rows[0] ? String((rows[0] as Record<string, unknown>).user_id) : null;
}

export async function completeNeonVerification(userId: string, tokenHash: string) {
  const sql = getNeonAuthDb();
  await sql.transaction([
    sql.query("UPDATE auth_users SET email_verified_at = COALESCE(email_verified_at, now()), updated_at = now() WHERE id = $1", [userId]),
    sql.query("DELETE FROM auth_sessions WHERE user_id = $1", [userId]),
    sql.query("DELETE FROM auth_tokens WHERE user_id = $1 AND token_hash = $2 AND purpose = 'verify'", [userId, tokenHash]),
  ]);
}

export async function completeNeonPasswordReset(userId: string, tokenHash: string, hash: string, salt: string, iterations: number) {
  const sql = getNeonAuthDb();
  await sql.transaction([
    sql.query(`INSERT INTO auth_credentials (user_id,password_hash,password_salt,password_iterations,changed_at)
      VALUES ($1,$2,$3,$4,now()) ON CONFLICT(user_id) DO UPDATE SET password_hash=EXCLUDED.password_hash,
      password_salt=EXCLUDED.password_salt,password_iterations=EXCLUDED.password_iterations,changed_at=now()`, [userId, hash, salt, iterations]),
    sql.query("DELETE FROM auth_sessions WHERE user_id = $1", [userId]),
    sql.query("DELETE FROM auth_tokens WHERE user_id = $1 AND token_hash = $2 AND purpose = 'reset'", [userId, tokenHash]),
  ]);
}

export async function createNeonPasswordUser(input: {
  id: string; email: string; displayName: string; passwordHash: string; passwordSalt: string; passwordIterations: number;
}) {
  const sql = getNeonAuthDb();
  await sql.transaction([
    sql.query(`INSERT INTO auth_users (id, email, email_normalized, display_name)
      VALUES ($1, $2, $3, $4)`, [input.id, input.email, input.email, input.displayName]),
    sql.query(`INSERT INTO auth_credentials (user_id, password_hash, password_salt, password_iterations)
      VALUES ($1, $2, $3, $4)`, [input.id, input.passwordHash, input.passwordSalt, input.passwordIterations]),
  ]);
}

export async function findOrCreateGoogleUser(input: { subject: string; email: string; displayName: string }) {
  const sql = getNeonAuthDb();
  const account = await sql.query(`SELECT u.id, u.email, u.display_name, u.role, u.email_verified_at,
      c.password_hash, c.password_salt, c.password_iterations
    FROM auth_oauth_accounts o JOIN auth_users u ON u.id = o.user_id
    LEFT JOIN auth_credentials c ON c.user_id = u.id
    WHERE o.provider = 'google' AND o.provider_subject = $1 LIMIT 1`, [input.subject]);
  const found = mapUser(account[0] as Record<string, unknown> | undefined);
  if (found) return found;

  const id = crypto.randomUUID();
  const users = await sql.query(`INSERT INTO auth_users (id, email, email_normalized, display_name, email_verified_at)
    VALUES ($1, $2, $3, $4, now())
    ON CONFLICT (email_normalized) DO UPDATE SET
      email_verified_at = COALESCE(auth_users.email_verified_at, now()), updated_at = now()
    RETURNING id, email, display_name, role, email_verified_at`, [id, input.email, input.email, input.displayName]);
  const userId = String((users[0] as Record<string, unknown>).id);
  await sql.query(`INSERT INTO auth_oauth_accounts (provider, provider_subject, user_id)
    VALUES ('google', $1, $2)
    ON CONFLICT (provider, provider_subject) DO UPDATE SET user_id = EXCLUDED.user_id`, [input.subject, userId]);
  return (await neonUserById(userId))!;
}

export async function updateNeonPassword(userId: string, passwordHash: string, passwordSalt: string, passwordIterations: number) {
  await getNeonAuthDb().query(`INSERT INTO auth_credentials (user_id, password_hash, password_salt, password_iterations, changed_at)
    VALUES ($1, $2, $3, $4, now())
    ON CONFLICT (user_id) DO UPDATE SET password_hash = EXCLUDED.password_hash,
      password_salt = EXCLUDED.password_salt, password_iterations = EXCLUDED.password_iterations, changed_at = now()`,
    [userId, passwordHash, passwordSalt, passwordIterations]);
}

export async function createNeonSession(userId: string, tokenHash: string, expiresAt: Date) {
  const sql = getNeonAuthDb();
  await sql.query("DELETE FROM auth_sessions WHERE expires_at <= now()");
  await sql.query(`INSERT INTO auth_sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)`,
    [crypto.randomUUID(), userId, tokenHash, expiresAt.toISOString()]);
  await sql.query(`DELETE FROM auth_sessions WHERE user_id = $1 AND id NOT IN
    (SELECT id FROM auth_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5)`, [userId]);
}

export async function deleteNeonSession(tokenHash: string) {
  await getNeonAuthDb().query("DELETE FROM auth_sessions WHERE token_hash = $1", [tokenHash]);
}

export async function neonSessionUser(tokenHash: string) {
  const rows = await getNeonAuthDb().query(`SELECT u.id, u.email, u.display_name, u.role, u.email_verified_at,
      c.password_hash, c.password_salt, c.password_iterations
    FROM auth_sessions s JOIN auth_users u ON u.id = s.user_id
    LEFT JOIN auth_credentials c ON c.user_id = u.id
    WHERE s.token_hash = $1 AND s.expires_at > now() LIMIT 1`, [tokenHash]);
  return mapUser(rows[0] as Record<string, unknown> | undefined);
}

export async function takeNeonRateLimit(key: string, max: number, windowMs: number) {
  const rows = await getNeonAuthDb().query(`INSERT INTO auth_rate_limits (key, attempts, window_start)
    VALUES ($1, 1, now())
    ON CONFLICT (key) DO UPDATE SET
      attempts = CASE WHEN auth_rate_limits.window_start <= now() - ($2 * interval '1 millisecond') THEN 1 ELSE auth_rate_limits.attempts + 1 END,
      window_start = CASE WHEN auth_rate_limits.window_start <= now() - ($2 * interval '1 millisecond') THEN now() ELSE auth_rate_limits.window_start END
    RETURNING attempts, extract(epoch FROM (window_start + ($2 * interval '1 millisecond') - now())) AS retry_after`, [key, windowMs]);
  const row = rows[0] as Record<string, unknown>;
  return { allowed: Number(row.attempts) <= max, retryAfter: Math.max(1, Math.ceil(Number(row.retry_after))) };
}

export async function resetNeonRateLimit(key: string) {
  await getNeonAuthDb().query("DELETE FROM auth_rate_limits WHERE key = $1", [key]);
}

export async function mirrorCommunityUser(user: NeonUser, credentials?: { hash: string; salt: string; iterations: number }) {
  const { ensureD1AuthSchema } = await import("./community-auth-schema");
  await ensureD1AuthSchema();
  const password = credentials ?? { hash: user.passwordHash ?? "", salt: user.passwordSalt ?? "", iterations: user.passwordIterations ?? 600000 };
  await env.DB.prepare(`INSERT INTO community_users
    (id,email,display_name,password_hash,password_salt,password_iterations,email_verified,role,created_at)
    VALUES (?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET email=excluded.email,display_name=excluded.display_name,
      email_verified=excluded.email_verified,role=excluded.role`)
    .bind(user.id, user.email, user.displayName, password.hash, password.salt, password.iterations, user.emailVerified ? 1 : 0, user.role, Date.now()).run();
  if (credentials) {
    await env.DB.prepare("UPDATE community_users SET password_hash=?,password_salt=?,password_iterations=? WHERE id=?")
      .bind(credentials.hash, credentials.salt, credentials.iterations, user.id).run();
  }
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
