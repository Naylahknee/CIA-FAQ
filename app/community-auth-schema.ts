import { env } from "cloudflare:workers";

let ready: Promise<void> | null = null;

async function addMissingColumn(table: string, column: string, definition: string) {
  const rows = await env.DB.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
  if (!rows.results.some((row: { name: string }) => row.name === column)) {
    await env.DB.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
  }
}

async function prepareSchema() {
  await addMissingColumn("community_users", "password_iterations", "INTEGER NOT NULL DEFAULT 210000");
  await addMissingColumn("community_users", "email_verified", "INTEGER NOT NULL DEFAULT 0");
  await addMissingColumn("community_users", "mfa_secret", "TEXT");
  await addMissingColumn("community_users", "mfa_pending", "TEXT");
  await addMissingColumn("community_users", "mfa_last_step", "INTEGER NOT NULL DEFAULT -1");
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS auth_rate_limits (key TEXT PRIMARY KEY NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, window_start INTEGER NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS account_tokens (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES community_users(id) ON DELETE CASCADE, purpose TEXT NOT NULL, expires_at INTEGER NOT NULL)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS account_tokens_user ON account_tokens(user_id)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS recovery_codes (code_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES community_users(id) ON DELETE CASCADE)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_recovery_codes_user ON recovery_codes(user_id)"),
  ]);
}

export function ensureD1AuthSchema() {
  ready ??= prepareSchema().catch(error => {
    ready = null;
    throw error;
  });
  return ready;
}
